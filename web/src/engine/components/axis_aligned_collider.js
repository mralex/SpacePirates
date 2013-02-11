define([
    'jquery',
    'underscore',
    'backbone',
    '../math/bounding_box',
    '../game_object',
    '../base_component'
], function($, _, Backbone, AABoundingBox, GameObject, BaseComponent) {
    var AxisAlignedColliderComponent = BaseComponent.extend({
        type: 'ColliderComponent',
        colliderType: 'AxisAligned',

        defaults: function() {
            defaults = {
                drawBounds: true
            };
            return _.extend({}, AxisAlignedColliderComponent.__super__.defaults.call(this), defaults);
        },

        onStart: function() {
            _.bindAll(this, 'drawBounds', 'onCollision');

            if (this.get('drawBounds')) {
                this.gameObject.on('lateDraw', this.drawBounds);
            }

            this.gameObject.on('collision', this.onCollision);

            this.colliders = [];
        },

        getBounds: function() {
            return AABoundingBox.fromRect(this.getRect());
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
                x = pos.x - (w * 0.5);
                y = pos.y - (h * 0.5);

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

    return AxisAlignedColliderComponent;
});