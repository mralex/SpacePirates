define(['jquery', 'underscore', 'backbone', 'src/engine'], function($, _, Backbone, Engine) {
    var init = function() {
        var SceneCollisionManager = Engine.BaseComponent.extend({
                type: 'SceneCollisionManager',

                onStart: function() {
                    this.set('colliders', []);

                    _.bindAll(this, 'childAdded', 'childRemoved', 'lateStep');
                    this.gameObject.children.on('add', this.childAdded);
                    this.gameObject.children.on('remove', this.childRemoved);
                    this.gameObject.on('lateStep', this.lateStep);
                },

                childAdded: function(gameObject) {
                    if (gameObject.components.ofType('AxisAlignedBoundsComponent')) {
                        this.attributes.colliders.push(gameObject);
                    }
                },

                childRemoved: function(gameObject) {
                    var index = this.attributes.colliders.indexOf(gameObject);
                    if (index > -1) {
                        this.attributes.colliders.splice(index, 1);
                    }
                },

                lateStep: function(dt) {
                    var colliders = this.attributes.colliders,
                        colliderCount = colliders.length,
                        colliderA,
                        colliderB,
                        componentA,
                        componentB,
                        boxA,
                        boxB,
                        i,
                        j;

                    for (i = 0; i < colliderCount; i++) {
                        colliderA = colliders[i];
                        for (j = 0; j < colliderCount; j++) {
                            colliderB = colliders[j];
                            if (colliderA === colliderB) {
                                continue;
                            }

                            componentA = colliderA.components.ofType('AxisAlignedBoundsComponent');
                            componentB = colliderB.components.ofType('AxisAlignedBoundsComponent');
                            boxA = componentA.getBounds();
                            boxB = componentB.getBounds();

                            if (boxA.intersects(boxB)) {

                                if (componentA.colliders.indexOf(colliderB) < 0) {
                                    colliderA.trigger('collision', colliderB);
                                    componentA.colliders.push(colliderB);
                                }
                                if (componentB.colliders.indexOf(colliderA) < 0) {
                                    colliderB.trigger('collision', colliderA);
                                    componentB.colliders.push(colliderA);
                                }
                            }
                        }
                    }
                }
            });

        var game = new Engine.Engine({ el: '#gameCanvas' });
        window.game = game;

        var scene = new Engine.Scene({ name: 'test2', w: game.width(), h: game.height() });
        game.scenes.add(scene);

        scene.components.add(new SceneCollisionManager());

        scene.load(function() {
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
                            this.gameObject.set('velocity', this.gameObject.forward().multiply(speed * dt));
                        }
                        if (this.scene.inputManager().isKeyDown('S')) {
                            this.gameObject.set('velocity', this.gameObject.forward().multiply(-speed * dt));
                        }
                        this.gameObject.set('position', pos.add(this.gameObject.get('velocity')));
                    }
                }),

                BulletComponent = Engine.BaseComponent.extend({
                    type: 'BulletComponent',
                    onStart: function() {
                        _.delay(this.gameObject.destroy, 1000);
                    },
                    step: function(dt) {
                        var pos = this.gameObject.position();

                        this.gameObject.set('position', pos.add(this.gameObject.forward().multiply(300 * dt)));
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

                                // bullet.set('position', this.gameObject.position().add(pos));
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
                }),
                AxisAlignedBoundsComponent = Engine.BaseComponent.extend({
                    type: 'AxisAlignedBoundsComponent',

                    defaults: function() {
                        defaults = {
                            drawBounds: true
                        };
                        return _.extend(AxisAlignedBoundsComponent.__super__.defaults(), defaults);
                    },

                    onStart: function() {
                        _.bindAll(this, 'drawBounds', 'onCollision');

                        // if (this.get('drawBounds') === true) {
                            this.gameObject.on('lateDraw', this.drawBounds);
                        // }

                        this.gameObject.on('collision', this.onCollision);

                        this.colliders = [];
                    },

                    getBounds: function() {
                        return Engine.AABoundingBox.fromRect(this.getRect());
                    },

                    abs: function(v) {
                        return (v < 0 ? -v : v);
                    },

                    getRect: function() {
                        if (!this.rect) {
                            var pos = this.gameObject.position(),
                                sin = this.abs(Math.sin(this.gameObject.rotation())),
                                cos = this.abs(Math.cos(this.gameObject.rotation()));

                            w = (this.gameObject.bounds().h * sin) + (this.gameObject.bounds().w * cos);
                            h = (this.gameObject.bounds().h * cos) + (this.gameObject.bounds().w * sin);
                            x = pos.x - (w / 2);
                            y = pos.y - (h / 2);

                            this.rect = {
                                x: x,
                                y: y,
                                w: w,
                                h: h
                            };
                        }

                        return this.rect;
                    },

                    step: function(dt) {
                        this.colliders = [];
                        this.rect = null;
                        this.strokeColor = '#0f0';
                    },

                    drawBounds: function(ctx) {
                        ctx.save();
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.rotate(0);
                        ctx.strokeStyle = this.strokeColor;
                        ctx.lineWidth = 0.75;
                        ctx.strokeRect(this.getRect().x, this.getRect().y, this.getRect().w, this.getRect().h);
                        ctx.restore();
                    },

                    onCollision: function(gameObject) {
                        // XXX Trigger narrow phase collision detection?
                    }
                });

            var arm, 
                entity = new Engine.GameObject({
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
                        w: 1,
                        h: 1,
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
                        var bullet = new Engine.GameObject({
                                position: new Engine.Vector2.zero(),
                                w: 3,
                                h: 3,
                                tag: 'bullet'
                            });

                        bullet.components.add([new BulletComponent(), new AxisAlignedBoundsComponent()]);
                        return bullet;
                    }
                }),
                new AxisAlignedBoundsComponent({})
            ]);
            this.children.add(entity);

            entity.on('collision', function(c) {
                if (c.get('tag') === 'bullet') {
                    return;
                }

                if (c.get('tag') === 'wall') {
                    var pos = this.position(),
                        x = pos.x,
                        y = pos.y,
                        v = this.get('velocity'),

                        wallBounds = c.components.ofType('AxisAlignedBoundsComponent').getBounds(),
                        bounds = this.components.ofType('AxisAlignedBoundsComponent').getBounds(),

                        direction = this.position().subtract(c.position()),

                        ox, oy;

                    ox = (bounds.halfDimension.x + wallBounds.halfDimension.x) - (Math.abs(direction.x));
                    oy = (bounds.halfDimension.y + wallBounds.halfDimension.y) - (Math.abs(direction.y));

                    if (ox < oy) {
                        if (direction.x < 0) {
                            x -= ox;
                        } else {
                            x += ox;
                        }
                    } else {
                        if (direction.y < 0) {
                            y -= oy;
                        } else {
                            y += oy;
                        }
                    }

                    this.set('position', new Engine.Vector2(x, y));
                }
            });

            var wall = new Engine.GameObject({
                position: new Engine.Vector2(100, this.height() / 2),
                w: 50,
                h: 100,
                render: true,
                hp: 10,
                tag: 'wall'
            });
            wall.components.add([new AxisAlignedBoundsComponent()]);
            this.children.add(wall);

            wall.on('collision', function(c) {
                if (c.get('tag') === 'player') {
                    return;
                }

                c.destroy();

                var hp = this.get('hp');
                hp--;
                this.set('hp', hp);

                if (hp <= 0) {
                    this.destroy();
                }
            });
        });

        game.setActiveScene('test2');
        game.render();
    };

    window.Engine = Engine;

    return {
        init: init
    };
});