// ── CONFIG ───────────────────────────────────────────────────────────────────
// If testing on phone: change to your PC's local IP, e.g. "http://192.168.1.42:5000"
const BACKEND = "http://localhost:5000";

// ── DOM ──────────────────────────────────────────────────────────────────────
const video        = document.getElementById("video");
const canvas       = document.getElementById("canvas");
const ctx          = canvas.getContext("2d");
const captureBtn   = document.getElementById("captureBtn");
const retakeBtn    = document.getElementById("retakeBtn");
const screenCamera = document.getElementById("screen-camera");
const screenResult = document.getElementById("screen-result");
const spinner      = document.getElementById("spinner");
const hint         = document.getElementById("hint");
const card         = document.getElementById("card");

let objects = [];   // detections with cx/cy
let stream  = null; // MediaStream reference

// ── 1. Start camera on page load ─────────────────────────────────────────────
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",   // rear camera on phones
        width:  { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access denied or not available.\n" + err.message);
  }
}

startCamera();

// ── 2. Capture button → freeze frame → run detection ─────────────────────────
captureBtn.addEventListener("click", async () => {
  if (!stream) return;

  // Draw current video frame onto canvas
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Stop the live stream (freeze it)
  stream.getTracks().forEach(t => t.stop());

  // Switch screens
  screenCamera.classList.add("hidden");
  screenResult.classList.remove("hidden");
  card.classList.add("hidden");
  hint.classList.add("hidden");
  objects = [];

  // Resize canvas image → base64 → send to backend
  const resizedBase64 = resizeCanvas(canvas, 800);
  await runDetection(resizedBase64);
});

// ── 3. Retake button → restart camera ────────────────────────────────────────
retakeBtn.addEventListener("click", () => {
  screenResult.classList.add("hidden");
  screenCamera.classList.remove("hidden");
  card.classList.add("hidden");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects = [];
  startCamera();
});

// ── 4. Resize canvas content to max px, return base64 ────────────────────────
function resizeCanvas(sourceCanvas, maxPx) {
  let w = sourceCanvas.width;
  let h = sourceCanvas.height;

  if (Math.max(w, h) > maxPx) {
    const scale = maxPx / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const offscreen = document.createElement("canvas");
  offscreen.width  = w;
  offscreen.height = h;
  offscreen.getContext("2d").drawImage(sourceCanvas, 0, 0, w, h);

  // Update main canvas to resized version (so dots align correctly)
  canvas.width  = w;
  canvas.height = h;
  ctx.drawImage(offscreen, 0, 0);

  return offscreen.toDataURL("image/jpeg", 0.85);
}

// ── 5. Send to backend /detect ────────────────────────────────────────────────
async function runDetection(base64) {
  spinner.classList.remove("hidden");

  try {
    const res  = await fetch(`${BACKEND}/detect`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ image: base64 })
    });
    const data = await res.json();
    objects    = data.objects || [];
  } catch (err) {
    alert("Backend unreachable. Is Flask running?\n" + err.message);
    spinner.classList.add("hidden");
    return;
  }

  spinner.classList.add("hidden");
  drawDots();
  if (objects.length > 0) hint.classList.remove("hidden");
}

// ── 6. Draw dots on detected objects ─────────────────────────────────────────
function drawDots() {
  // Redraw frozen image first
  // (canvas already has the captured frame, just add dots on top)
  objects.forEach(obj => {
    const { x1, y1, x2, y2 } = obj.box;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;

    obj.cx = cx;
    obj.cy = cy;

    // Glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(108,99,255,0.25)";
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#6c63ff";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Label pill above dot
    ctx.font      = "bold 11px Segoe UI, Arial, sans-serif";
    const label   = `${obj.name} ${Math.round(obj.confidence * 100)}%`;
    const tw      = ctx.measureText(label).width + 12;
    const tx      = cx - tw / 2;
    const ty      = cy - 28;

    ctx.fillStyle     = "rgba(0,0,0,0.6)";
    roundRect(ctx, tx, ty, tw, 17, 6);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, ty + 12);
  });
}

// helper: rounded rectangle path
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

// ── 7. Tap dot → fetch word ───────────────────────────────────────────────────
canvas.addEventListener("click", async (e) => {
  if (objects.length === 0) return;

  // Scale from CSS display pixels → actual canvas pixels
  const scaleX = canvas.width  / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  const x      = e.offsetX * scaleX;
  const y      = e.offsetY * scaleY;

  for (const obj of objects) {
    const dx   = x - obj.cx;
    const dy   = y - obj.cy;

    if (Math.sqrt(dx * dx + dy * dy) < 22) {   // 22px hit radius
      showCardLoading(obj.name);
      try {
        const res  = await fetch(`${BACKEND}/word/${encodeURIComponent(obj.name)}`);
        const data = await res.json();
        showCard(data);
      } catch {
        card.innerHTML += `<p style="color:red">Could not fetch translation.</p>`;
      }
      break;
    }
  }
});

// ── 8. Word card ──────────────────────────────────────────────────────────────
function showCardLoading(name) {
  card.classList.remove("hidden");
  card.innerHTML = `
    <h2>${name}</h2>
    <p class="card-loading">Fetching translation…</p>
  `;
}

function showCard(data) {
  card.classList.remove("hidden");
  const safeTranslation = (data.translation || "").replace(/'/g, "\\'");
  card.innerHTML = `
    <h2>${data.word}</h2>
    <p class="translation">${data.translation}</p>
    <p class="example">${data.example}</p>
    <div class="row">
      <button class="btn-speak" onclick="speak('${safeTranslation}')">🔊 Speak</button>
      <button class="btn-close"  onclick="document.getElementById('card').classList.add('hidden')">✕</button>
    </div>
  `;
}

// ── 9. TTS ────────────────────────────────────────────────────────────────────
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = "hi-IN";
  u.rate  = 0.9;
  speechSynthesis.speak(u);
}