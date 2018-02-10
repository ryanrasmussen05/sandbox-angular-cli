import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostBinding } from '@angular/core';

declare let Physics: any;

@Component({
    selector: 'rr-bridge',
    templateUrl: './bridge.component.html'
})

export class BridgeComponent implements AfterViewInit, OnDestroy {
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
        const viewportBounds = Physics.aabb(0, 0, width, height);

        const trussDistantConstraint = 1;
        const topThreshold = 1.1;
        const bottomThreshold = 0.9;

        const bridgeSpacing = 50;
        const bridgeLength = Math.floor((width - 100) / bridgeSpacing);

        const bridgeLineStyle = {
            strokeStyle: '#000000',
            lineWidth: 3
        };

        component.world = Physics({ sleepDisabled: true });

        const renderer: any = Physics.renderer('canvas', {
            el: 'physics'
        });
        component.world.add(renderer);

        component.world.on('step', function() {
            component.world.render();
        });

        // constrain objects to these bounds
        const edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0.1,
            cof: 1.0
        });

        // for constraints
        const rigidConstraints = Physics.behavior('verlet-constraints', {
            iterations: 3
        });

        let bridgeNode;

        const bridgeLevelOne = [];
        for (let i = 0; i < bridgeLength; i++) {
            bridgeNode = Physics.body('circle', {
                x: 50 + (i * bridgeSpacing),
                y: height / 2,
                radius: 1,
                mass: 0.5,
                cof: 1.0,
                hidden: true
            });
            bridgeLevelOne.push(bridgeNode);
        }

        const bridgeLevelTwo = [];
        for (let i = 0; i < bridgeLength; i++) {
            bridgeNode = Physics.body('circle', {
                x: 50 + (i * bridgeSpacing),
                y: height / 2 + bridgeSpacing,
                radius: 1,
                mass: 1,
                cof: 1.0,
                hidden: true
            });
            bridgeLevelTwo.push(bridgeNode);
        }

        bridgeLevelOne[0].treatment = 'static';
        bridgeLevelTwo[0].treatment = 'static';
        bridgeLevelOne[bridgeLength - 1].treatment = 'static';
        bridgeLevelTwo[bridgeLength - 1].treatment = 'static';

        // horizontal trusses
        for (let i = 1; i < bridgeLength; i++) {
            rigidConstraints.distanceConstraint(bridgeLevelOne[i - 1], bridgeLevelOne[i], trussDistantConstraint);
            rigidConstraints.distanceConstraint(bridgeLevelTwo[i - 1], bridgeLevelTwo[i], trussDistantConstraint);
        }

        // vertical trusses
        for (let i = 0; i < bridgeLength; i++) {
            rigidConstraints.distanceConstraint(bridgeLevelOne[i], bridgeLevelTwo[i], trussDistantConstraint);
        }

        // diagonal trusses
        for (let i = 0; i < bridgeLength - 1; i++) {
            if (i % 2 === 0) {
                rigidConstraints.distanceConstraint(bridgeLevelOne[i], bridgeLevelTwo[i + 1], trussDistantConstraint);
            } else {
                rigidConstraints.distanceConstraint(bridgeLevelTwo[i], bridgeLevelOne[i + 1], trussDistantConstraint);
            }
        }

        component.world.on('render', function(data: any) {
            const renderer = data.renderer;

            const constraints = rigidConstraints.getConstraints().distanceConstraints;
            const scratch = Physics.scratchpad();
            const v = scratch.vector();

            for (let i = 0; i < constraints.length; i++ ) {
                const constraint = constraints[i];
                const length = v.clone(constraint.bodyB.state.pos).vsub(constraint.bodyA.state.pos ).norm();

                // break the constraint if above threshold
                const distanceRatio = length / constraint.targetLength;

                if (distanceRatio > topThreshold || distanceRatio < bottomThreshold) {
                    rigidConstraints.remove(constraint);
                } else {
                    renderer.drawLine(constraint.bodyA.state.pos, constraint.bodyB.state.pos, bridgeLineStyle);
                }
            }
            scratch.done();
        });

        // add some fun interaction
        const attractor = Physics.behavior('attractor', {
            order: 0,
            strength: 0.002
        });

        component.world.on({
            'interact:poke': function(pos: any) {
                component.world.wakeUpAll();
                attractor.position(pos);
                component.world.add(attractor);
            },
            'interact:move': function(pos: any) {
                attractor.position(pos);
            },
            'interact:release': function() {
                component.world.wakeUpAll();
                component.world.remove(attractor);
            }
        });

        // add things to the world
        component.world.add(bridgeLevelOne);
        component.world.add(bridgeLevelTwo);
        component.world.add(rigidConstraints);
        component.world.add([
            Physics.behavior('interactive', { el: renderer.el }),
            Physics.behavior('constant-acceleration'),
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
            edgeBounce
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function(time: any) {
            component.world.step( time );
        });
    }
}
