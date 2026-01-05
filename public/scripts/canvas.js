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

// Particle constants
const particles = maxWindowLength * 2;
const particleSpeed = 128.0;
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

// Particle Class
class Particle {
    constructor(positionX, positionY, velocityX, velocityY) {
        // Upon construction of variable, store variables to this class
        this.positionX = positionX;
        this.positionY = positionY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    updateParticle(finalSpeed) {
        // Multiply velocity by particleSpeed and add to position to update and move the particle
        this.positionX += this.velocityX * finalSpeed;
        this.positionY += this.velocityY * finalSpeed;

        // Calculate new velocity vector based on perlin noise
        const angle = perlin3DInstance.perlin3D(this.positionX * noiseScale, this.positionY * noiseScale, noiseTime) * noiseRotations;
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
        // Initialize particles
        for (let i = 0; i < particles; i++)
            particleList.push(new Particle(0, 0, -1, 0));

        // Bind main loop to this class
        this.mainLoop = this.mainLoop.bind(this);
        // Get FPS element
        this.fpsElement = document.getElementById('fps');

        // Update FPS display every second
        setInterval(() => {
            const fps = Math.round(1 / deltaTime);
            this.fpsElement.textContent = `${fps} FPS`;

            if (fps >= 60)
                // Good performance
                this.fpsElement.style.color = "lime";
            else if (fps >= 30)
                // Acceptable
                this.fpsElement.style.color = "gold";
            else
                // Poor performance
                this.fpsElement.style.color = "red";
        }, 1000);

        // Start the loop
        requestAnimationFrame(this.mainLoop);
    }

    mainLoop(currTime){
        // Delta time calculation
        deltaTime = (currTime - lastTime) * 0.001;
        // Updates current time
        lastTime = currTime;

        // For changing blue value over time
        sineTime = Math.sin(noiseTime) * 128 + 128;
        // For changing noise over time
        noiseTime = lastTime * noiseSpeed;

        // Transparent background fill
        ctx.fillStyle = mode ? "rgba(0, 0, 0, 0.03125)" : "rgba(255, 255, 255, 0.03125)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Particle final speed calculation
        const finalSpeed = particleSpeed * deltaTime;

        // Load, update, and display particles
        for (let particle of particleList) {
            particle.updateParticle(finalSpeed);
            particle.drawParticle();
        }

        // Request next frame
        requestAnimationFrame(this.mainLoop);
    }
}

// Runs the main canvas script
let canvasInstance = new MainCanvas();