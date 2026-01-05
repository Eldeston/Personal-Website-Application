class ValueNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
    }

    getRandomGrid(x, y, z) {
        // Magic numbers for hashing
        const hash = Math.sin(
            x * 127.1 +
            y * 311.7 +
            z * 74.7 +
            this.seed * 10000
        ) * 43758.5453;

        return hash - Math.floor(hash);
    }

    smoothStep(t) {
        return t * t * (3 - 2 * t);
    }

    smoothLerp(a, b, t) {
        return a + (b - a) * this.smoothStep(t);
    }

    value3D(x, y, z) {
        const floorX = Math.floor(x);
        const floorY = Math.floor(y);
        const floorZ = Math.floor(z);

        const fractX = x - floorX;
        const fractY = y - floorY;
        const fractZ = z - floorZ;

        const c000 = this.getRandomGrid(floorX, floorY, floorZ);
        const c100 = this.getRandomGrid(floorX + 1, floorY, floorZ);
        const c010 = this.getRandomGrid(floorX, floorY + 1, floorZ);
        const c110 = this.getRandomGrid(floorX + 1, floorY + 1, floorZ);

        const c001 = this.getRandomGrid(floorX, floorY, floorZ + 1);
        const c101 = this.getRandomGrid(floorX + 1, floorY, floorZ + 1);
        const c011 = this.getRandomGrid(floorX, floorY + 1, floorZ + 1);
        const c111 = this.getRandomGrid(floorX + 1, floorY + 1, floorZ + 1);

        const x00 = this.smoothLerp(c000, c100, fractX);
        const x10 = this.smoothLerp(c010, c110, fractX);
        const x01 = this.smoothLerp(c001, c101, fractX);
        const x11 = this.smoothLerp(c011, c111, fractX);

        const y0 = this.smoothLerp(x00, x10, fractY);
        const y1 = this.smoothLerp(x01, x11, fractY);

        return this.smoothLerp(y0, y1, fractZ);
    }
}

const value3DInstance = new ValueNoise();