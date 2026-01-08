/*

This script is converted from p5.js to take advantage of more performance optimizations
and to have more control over the canvas rendering process.

*/

/* ---------------- CANVAS SETUP ---------------- */

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resize();
// Updates whenever window is resized
window.addEventListener("resize", resize);

/* ---------------- MAIN CANVAS ---------------- */

// Get max window dimension
const maxWindowLength = Math.max(window.innerWidth, window.innerHeight);

// Dark mode toggle
const mode = true;

// Contol FPS here
const targetFPS = 1000;
const targetFrameTime = 1000 / targetFPS;

// Particle constants
const particles = maxWindowLength * 2;
const particleSpeed = 2.0;
const particleSize = 1;

// Half size for drawing
const halfSize = particleSize * 0.5;

// Noise constants
const noiseScale = 4 / maxWindowLength;
const noiseSpeed = 0.03125 * 0.001;
const noiseRotations = 3 * Math.PI;

// Particle list
const particleList = [];

let noiseTime = 0;
let sineTime = 0;

let lastTime = performance.now();
let deltaTime = 0;
let currFrame = 0;

// Particle Class
class Particle {
    constructor(positionX = -1, positionY = -1, velocityX = 1, velocityY = 0) {
        // Upon construction of variable, store variables to this class
        this.positionX = positionX;
        this.positionY = positionY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    updateParticle() {
        // Multiply velocity by particleSpeed and add to position to update and move the particle
        this.positionX += this.velocityX * particleSpeed;
        this.positionY += this.velocityY * particleSpeed;

        // Calculate new velocity vector based on perlin noise
        const angle = value3DInstance.value3D(this.positionX * noiseScale, this.positionY * noiseScale, noiseTime) * noiseRotations;

        // Create a 2D vector and assign new velocity
        this.velocityX = Math.sin(angle);
        this.velocityY = Math.cos(angle);

        // Finally, color the particle according to current velocity and time
        ctx.fillStyle = `rgb(${Math.abs(this.velocityX) * 255}, ${Math.abs(this.velocityY) * 255}, ${sineTime})`;

        // Check if particle goes outside the window borders and reset position
        if (this.positionX < 0 || this.positionX > canvas.width || this.positionY < 0 || this.positionY > canvas.height) {
            this.positionX = Math.random() * canvas.width;
            this.positionY = Math.random() * canvas.height;
        }
    }

    drawParticle() {
        // Centered rectangle draw
        ctx.fillRect(
            this.positionX - halfSize,
            this.positionY - halfSize,
            particleSize,
            particleSize
        );
    }
}

class MainCanvas {
    constructor() {
        // Bind main loop to this class
        this.mainLoop = this.mainLoop.bind(this);

        // Get particles element
        this.particlesElement = document.getElementById('particles');

        // Get FPS element
        this.fpsElement = document.getElementById('fps');

        // Update FPS display
        setInterval(() => {
            const fps = Math.round(1 / deltaTime);
            this.fpsElement.textContent = `${fps} FPS`;

            // Good performance
            if (fps >= 60) this.fpsElement.style.color = "lime";
            // Acceptable
            else if (fps >= 30) this.fpsElement.style.color = "gold";
            // Poor performance
            else this.fpsElement.style.color = "red";
        }, 500);

        // Start the loop
        requestAnimationFrame(this.mainLoop);
    }

    mainDraw() {
        // For changing blue value over time
        sineTime = Math.sin(noiseTime) * 128 + 128;
        // For changing noise over time
        noiseTime = lastTime * noiseSpeed;

        // Delay every 2 frames
        if (particleList.length < particles && currFrame % 2 == 0) {
            // Create a particle every frame until it reaches a threshold
            particleList.push(new Particle());
            // Update particles text
            this.particlesElement.textContent = `${particleList.length} particles`;
        }

        // Transparent background fill
        ctx.fillStyle = mode ? "rgba(0, 0, 0, 0.03125)" : "rgba(255, 255, 255, 0.03125)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load, update, and display particles
        for (let particle of particleList) {
            particle.updateParticle();
            particle.drawParticle();
        }
    }

    mainLoop(currTime) {
        // Calculate elapsed time
        const elapsedTime = currTime - lastTime;

        if (elapsedTime > targetFrameTime) {
            // Delta time calculation
            deltaTime = elapsedTime * 0.001;
            // Updates current time
            lastTime = currTime;

            // Main draw call
            this.mainDraw();
        }

        currFrame++;

        // Request next frame
        requestAnimationFrame(this.mainLoop);
    }
}

// Runs the main canvas script
let canvasInstance = new MainCanvas();