const input = document.getElementById("imageInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const card = document.getElementById("card");

let objects = [];
let image = null;

// 📸 Upload image
input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;

    image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        await detectObjects(file);
    };
});
const scaleX = canvas.width / canvas.clientWidth;
const scaleY = canvas.height / canvas.clientHeight;
const x = e.offsetX * scaleX;
const y = e.offsetY * scaleY;

// 🔍 Call backend
async function detectObjects(file) {
    const reader = new FileReader();

    reader.onloadend = async () => {
        const base64 = reader.result;

        const res = await fetch("http://192.168.x.x:5000/detect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image: base64 })
        });

        const data = await res.json();
        objects = data.objects;

        drawDots();
    };

    reader.readAsDataURL(file);
}

// 🔵 Draw dots
function drawDots() {
    ctx.drawImage(image, 0, 0);

    objects.forEach(obj => {
        const { x1, y1, x2, y2 } = obj.box;

        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;

        obj.cx = cx;
        obj.cy = cy;

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#6C63FF";
        ctx.fill();
    });
}

// 🖱️ Click detection
canvas.addEventListener("click", async (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    for (let obj of objects) {
        const dx = x - obj.cx;
        const dy = y - obj.cy;

        if (Math.sqrt(dx * dx + dy * dy) < 10) {
            const res = await fetch(`http://localhost:5000/word/${obj.name}`);
            const data = await res.json();

            showCard(data);
            break;
        }
    }
});

// 🪪 Show word card
function showCard(data) {
    card.classList.remove("hidden");

    card.innerHTML = `
    <h2>${data.word}</h2>
    <p><b>${data.translation}</b></p>
    <p>${data.example}</p>
    <button onclick="speak('${data.translation}')">🔊 Speak</button>
  `;
}

// 🔊 TTS
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    speechSynthesis.speak(utterance);
}