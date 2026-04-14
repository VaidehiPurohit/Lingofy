const input = document.getElementById("imageInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const card = document.getElementById("card");

// 🔧 Set your backend IP here (run `ipconfig` on Windows or `ifconfig` on Mac/Linux)
const BACKEND = "http://localhost:5000";

let objects = [];
let image = null;

// 📸 Upload image
input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;

    card.classList.add("hidden");
    card.innerHTML = "";

    image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = async () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);

        showLoading(true);
        await detectObjects(file);
        showLoading(false);
    };
});

// 🔍 Call backend
async function detectObjects(file) {
    const reader = new FileReader();

    reader.onloadend = async () => {
        const base64 = reader.result;

        try {
            const res = await fetch(`${BACKEND}/detect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 })
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            objects = data.objects || [];
            drawDots();

        } catch (err) {
            console.error("Detection failed:", err);
            showError("Could not connect to backend. Is the server running?");
        }
    };

    reader.readAsDataURL(file);
}

// 🔵 Draw dots on detected objects
function drawDots() {
    ctx.drawImage(image, 0, 0);

    objects.forEach(obj => {
        const { x1, y1, x2, y2 } = obj.box;
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;

        obj.cx = cx;
        obj.cy = cy;

        // Outer glow
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(108, 99, 255, 0.25)";
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#6C63FF";
        ctx.fill();

        // Label
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#6C63FF";
        ctx.fillText(obj.name, cx + 10, cy - 6);
    });
}

// 🖱️ Click on a dot to get word info
canvas.addEventListener("click", async (e) => {
    const rect = canvas.getBoundingClientRect();

    // Scale click coords to actual canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let obj of objects) {
        const dx = x - obj.cx;
        const dy = y - obj.cy;

        if (Math.sqrt(dx * dx + dy * dy) < 20) {
            card.classList.remove("hidden");
            card.innerHTML = `<p style="color:#6c63ff">Loading <b>${obj.name}</b>...</p>`;

            try {
                const res = await fetch(`${BACKEND}/word/${encodeURIComponent(obj.name)}`);
                const data = await res.json();
                showCard(data);
            } catch (err) {
                card.innerHTML = `<p style="color:red">Failed to load word data.</p>`;
            }
            break;
        }
    }
});

// 🪪 Show word card
function showCard(data) {
    card.classList.remove("hidden");
    card.innerHTML = `
        <h2>${data.word}</h2>
        <p><b>🇮🇳 ${data.translation}</b></p>
        <p style="color:#555">${data.example}</p>
        <button onclick="speak('${data.translation.replace(/'/g, "\\'")}')">🔊 Speak Hindi</button>
        <button onclick="card.classList.add('hidden')" style="background:#ccc;color:#333;margin-top:6px">✕ Close</button>
    `;
}

// 🔊 TTS in Hindi
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    speechSynthesis.speak(utterance);
}

// ⏳ Loading state
function showLoading(state) {
    if (state) {
        card.classList.remove("hidden");
        card.innerHTML = `<p style="color:#6c63ff">🔍 Detecting objects...</p>`;
    } else {
        card.classList.add("hidden");
        card.innerHTML = "";
    }
}

// ❌ Error display
function showError(msg) {
    card.classList.remove("hidden");
    card.innerHTML = `<p style="color:red">⚠️ ${msg}</p>`;
}
