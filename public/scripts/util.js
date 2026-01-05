class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class PerlinNoise {
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

    perlin3D(x, y, z) {
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

let perlin3DInstance = new PerlinNoise();

/*

// Lightweight Perlin noise implementation
const perlin = (function() {
    const p = new Uint8Array(512);
    const perm = new Uint8Array(256);

    for (let i = 0; i < 256; i++) perm[i] = i;

    for (let i = 0; i < 256; i++) {
        const j = Math.floor(Math.random() * (256 - i)) + i;
        [perm[i], perm[j]] = [perm[j], perm[i]];
        p[i] = p[i + 256] = perm[i];
    }

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

    function lerp(a, b, t) { return a + t * (b - a); }

    function grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    return function(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x), v = fade(y), w = fade(z);

        const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

        return lerp(
            lerp(
                lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
                lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
                v
            ),
            lerp(
                lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
                lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
                v
            ),
            w
        );
    };
})();

*/