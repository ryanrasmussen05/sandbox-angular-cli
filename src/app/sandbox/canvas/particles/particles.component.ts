import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit, HostBinding } from '@angular/core';

import { Particle } from './particle';

interface PhysicsNormal {
    x: number;
    y: number;
}

@Component({
    selector: 'rr-particles',
    templateUrl: './particles.component.html',
    styleUrls: ['./particles.component.scss']
})

export class ParticlesComponent implements AfterViewInit, OnDestroy {
    @HostBinding('class') hostClass = 'full-width full-height block flex flex-column';
    @ViewChild('canvas') canvasElement: ElementRef;
    @ViewChild('canvasWrapper') canvasWrapperElement: ElementRef;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    screenWidth: number;
    screenHeight: number;

    gravity: boolean = false;
    collisions: boolean = true;
    orbs: string = '30';

    particles: Particle[];

    intervalId: number;

    ngAfterViewInit(): void {
        this.canvas = this.canvasElement.nativeElement;
        this.ctx = this.canvas.getContext('2d');

        this.screenWidth = this.canvasWrapperElement.nativeElement.offsetWidth;
        this.screenHeight = this.canvasWrapperElement.nativeElement.offsetHeight;
        this.canvas.width = this.screenWidth;
        this.canvas.height = this.screenHeight;

        this.particles = [];

        this.initCanvas();
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    initCanvas(): void {
        for (let i = 0; i < +this.orbs; i++) {
            this.particles.push(new Particle(this.screenWidth, this.screenHeight));
        }

        this.intervalId = window.setInterval(() => {
            this.draw();
        }, 16);
    }

    draw(): void {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        this.ctx.globalCompositeOperation = 'lighter';

        this.particles.forEach((particle) => {
            particle.draw(this.ctx, this.gravity);
        });

        if (this.collisions) {
            this.calculateCollisions();
        }
    }

    calculateCollisions(): void {
        this.particles.forEach((particleA, index) => {
            for (let i = index + 1; i < this.particles.length; i++) {
                const particleB = this.particles[i];

                if (particleA.isCollided(particleB)) {
                    const distance = Math.sqrt(Math.pow(particleA.x - particleB.x, 2) + Math.pow(particleA.y - particleB.y, 2));

                    const collisionNormal: PhysicsNormal = {
                        x: (particleA.x - particleB.x) / distance,
                        y: (particleA.y - particleB.y) / distance
                    };

                    // Decompose particleA velocity into parallel and orthogonal part
                    const particleADot = collisionNormal.x * particleA.vx + collisionNormal.y * particleA.vy;
                    const particleACollide: PhysicsNormal = {
                        x: collisionNormal.x * particleADot,
                        y: collisionNormal.y * particleADot
                    };
                    const particleARemainder: PhysicsNormal = {
                        x: particleA.vx - particleACollide.x,
                        y: particleA.vy - particleACollide.y
                    };

                    // Decompose particleB velocity into parallel and orthogonal part
                    const particleBDot = collisionNormal.x * particleB.vx + collisionNormal.y * particleB.vy;
                    const particleBCollide: PhysicsNormal = {
                        x: collisionNormal.x * particleBDot,
                        y: collisionNormal.y * particleBDot
                    };
                    const particleBRemainder: PhysicsNormal = {
                        x: particleB.vx - particleBCollide.x,
                        y: particleB.vy - particleBCollide.y
                    };

                    // calculate changes in velocity perpendicular to collision plane, conservation of momentum
                    const newVelX1 = (particleACollide.x * (particleA.mass - particleB.mass) + (2 * particleB.mass * particleBCollide.x)) / (particleA.mass + particleB.mass);
                    const newVelY1 = (particleACollide.y * (particleA.mass - particleB.mass) + (2 * particleB.mass * particleBCollide.y)) / (particleA.mass + particleB.mass);
                    const newVelX2 = (particleBCollide.x * (particleB.mass - particleA.mass) + (2 * particleA.mass * particleACollide.x)) / (particleA.mass + particleB.mass);
                    const newVelY2 = (particleBCollide.y * (particleB.mass - particleA.mass) + (2 * particleA.mass * particleACollide.y)) / (particleA.mass + particleB.mass);

                    // add collision result to remaining parallel velocities
                    particleA.vx = newVelX1 + particleARemainder.x;
                    particleA.vy = newVelY1 + particleARemainder.y;
                    particleB.vx = newVelX2 + particleBRemainder.x;
                    particleB.vy = newVelY2 + particleBRemainder.y;
                }
            }
        });
    }

    setOrbs(): void {
        clearInterval(this.intervalId);
        this.particles = [];
        this.initCanvas();
    }
}
