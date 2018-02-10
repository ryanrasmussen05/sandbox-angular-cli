import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit, HostBinding } from '@angular/core';

import { Firework } from './firework';
import { Particle } from './particle';

@Component({
    selector: 'rr-fireworks',
    templateUrl: './fireworks.component.html'
})

export class FireworksComponent implements AfterViewInit, OnDestroy {
    @HostBinding('class') hostClass = 'full-width full-height block';
    @ViewChild('canvas') canvasElement: ElementRef;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    screenWidth: number;
    screenHeight: number;

    fireworks: Firework[];
    particles: Particle[];
    hue: number;

    mouseDown: boolean;
    mouseX: number;
    mouseY: number;

    timerTick: number;
    timerTotal: number;
    limiterTick: number;
    limiterTotal: number;

    intervalId: number;

    constructor(public el: ElementRef) {}

    ngAfterViewInit(): void {
        this.fireworks = [];
        this.particles = [];
        this.hue = 120;
        this.mouseDown = false;
        this.timerTick = 0;
        this.timerTotal = 80;
        this.limiterTick = 0;
        this.limiterTotal = 5;

        this.canvas = this.canvasElement.nativeElement;
        this.ctx = this.canvas.getContext('2d');
        this.addMouseListeners();

        this.screenWidth = this.el.nativeElement.offsetWidth;
        this.screenHeight = this.el.nativeElement.offsetHeight;
        this.canvas.width = this.screenWidth;
        this.canvas.height = this.screenHeight;

        this.intervalId = window.setInterval(() => {
            this.draw();
        }, 25);
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    addMouseListeners(): void {
        const that = this;

        this.canvas.addEventListener('mousemove', function(event: MouseEvent) {
            that.mouseX = event.pageX - that.canvas.offsetLeft;
            that.mouseY = event.pageY - that.canvas.offsetTop;
        });

        this.canvas.addEventListener('mousedown', function(event: MouseEvent) {
            event.preventDefault();
            that.mouseDown = true;
        });

        this.canvas.addEventListener('mouseup', function(event: MouseEvent) {
            event.preventDefault();
            that.mouseDown = false;
        });
    }

    draw(): void {
        this.hue += 0.5;

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
        this.ctx.globalCompositeOperation = 'lighter';

        const fireworksToRemove: number[] = [];
        const particlesToRemove: number[] = [];

        this.fireworks.forEach((firework, index) => {
            firework.draw(this.ctx, this.hue);
            const exploded: boolean = firework.update();

            if (exploded) {
                this.createParticles(firework.x, firework.y, this.hue);
                fireworksToRemove.unshift(index);
            }
        });

        this.particles.forEach((particle, index) => {
            particle.draw(this.ctx);
            const faded: boolean = particle.update();

            if (faded) {
                particlesToRemove.unshift(index);
            }
        });

        for (const index of fireworksToRemove) {
            this.fireworks.splice(index, 1);
        }

        for (const index of particlesToRemove) {
            this.particles.splice(index, 1);
        }

        if (this.timerTick >= this.timerTotal) {
            if (!this.mouseDown) {
                this.fireworks.push(new Firework(this.screenWidth / 2, this.screenHeight,
                    this.getRange(this.screenWidth / 3, 2 * this.screenWidth / 3), this.getRange(0, this.screenHeight / 2),
                    this.screenWidth));
                this.timerTick = 0;
            }
        } else {
            this.timerTick++;
        }

        if (this.limiterTick >= this.limiterTotal) {
            if (this.mouseDown) {
                this.fireworks.push(new Firework(this.screenWidth / 2, this.screenHeight,
                    this.mouseX, this.mouseY, this.screenWidth));
                this.limiterTick = 0;
            }
        } else {
            this.limiterTick++;
        }
    }

    createParticles(x: number, y: number, hue: number) {
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(x, y, hue));
        }
    }

    getRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
