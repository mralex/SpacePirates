define(['jquery', 'underscore', 'backbone', 'src/engine'], function($, _, Backbone, Engine) {
    var init = function() {
        var game = new Engine.Engine({ el: '#gameCanvas' });
        window.game = game;

        var scene = new Engine.Scene({ name: 'test2', w: game.width(), h: game.height() });
        game.scenes.add(scene);

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

                        if (this.scene.inputManager().isKeyDown('W')) {
                            this.gameObject.set('position', pos.add(this.gameObject.forward().multiply(speed * dt)));
                        }
                        if (this.scene.inputManager().isKeyDown('S')) {
                            this.gameObject.set('position', pos.subtract(this.gameObject.forward().multiply(speed * dt)));
                        }
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

                            var pos = this.gameObject.children.where({name: 'barrel'})[0].position(),
                                bullet = this.get('bulletObject')();

                            bullet.set('position', this.gameObject.position().add(pos));
                            bullet.set('rotation', this.gameObject.rotation());

                            this.scene.children.add(bullet);
                        }

                        if (this.reloadTimer > 0) {
                            this.reloadTimer -= dt;
                        }
                    }
                });

            var entity = new Engine.GameObject({
                position: new Engine.Vector2(this.width() / 2, this.height() / 2),
                    w: 15,
                    h: 20
                });

            entity.components.add([
                new MoveComponent({ speed: 250 }),
                new RotationComponent({ rotationSpeed: 200 }),
                new GunComponent({
                    reloadTime: 0.25,
                    bulletObject: function() {
                        var bullet = new Engine.GameObject({
                                position: new Engine.Vector2.zero(),
                                w: 3,
                                h: 3
                            });

                        bullet.components.add([new BulletComponent()]);
                        return bullet;
                    }
                })
            ]);
            this.children.add(entity);

            entity.children.add([
                new Engine.GameObject({
                    position: new Engine.Vector2(-15, 3),
                    w: 5,
                    h: 25,
                    fillStyle: '#d00'
                }),
                new Engine.GameObject({
                    position: new Engine.Vector2(15, 3),
                    w: 5,
                    h: 25,
                    fillStyle: '#d00'
                }),
                new Engine.GameObject({
                    position: new Engine.Vector2(0, 0),
                    w: 30,
                    h: 10,
                    fillStyle: '#f00'
                }),
                new Engine.GameObject({
                    position: new Engine.Vector2(0, -12),
                    w: 1,
                    h: 1,
                    render: false,
                    name: 'barrel'
                })
            ]);
        });

        game.setActiveScene('test2');
        game.render();
    };

    window.Engine = Engine;

    return {
        init: init
    };
});