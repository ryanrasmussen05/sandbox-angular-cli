import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostBinding } from '@angular/core';

declare let Physics: any;

@Component({
    selector: 'rr-physics-intro',
    templateUrl: './physics-intro.component.html'
})

export class PhysicsIntroComponent implements AfterViewInit, OnDestroy {
    @HostBinding('class') hostClass = 'full-width full-height block';
    @ViewChild('physics') physicsElement: ElementRef;
    world: any;

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
        let viewportBounds = Physics.aabb(0, 0, width, height);

        component.world = Physics({ sleepDisabled: true });

        const renderer: any = Physics.renderer('canvas', {
            el: 'physics'
        });
        component.world.add(renderer);

        component.world.on('step', function() {
            component.world.render();
        });

        component.world.add(Physics.behavior('interactive', { el: renderer.container }));

        const edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0.99, // energy % after collision
            cof: 0.8 // friction with boundaries
        });

        window.addEventListener('resize', function () {
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            edgeBounce.setAABB(viewportBounds);
        }, true);

        const circles = [];

        for (let counter = 0; counter < 180; counter++) {
            circles.push(
                Physics.body('circle', {
                    x: Math.random() * width, // (width - 10) + 10,
                    y: Math.random() * height, // (height - 10) + 10,
                    mass: 1,
                    radius: 4,
                    vx: Math.random() * 0.01 - 0.005,
                    vy: Math.random() * 0.01 - 0.005,
                    restitution: 0.99,
                    styles: {
                        fillStyle: '#FF0000'
                    }
                })
            );
        }

        component.world.add(circles);

        const attractor = Physics.behavior('attractor', {
            order: 0,
            strength: 0.002
        });

        component.world.on({
            'interact:poke': function(pos: any) {
                component.world.wakeUpAll();
                attractor.position(pos);
                component.world.add( attractor );
            },
            'interact:move': function(pos: any) {
                attractor.position(pos);
            },
            'interact:release': function() {
                component.world.wakeUpAll();
                component.world.remove( attractor );
            }
        });

        component.world.add([
            Physics.behavior('newtonian', { strength: 0.01 }),
            Physics.behavior('sweep-prune'),
            Physics.behavior('body-collision-detection', { checkAll: false }),
            Physics.behavior('body-impulse-response'),
            edgeBounce
        ]);

        Physics.util.ticker.on(function(time: any) {
            component.world.step( time );
        });

        Physics.util.ticker.start();
    }
}
