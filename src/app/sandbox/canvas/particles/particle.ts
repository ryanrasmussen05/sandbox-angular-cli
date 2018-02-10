export class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    mass: number;

    constructor(private xRange: number, private yRange: number) {
        this.x = Math.floor(Math.random() * xRange);
        this.y = Math.floor(Math.random() * yRange);
        this.vx = Math.random() * 10 - 5;
        this.vy = Math.random() * 10 - 5;
        this.radius = Math.floor(Math.random() * 20 + 20);

        const r = Math.random() * 255 >> 0;
        const g = Math.random() * 255 >> 0;
        const b = Math.random() * 255 >> 0;
        this.color = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';

        this.mass = Math.PI * Math.pow(this.radius, 2);
    }

    draw(ctx: CanvasRenderingContext2D, gravity: boolean) {
        const drawX = Math.floor(this.x);
        const drawY = Math.floor(this.y);

        ctx.beginPath();

        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, this.radius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.1, 'white');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, 'black');

        ctx.fillStyle = gradient;
        ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2, false);
        ctx.fill();

        this.x += this.vx;
        this.y += this.vy;

        if (gravity) {
            this.vy += 0.3;
        }

        if (this.x < 0 && this.vx < 0) {
            this.vx = this.vx * -1;
        } else if (this.x > this.xRange && this.vx > 0) {
            if (gravity) {
                this.vx = this.vx * -0.7;
            } else {
                this.vx = this.vx * -1;
            }
        }

        if (this.y < 0 && this.vy < 0) {
            this.vy = this.vy * -1;
        } else if (this.y > this.yRange && this.vy > 0) {
            if (gravity) {
                this.vy = this.vy * -0.8;
            } else {
                this.vy = this.vy * -1;
            }
        }
    }

    isCollided(particle: Particle): boolean {
        // check for box overlap first for performance
        if (this.x + this.radius + particle.radius > particle.x &&
           this.x < particle.x + this.radius + particle.radius &&
           this.y + this.radius + particle.radius > particle.y &&
           this.y < particle.y + this.radius + particle. radius) {

            // particles are close, now check exact distance
            const distance = Math.sqrt(Math.pow(this.x - particle.x, 2) + Math.pow(this.y - particle.y, 2));

            if (distance < this.radius + particle.radius) {
                // if particles are overlapping, check if they are already moving apart (post-collision)
                return this.getNextDistanceBetweenParticles(particle) < distance;
            }
        }
        return false;
    }

    private getNextDistanceBetweenParticles(particle: Particle): number {
        const x1 = this.x + (this.vx * 0.01);
        const y1 = this.y + (this.vy * 0.01);
        const x2 = particle.x + (particle.vx * 0.01);
        const y2 = particle.y + (particle.vy * 0.01);

        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
}
