
const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const song = document.getElementById("song");
const playButton = document.getElementById("playButton");
const startScreen = document.getElementById("startScreen");

const endScreen = document.getElementById("endScreen");
const replayButton = document.getElementById("replayButton");
const closeButton = document.getElementById("closeButton");
const endButtons = document.getElementById("endButtons");

// PERSONALIZE THESE
const NAME = "Bubba!";
const MESSAGE = "Always smile for me!";

// AUDIO
const CHORUS_START = 52;
const CHORUS_END = 91;

// SETTINGS
const PARTICLE_COUNT = 2500;
const FORMATION_SPEED = 900;
const HEART_FADE_IN = 120;

const colors = [
    "#5426A8",
    "#2855D9",
    "#16C9D8",
    "#B99AFF",
    "#FFFFFF"
];

let frame = 0;
let heartItems = [];
let lastDrawn = 0;

let particleCanvas;
let particleCtx;

let started = false;
let isAnimating = false;
let animationId = null;
let finished = false;


// GENERATE CLASSIC VALENTINE HEART
function generateHeart() {
    heartItems = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());

        const x = 16 * Math.pow(Math.sin(t), 3) * r;

        const y = (
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t)
        ) * r;

        const direction = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 600;

        heartItems.push({
            x,
            y,
            startX: Math.cos(direction) * distance,
            startY: Math.sin(direction) * distance,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 7 + Math.random() * 3,
            rotation: (Math.random() - 0.5) * 0.2
        });
    }
}


// CANVAS SETUP
function createParticleCanvas() {
    particleCanvas = document.createElement("canvas");
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;

    particleCtx = particleCanvas.getContext("2d");
    lastDrawn = 0;
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticleCanvas();
}


// DRAW PARTICLES
function addParticles(start, end) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scale = Math.min(width / 35, height / 32);

    const centerX = width / 2;
    const centerY = height / 2;

    const lyrics = `Leaves will soon grow from the bareness of trees
And all will be alright in time
From waves overgrown come the calmest of seas
And all will be alright in time
No, you never really love someone until you learn to forgive`;

    const words = lyrics
        .replace(/\n/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    for (let i = start; i < end; i++) {
        const item = heartItems[i];

        const x = centerX + item.x * scale;
        const y = centerY - item.y * scale;

        const word = words[i % words.length];

        particleCtx.save();

        particleCtx.translate(x, y);
        particleCtx.rotate(item.rotation);

        particleCtx.font = `bold ${item.size + 2}px Georgia`;
        particleCtx.fillStyle = item.color;
        particleCtx.textAlign = "center";
        particleCtx.textBaseline = "middle";

        particleCtx.shadowBlur = 6;
        particleCtx.shadowColor = item.color;

        particleCtx.fillText(word, 0, 0);

        particleCtx.restore();
    }
}


// MAIN ANIMATION
function draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // PHASE 1: NAME APPEARS
    if (frame < 100) {
        const progress = Math.min(frame / 60, 1);
        const opacity = Math.min(frame / 35, 1);

        ctx.save();
        ctx.globalAlpha = opacity;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${20 + 18 * progress}px Georgia`;

        ctx.shadowBlur = 25;
        ctx.shadowColor = "#16C9D8";

        ctx.fillText(NAME, centerX, centerY - 25);

        ctx.fillStyle = "#B99AFF";
        ctx.font = "italic 17px Georgia";
        ctx.fillText(MESSAGE, centerX, centerY + 30);

        ctx.restore();
    }

    // PHASE 2: NAME FADES
    else if (frame < 145) {
        const progress = 1 - (frame - 100) / 45;

        ctx.save();
        ctx.globalAlpha = Math.max(progress, 0);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 38px Georgia";
        ctx.fillText(NAME, centerX, centerY - 25);

        ctx.restore();
    }

    // PHASE 3: HEART FORMS
    else {
        const reveal = Math.min(
            (frame - 145) / FORMATION_SPEED,
            1
        );

        const visibleCount = Math.floor(
            PARTICLE_COUNT * reveal
        );

        if (visibleCount > lastDrawn) {
            addParticles(lastDrawn, visibleCount);
            lastDrawn = visibleCount;
        }

        const fadeIn = Math.min(
            (frame - 145) / HEART_FADE_IN,
            1
        );

        const fadeOut = song.currentTime >= CHORUS_END - 2
            ? Math.max(0, (CHORUS_END - song.currentTime) / 2)
            : 1;

        const opacity = Math.min(fadeIn, fadeOut);

        const pulse = 1 + 0.025 * Math.sin(frame * 0.065);

        ctx.save();

        ctx.globalAlpha = opacity;

        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        ctx.translate(-centerX, -centerY);

        ctx.drawImage(
            particleCanvas,
            0,
            0,
            width,
            height
        );

        ctx.restore();
    }

    frame++;

    if (isAnimating) {
        animationId = requestAnimationFrame(draw);
    }
}


// SHOW ENDING SCREEN
function showEnding() {
    console.log("ENDING SCREEN TRIGGERED!");
    finished = true;
    isAnimating = false;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    song.pause();
    song.currentTime = CHORUS_END;

    endButtons.style.display = "flex";
    endScreen.style.display = "flex";

    requestAnimationFrame(() => {
        endScreen.style.opacity = "1";
    });
}


// HIDE ENDING SCREEN
function hideEnding() {
    endScreen.style.opacity = "0";
    endScreen.style.display = "none";
}


// RESET ANIMATION
function resetAnimation() {
    frame = 0;
    lastDrawn = 0;

    particleCtx.clearRect(
        0,
        0,
        particleCanvas.width,
        particleCanvas.height
    );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// START OR REPLAY SURPRISE
async function startSurprise() {
    try {
        finished = false;

        hideEnding();

        endButtons.style.display = "flex";

        resetAnimation();

        song.currentTime = CHORUS_START;
        await song.play();

        isAnimating = true;
        animationId = requestAnimationFrame(draw);

        console.log("Surprise started!");

    } catch (error) {
        isAnimating = false;

        console.error("Playback failed:", error);

        if (!started) {
            started = false;
            playButton.disabled = false;
        }
    }
}


// INITIALIZE
resizeCanvas();
generateHeart();


// FIRST PLAY BUTTON
playButton.addEventListener("click", async () => {
    if (started) return;

    started = true;
    playButton.disabled = true;

    await startSurprise();

    if (!isAnimating) return;

    startScreen.style.opacity = "0";

    setTimeout(() => {
        startScreen.style.display = "none";
    }, 1200);
});


// REPLAY BUTTON
replayButton.addEventListener("click", async () => {
    await startSurprise();
});


// CLOSE BUTTON
closeButton.addEventListener("click", () => {
    hideEnding();
});


// STOP SONG AND SHOW ENDING
song.addEventListener("timeupdate", () => {
    if (!finished && song.currentTime >= CHORUS_END - 0.1) {
        showEnding();
    }
});

song.addEventListener("ended", () => {
    if (!finished) {
        showEnding();
    }
});


// AUDIO ERROR
song.addEventListener("error", () => {
    console.error("Audio loading error:", song.error);
});


// HANDLE RESIZING
window.addEventListener("resize", () => {
    resizeCanvas();
    generateHeart();
});
