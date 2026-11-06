
const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
const playButton = document.getElementById("playButton");
const startScreen = document.getElementById("startScreen");

let started = false;

// PERSONALIZE THESE
const NAME = "Bubba!";
const MESSAGE = "Always smile for me!";

// AUDIO
const song = document.getElementById("song");
const CHORUS_START = 52;
const CHORUS_END = 91;


// SETTINGS
const PARTICLE_COUNT = 2500;
const FORMATION_SPEED = 900;
const HEART_FADE_IN = 120;
const HEART_FADE_OUT = 120;

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

            color: colors[
                Math.floor(Math.random() * colors.length)
            ],

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

        // FADE IN
        const fadeIn = Math.min(
            (frame - 145) / HEART_FADE_IN,
            1
        );

        // FADE OUT WHEN CHORUS ENDS
        const fadeOut = song && song.currentTime >= CHORUS_END - 2
            ? Math.max(0, (CHORUS_END - song.currentTime) / 2)
            : 1;

        const opacity = Math.min(fadeIn, fadeOut);

        // GENTLE HEARTBEAT
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
    requestAnimationFrame(draw);
}

// AUDIO PLAYBACK
if (song) {
    song.addEventListener("loadedmetadata", async () => {
        song.currentTime = CHORUS_START;

        try {
            await song.play();
            console.log("Song started!");
        } catch (error) {
            console.error("Autoplay failed:", error.name, error.message);
        }
    });

    song.addEventListener("timeupdate", () => {
        if (song.currentTime >= CHORUS_END) {
            song.pause();
            song.currentTime = CHORUS_END;
        }
    });

    song.addEventListener("error", () => {
        console.error("Audio loading error:", song.error);
    });
}

// INITIALIZE
resizeCanvas();
generateHeart();

// START SURPRISE
playButton.addEventListener("click", async () => {
    if (started) return;

    started = true;
    playButton.disabled = true;

    try {
        song.currentTime = CHORUS_START;
        await song.play();

        // Hide the opening screen
        startScreen.style.opacity = "0";

        setTimeout(() => {
            startScreen.style.display = "none";
        }, 1200);

        // Start the animation
        frame = 0;
        requestAnimationFrame(draw);

        console.log("Surprise started!");

    } catch (error) {
        started = false;
        playButton.disabled = false;

        console.error("Playback failed:", error);
    }
});

// STOP AT END OF CHORUS
song.addEventListener("timeupdate", () => {
    if (song.currentTime >= CHORUS_END) {
        song.pause();
        song.currentTime = CHORUS_END;
    }
});

// HANDLE RESIZING
window.addEventListener("resize", () => {
    resizeCanvas();
    generateHeart();
});