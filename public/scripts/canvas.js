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

// Particle constants
const mode = true;
const particles = 4096;
const particleSize = 1;
const particleSpeed = 128.0;

// Half size for drawing
const halfSize = particleSize * 0.5;

const noiseScale = 1 / 512;
const noiseSpeed = 0.03125 * 0.001;
const noiseRotations = 3 * Math.PI;

const particleList = [];

let sineTime = 0;
let noiseTime = 0;

let deltaTime = 0;
let lastTime = performance.now();

// Particle Class
class Particle {
    constructor(position, velocity) {
        // Upon construction of variable, store variables to this class
        this.position = position;
        this.velocity = velocity;
    }

    updateParticle(finalSpeed) {
        // Multiply velocity by particleSpeed and add to position to update and move the particle
        this.position.add(this.velocity.x * finalSpeed, this.velocity.y * finalSpeed);

        // Calculate new velocity vector based on perlin noise
        const angle = perlin3DInstance.perlin3D(this.position.x * noiseScale, this.position.y * noiseScale, noiseTime) * noiseRotations;
        // Create a 2D vector and assign new velocity
        this.velocity.set(Math.sin(angle), Math.cos(angle));

        // Finally, color the particle according to current velocity and time
        ctx.fillStyle = `rgb(${Math.abs(this.velocity.x) * 255}, ${Math.abs(this.velocity.y) * 255}, ${sineTime})`;

        // Check if particle goes outside the window borders and reset position
        if (this.position.x < 0 || this.position.x > canvas.width || this.position.y < 0 || this.position.y > canvas.height) {
            this.position.set(Math.random() * canvas.width, Math.random() * canvas.height);
        }
    }

    drawParticle() {
        // Centered rectangle draw
        ctx.fillRect(
            this.position.x - halfSize,
            this.position.y - halfSize,
            particleSize,
            particleSize
        );
    }
}

class MainCanvas {
    constructor() {
        // Initialize particles
        for (let i = 0; i < particles; i++)
            particleList.push(new Particle(new Vector2(0, 0), new Vector2(-1, 0)));

        // Bind main loop to this class
        this.mainLoop = this.mainLoop.bind(this);
        // Get FPS element
        this.fpsElement = document.getElementById('fps');

        // Update FPS display every second
        setInterval(() => {
            this.fpsElement.textContent = `${Math.round(1 / deltaTime)} FPS`;
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
        ctx.fillStyle = mode ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)";
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