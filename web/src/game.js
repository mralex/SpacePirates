define([
    'jquery', 'underscore', 'backbone', 'src/engine', 'src/engine/entities/collider_entity', 'src/game/level'
], function($, _, Backbone, Engine, ColliderEntity, Level) {
    var init = function() {
        var game = new Engine.Engine({ el: '#gameCanvas' });
        window.game = game;

        var scene = new Level({ name: 'test2', w: game.width(), h: game.height() });
        game.scenes.add(scene);

        scene.load(function() {
            var thisScene = this;

            var RotationComponent = Engine.BaseComponent.extend({
                    type: 'RotationComponent',

                    step: function(dt) {
                        var rotationSpeed = this.get('rotationSpeed');

                        if (this.scene.inputManager().isKeyDown('D')) {
                            this.gameObject.attributes.rotation += (rotationSpeed * dt * Math.PI)/180;
                        }
                        if (this.scene.inputManager().isKeyDown('A')) {
                            this.gameObject.attributes.rotation -= (rotationSpeed * dt * Math.PI)/180;
                        }
                    }
                }),

                MoveComponent = Engine.BaseComponent.extend({
                    type: 'MoveComponent',

                    step: function(dt) {
                        var pos = this.gameObject.position(),
                            speed = this.get('speed');

                        this.gameObject.set('velocity', Engine.Vector2.zero());

                        if (this.scene.inputManager().isKeyDown('W')) {
                            this.gameObject.set('velocity', this.gameObject.up().multiply(speed * dt));
                        }
                        if (this.scene.inputManager().isKeyDown('S')) {
                            this.gameObject.set('velocity', this.gameObject.up().multiply(-speed * dt));
                        }
                        this.gameObject.set('position', pos.add(this.gameObject.get('velocity')));
                    }
                }),

                BulletComponent = Engine.BaseComponent.extend({
                    type: 'BulletComponent',

                    defaults: function() {
                        var defaults = {
                                speed: 400,
                                ttl: 1000
                            };

                        return _.extend(BulletComponent.__super__.defaults.call(this), defaults);
                    },

                    onStart: function() {
                        _.bindAll(this, 'collision');

                        _.delay(this.gameObject.destroy, this.get('ttl'));
                        this.gameObject.on('collision', this.collision);
                    },

                    collision: function(collider) {
                        if (collider.get('tag') === 'player') {
                            return;
                        }

                        this.gameObject.destroy();
                    },

                    step: function(dt) {
                        var pos = this.gameObject.position();

                        this.gameObject.set('position', pos.add(this.gameObject.up().multiply(this.get('speed') * dt)));
                    }
                }),
                GunComponent = Engine.BaseComponent.extend({
                    type: 'GunComponent',
                    reloadTimer: 0,
                    step: function(dt) {
                        if (this.scene.inputManager().isKeyDown('X') && this.reloadTimer <= 0) {
                            this.reloadTimer = this.get('reloadTime');

                            var pos, // = this.gameObject.children.where({name: 'barrel'})[0].absolutePosition(),
                                bullet,
                                barrels = this.get('barrelObjects');

                            for (var i = 0; i < barrels.length; i++) {
                                bullet = this.get('bulletObject')();
                                pos = barrels[i].absolutePosition();

                                // bullet.set('position', this.gameObject.position().add(pos));* 0.5
                                bullet.set('position', pos);
                                bullet.set('rotation', this.gameObject.rotation());

                                this.scene.children.add(bullet);
                            }
                        }

                        if (this.reloadTimer > 0) {
                            this.reloadTimer -= dt;
                        }
                    }
                }),
                RadialBoundsComponent = Engine.BaseComponent.extend({
                    type: 'RadialBoundsComponent',
                    onStart: function() {
                        _.bindAll(this, 'drawBounds');
                        this.gameObject.on('lateDraw', this.drawBounds);
                    },
                    drawBounds: function(ctx) {
                        var r = this.get('radius');

                        ctx.beginPath();
                        ctx.strokeStyle = '#0f0';
                        ctx.lineWidth = 0.25;
                        ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }),
                RotatedBoundsComponent = Engine.BaseComponent.extend({
                    type: 'RectBoundsComponent',
                    onStart: function() {
                        _.bindAll(this, 'drawBounds');
                        this.gameObject.on('lateDraw', this.drawBounds);
                    },
                    step: function(dt) {
                        // get the bounds
                        var bounds = this.gameObject.boundingBox(),
                            pos = this.gameObject.position(),
                            w = this.gameObject.width(),
                            h = this.gameObject.height(),
                            coords = bounds.rectCoordinates(),
                            rect = bounds.toRect();

                        this.gameObject.children.each(function(child) {
                            if (!child.get('render')) {
                                return;
                            }

                            var cb = child.boundingBox(),
                                cp = child.position(),
                                cw = child.width(),
                                ch = child.height(),
                                absPos = pos.add(cp),
                                childRect = cb.toRectAtPoint(absPos),
                                childCoords = cb.rectCoordinatesAtPoint(absPos);

                            if (childCoords.tl.x < coords.tl.x) {
                                // top left
                                w += coords.tl.x - childCoords.tl.x;
                                coords.tl.x = childCoords.tl.x;
                            }

                            if (childCoords.tr.x > coords.tr.x) {
                                w += childCoords.tr.x - coords.tr.x;
                                coords.tr.x = childCoords.tr.x;
                            }

                            if (childCoords.tl.y < coords.tl.y) {
                                h += coords.tl.y - childCoords.tl.y;
                                coords.tl.y = childCoords.tl.y;
                            }

                            if (childCoords.bl.y > coords.bl.y) {
                                h += childCoords.bl.y - coords.bl.y;
                                coords.bl.y = childCoords.bl.y;
                            }
                        });

                        coords.tr.x = coords.tl.x + w;
                        coords.tr.y = coords.tl.y;
                        coords.bl.x = coords.tl.x;
                        coords.br.x = coords.tl.x + w;
                        coords.br.y = coords.bl.y;

                        coords.tl = coords.tl.rotate(this.gameObject.rotation(), pos);
                        coords.tr = coords.tr.rotate(this.gameObject.rotation(), pos);
                        coords.bl = coords.bl.rotate(this.gameObject.rotation(), pos);
                        coords.br = coords.br.rotate(this.gameObject.rotation(), pos);

                        this.coords = coords;
                    },
                    drawBounds: function(ctx) {
                        if (!this.coords) {
                            this.step();
                        }
                        ctx.save();
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.rotate(0);
                        ctx.strokeStyle = '#0f0';
                        ctx.lineWidth = 0.75;
                        ctx.beginPath();
                        ctx.moveTo(this.coords.tl.x, this.coords.tl.y);
                        ctx.lineTo(this.coords.tr.x, this.coords.tr.y);
                        ctx.lineTo(this.coords.br.x, this.coords.br.y);
                        ctx.lineTo(this.coords.bl.x, this.coords.bl.y);
                        ctx.lineTo(this.coords.tl.x, this.coords.tl.y);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.restore();
                    }
                });

            var SweeperAI = Engine.BaseComponent.extend({
                type: 'SweeperAI',

                defaults: function() {
                    var defaults = {
                        speed: 150,
                        v: new Engine.Vector2(1, 0)
                    };

                    return _.extend({}, SweeperAI.__super__.defaults.call(this), defaults);
                },

                onStart: function() {
                    _.bindAll(this, 'collision', 'step');
                    this.gameObject.on('collision', this.collision);
                },

                collision: function(c, overlap) {
                    if (c.get('tag') === 'wall') {
                        var pos = this.gameObject.position(),
                            direction = this.gameObject.position().subtract(c.position());

                        if (overlap.x < overlap.y) {
                            if (direction.x < 0) {
                                // pos.x -= overlap.x;
                                this.set('v', new Engine.Vector2(-1, 0));
                            } else {
                                // pos.x += overlap.x;
                                this.set('v', new Engine.Vector2(1, 0));
                            }
                        } else {
                            if (direction.y < 0) {
                                // pos.y -= overlap.y;
                                this.set('v', new Engine.Vector2(0, -1));
                            } else {
                                // pos.y += overlap.y;
                                this.set('v', new Engine.Vector2(0, 1));
                            }
                        }

                        // this.gameObject.set('position', pos);
                    }
                },

                step: function(dt) {
                    var pos = this.gameObject.position(),
                        speed = this.get('speed');

                    pos = pos.add(this.get('v').multiply(speed * dt));
                    this.gameObject.set('position', pos);
                }
            });

            var arm, 
                entity = new ColliderEntity({
                    position: new Engine.Vector2(this.width() / 2, this.height() / 2),
                    w: 15,
                    h: 20,
                    tag: 'player'
                });

            var makeArm = function(x, y) {
                var arm = new Engine.GameObject({
                        position: new Engine.Vector2(x, y),
                        w: 5,
                        h: 25,
                        fillStyle: '#d00'
                    });
                arm.children.add([
                    new Engine.GameObject({
                        position: new Engine.Vector2(0, -15),
                        w: 0,
                        h: 0,
                        render: false,
                        name: 'barrel'
                    })
                ]);

                return arm;
            };

            entity.children.add([
                makeArm(-15, 3),
                makeArm(15, 3),
                new Engine.GameObject({
                    position: new Engine.Vector2(0, 0),
                    w: 30,
                    h: 10,
                    fillStyle: '#f00'
                })
            ]);

            entity.components.add([
                new MoveComponent({ speed: 250 }),
                new RotationComponent({ rotationSpeed: 200 }),
                new GunComponent({
                    reloadTime: 0.15,
                    barrelObjects: [
                        entity.children.at(0).children.at(0),
                        entity.children.at(1).children.at(0)
                    ],
                    bulletObject: function() {
                        var bullet = new ColliderEntity({
                                position: new Engine.Vector2.zero(),
                                w: 3,
                                h: 3,
                                tag: 'bullet'
                            });

                        bullet.components.add([new BulletComponent()]);
                        return bullet;
                    }
                })
            ]);
            this.children.add(entity);

            entity.on('collision', function(c, overlap) {
                if (c.get('tag') === 'bullet') {
                    return;
                }

                if (c.get('tag') === 'wall') {
                    var pos = this.position(),
                        direction = this.position().subtract(c.position());

                    if (overlap.x < overlap.y) {
                        if (direction.x < 0) {
                            pos.x -= overlap.x;
                        } else {
                            pos.x += overlap.x;
                        }
                    } else {
                        if (direction.y < 0) {
                            pos.y -= overlap.y;
                        } else {
                            pos.y += overlap.y;
                        }
                    }

                    this.set('position', pos);
                }
            });

            var wall = new ColliderEntity({
                position: new Engine.Vector2(150, this.height() / 2),
                w: 50,
                h: 100,
                hp: 10,
                tag: 'wall'
            });
            this.children.add(wall);

            this.children.add(new ColliderEntity({
                position: new Engine.Vector2(this.width() - 150, this.height() / 2),
                w: 50,
                h: 100,
                tag: 'wall'
            }));

            var sweeper = new ColliderEntity({
                position: new Engine.Vector2(30, 40),
                w: 20,
                h: 20,
                hp: 15,
                tag: 'mob',
                fillStyle: '#ff0'
            });

            sweeper.components.add(new SweeperAI({
                speed: 155
            }));
            this.children.add(sweeper);

            sweeper = new ColliderEntity({
                position: new Engine.Vector2(50, 80),
                w: 20,
                h: 20,
                hp: 15,
                tag: 'mob',
                fillStyle: '#ff0'
            });

            sweeper.components.add(new SweeperAI({
                speed: 165
            }));
            this.children.add(sweeper);

            sweeper = new ColliderEntity({
                position: new Engine.Vector2(20, 170),
                w: 20,
                h: 20,
                hp: 15,
                tag: 'mob',
                fillStyle: '#ff0'
            });

            sweeper.components.add(new SweeperAI({
                speed: 155
            }));
            this.children.add(sweeper);

            sweeper = new ColliderEntity({
                position: new Engine.Vector2(this.width() - 20, 170),
                w: 20,
                h: 20,
                hp: 15,
                tag: 'mob',
                fillStyle: '#ff0'
            });

            sweeper.components.add(new SweeperAI({
                speed: 155
            }));
            this.children.add(sweeper);

            sweeper = new ColliderEntity({
                position: new Engine.Vector2(150, 300),
                w: 20,
                h: 20,
                hp: 15,
                tag: 'mob',
                fillStyle: '#ff0'
            });

            sweeper.components.add(new SweeperAI({
                speed: 155,
                v: new Engine.Vector2(0, 1)
            }));
            this.children.add(sweeper);

            sweeper = new ColliderEntity({
                position: new Engine.Vector2(this.width() - 150, 350),
                w: 20,
                h: 20,
                hp: 15,
                tag: 'mob',
                fillStyle: '#ff0'
            });

            sweeper.components.add(new SweeperAI({
                speed: 155,
                v: new Engine.Vector2(0, 1)
            }));
            this.children.add(sweeper);

            // wall.on('collision', function(c) {
            //     if (c.get('tag') === 'player') {
            //         return;
            //     }

            //     c.destroy();

            //     var hp = this.get('hp');
            //     hp--;
            //     this.set('hp', hp);

            //     if (hp <= 0) {
            //         this.destroy();
            //         thisScene.children.withName('score')[0].set('text', 'Score: 100');
            //     }
            // });

            var scoreLabel = new Engine.Gui.Label({
                name: 'score',
                position: new Engine.Vector2(5, 10),
                text: 'Score: 0'
            });

            this.children.add(scoreLabel);
        });

        game.setActiveScene('test2');
        game.render();
    };

    window.Engine = Engine;

    return {
        init: init
    };
});