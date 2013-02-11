define([
    '../engine/scene',
    '../engine/components/collision_manager',
    '../engine/entities/collider_entity',
    '../engine/math/vector2'
], function(Scene, SceneCollisionManager, ColliderEntity, Vector2) {
    var Level = Scene.extend({
        initialize: function(options) {
            Level.__super__.initialize.apply(this, arguments);
            this.components.add(new SceneCollisionManager());
        },

        onStart: function() {
            this.generateWalls();
        },

        generateWalls: function() {
            var top, left, bottom, right;
            
            top = new ColliderEntity({
                position: new Vector2(this.width() / 2, 0),
                w: this.width(),
                h: 10,
                render: true,
                tag: 'wall',
                fillStyle: '#333'
            });

            left = new ColliderEntity({
                position: new Vector2(0, this.height() / 2),
                w: 10,
                h: this.height(),
                render: true,
                tag: 'wall',
                fillStyle: '#333'
            });

            bottom = new ColliderEntity({
                position: new Vector2(this.width() / 2, this.height()),
                w: this.width(),
                h: 10,
                render: true,
                tag: 'wall',
                fillStyle: '#333'
            });

            right = new ColliderEntity({
                position: new Vector2(this.width(), this.height() / 2),
                w: 10,
                h: this.height(),
                render: true,
                tag: 'wall',
                fillStyle: '#333'
            });

            this.children.add([top, left, bottom, right]);
        }
    });

    return Level;
});