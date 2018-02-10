export class Firework {
    coordinates: number[][];
    vx: number;
    vy: number;
    brightness: number;
    fuseTime: number;
    currentTime: number;

    constructor(public x: number, public y: number, public targetX: number, public targetY: number, public xRange: number) {
        this.coordinates = [];
        this.coordinates.push([x, y]);

        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = this.getRange(10, 13);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.brightness = this.getRange(50, 70);

        this.fuseTime = 100;
        this.currentTime = 0;
    }

    update(): boolean {
        // remove last coordinate, add current coordinate
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.vy = this.vy + 0.1;
        this.currentTime++;

        // blow up if fuse timer runs out, or near edges
        if (this.fuseTime <= this.currentTime || this.x < 50 || this.x > this.xRange - 50 || this.y < 50) {
            return true;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            return false;
        }
    }

    draw(ctx: CanvasRenderingContext2D, hue: number): void {
        const moveToX = Math.floor(this.coordinates[this.coordinates.length - 1][0]);
        const moveToY = Math.floor(this.coordinates[this.coordinates.length - 1][1]);
        const lineToX = Math.floor(this.x);
        const lineToY = Math.floor(this.y);

        ctx.beginPath();
        ctx.moveTo(moveToX, moveToY);
        ctx.lineTo(lineToX, lineToY);
        ctx.strokeStyle = 'hsl(' + hue + ',100%,' + this.brightness + '%';
        ctx.stroke();
    }

    getRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
