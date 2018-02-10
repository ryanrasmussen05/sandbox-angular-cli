import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy, HostBinding } from '@angular/core';

declare let Physics: any;

@Component({
    selector: 'rr-solar-system',
    templateUrl: './solar-system.component.html'
})

export class SolarSystemComponent implements AfterViewInit, OnDestroy {
    @HostBinding('class') hostClass = 'full-width full-height block';
    @ViewChild('physics') physicsElement: ElementRef;
    bodies: number = 0;
    world: any;

    constructor(private zone: NgZone) {}

    ngAfterViewInit(): void {
        this.draw();
    }

    ngOnDestroy(): void {
        this.world.destroy();
    }

    draw(): void {
        const component = this;

        const width = this.physicsElement.nativeElement.offsetWidth;
        const height = this.physicsElement.nativeElement.offsetHeight;
        const xMin = (width / 2) - (height / 2);
        const xMax = (width / 2) + (height / 2);
        const gravityStrength = 0.01;

        component.world = Physics({ sleepDisabled: true });

        const renderer: any = Physics.renderer('canvas', {
            el: 'physics'
        });
        component.world.add(renderer);

        component.world.on('step', function() {
            component.world.render();
        });

        const sun = Physics.body('circle', {
            x: width / 2,
            y: height / 2,
            mass: 333,
            radius: 20,
            treatment: 'static',
            sun: true,
            styles: {
                fillStyle: '#0000FF'
            }
        });
        component.world.add(sun);

        const circles = [];

        for (let counter = 0; counter < 200; counter++) {
            const circle = Physics.body('circle', {
                x: this.random(xMin, xMax),
                y: this.random(0, height),
                mass: 0.1,
                restitution: 0,
                cof: 1,
                radius: 2,
                styles: {
                    fillStyle: '#FF0000'
                }
            });

            if (width / 2 - 15 < circle.state.pos.x && circle.state.pos.x < width / 2 + 15) {
                circle.state.pos.x = circle.state.pos.x + 30;
            }
            if (height / 2 - 15 < circle.state.pos.y && circle.state.pos.y < height / 2 + 15) {
                circle.state.pos.y = circle.state.pos.y + 30;
            }

            const vector = Physics.vector(circle.state.pos.x - width / 2, circle.state.pos.y - height / 2);
            const orbitRadius = vector.norm();
            vector.perp(true);
            vector.normalize();

            const orbitSpeed = Math.sqrt(gravityStrength * 333 / orbitRadius);

            circle.state.vel = vector.mult(orbitSpeed);

            circles.push(circle);
        }

        component.world.add(circles);

        component.world.add([
            Physics.behavior('newtonian', { strength: gravityStrength }),
            Physics.behavior('sweep-prune'),
            Physics.behavior('body-collision-detection', { checkAll: false })
        ]);

        component.world.on('collisions:detected', function(data: any) {
            const behavior = Physics.behavior('body-impulse-response');

            // apply default impulse first
            behavior.respond(data);

            // combine bodies
            for (let i = 0; i < data.collisions.length; i++) {
                const bodyA = data.collisions[i].bodyA;
                const bodyB = data.collisions[i].bodyB;

                if (bodyA.sun) {
                    component.world.remove(bodyB);
                } else if (bodyB.sun) {
                    component.world.remove(bodyA);
                } else {
                    const newBodyVolume = (4 / 3 * Math.PI * Math.pow(bodyA.radius, 3)) + (4 / 3 * Math.PI * Math.pow(bodyB.radius, 3));
                    const newBodyRadius = Math.pow(((3 / (4 * Math.PI)) * newBodyVolume), 1 / 3);

                    const centerOfMass = Physics.body.getCOM([bodyA, bodyB]);

                    const centerOfMassVelocity: any = {};
                    centerOfMassVelocity.x = ((bodyA.mass * bodyA.state.vel.x) + (bodyB.mass * bodyB.state.vel.x)) / (bodyA.mass + bodyB.mass);
                    centerOfMassVelocity.y = ((bodyA.mass * bodyA.state.vel.y) + (bodyB.mass * bodyB.state.vel.y)) / (bodyA.mass + bodyB.mass);

                    const newBody = Physics.body('circle', {
                        x: centerOfMass.x,
                        y: centerOfMass.y,
                        vx: centerOfMassVelocity.x,
                        vy: centerOfMassVelocity.y,
                        mass: bodyA.mass + bodyB.mass,
                        radius: newBodyRadius,
                        styles: {
                            fillStyle: '#FF0000'
                        }
                    });

                    component.world.add(newBody);
                    component.world.remove(bodyA);
                    component.world.remove(bodyB);
                }
            }
        });

        Physics.util.ticker.on(function(time: any) {
            component.world.step( time );
            component.updateBodyCount(component.world.getBodies().length);
        });

        Physics.util.ticker.start();
    }

    random(min: number, max: number): number {
        return (Math.random() * (max - min)) + min;
    }

    updateBodyCount(bodies: number) {
        // updates triggered in function from outside libraries don't trigger updates
        this.zone.run(() => {
            this.bodies = bodies;
        });
    }
}
