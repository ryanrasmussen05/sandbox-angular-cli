export class Particle {
    vx: number;
    vy: number;
    friction: number;
    gravity: number;
    brightness: number;
    alpha: number;
    decay: number;
    coordinates: number[][];

    constructor(public x: number, public y: number, public hue: number) {
        const angle = this.getRange(0, Math.PI * 2);
        const speed = this.getRange(1, 5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.friction = 0.95;
        this.gravity = 0.05;
        this.hue = this.getRange(hue - 20, hue + 20);
        this.brightness = this.getRange(50, 80);
        this.alpha = 1;
        this.decay = this.getRange(0.005, 0.015);

        this.coordinates = [];

        for (let i = 0; i < 5; i++) {
            this.coordinates.push([this.x, this.y]);
        }
    }

    update(): boolean {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= this.friction;
        this.vy = (this.vy * this.friction) + this.gravity;

        this.alpha -= this.decay;

        return this.alpha <= this.decay;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const moveToX = Math.floor(this.coordinates[this.coordinates.length - 1][0]);
        const moveToY = Math.floor(this.coordinates[this.coordinates.length - 1][1]);
        const lineToX = Math.floor(this.x);
        const lineToY = Math.floor(this.y);

        ctx.beginPath();
        ctx.moveTo(moveToX, moveToY);
        ctx.lineTo(lineToX, lineToY);
        ctx.strokeStyle = 'hsla(' + this.hue + ',100%,' + this.brightness + '%,' + this.alpha + ')';
        ctx.stroke();
    }

    getRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
