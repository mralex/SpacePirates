// GameObject Module

define([
    'jquery',
    'underscore',
    'backbone',
    './math/vector2',
    './math/uuid',
    './game_object_collection'
], function($, _, Backbone, Vector2, UUID, GameObjectCollection) {
    var GameObject = Backbone.Model.extend({
        type: 'GameObject',

        defaults: function() { 
            return {
                id: UUID.uuidFast(),
                position: Vector2.zero(),
                rotation: 0.0,
                absoluteRotation: 0.0,
                w: 0,
                h: 0,
                render: true,
                _parent: null
            };
        },

        initialize: function(options) {
            _.bindAll(this, 'destroy');

            this.set('type', this.type);
            this.components = new GameObjectCollection(null, { gameObject: this });
            this.children = new GameObjectCollection(null, { gameObject: this });

            this.on('change:_parent', this._parentChanged);
            this.on('destroy', this._destroyChildren);

            this.postInitialize();
        },

        position: function() {
            //return this.get('position');
            return this.attributes.position;
        },

        absolutePosition: function() {
            var absolutePosition, pos, r, sin, cos, x, y;
            // get parent position
            if (this.parent().type === 'Scene') {
                return this.position();
            } else {
                absolutePosition = this.parent().absolutePosition();
            }

            r = this.absoluteRotation();

            // add our local position
            pos = this.position();

            sin = Math.sin(r);
            cos = Math.cos(r);

            x = (pos.x * cos) - (pos.y * sin);
            y = (pos.y * cos) + (pos.x * sin);

            return absolutePosition.add(new Vector2(x, y));
        },

        absoluteRotation: function() {
            var r;

            if (this.parent()) {
                r = this.parent().absoluteRotation();
            }

            return this.rotation() + r;
        },

        rotation: function() {
            return this.attributes.rotation;
        },

        width: function() {
            //return this.get('w');
            return this.attributes.w;
        },

        height: function() {
            //return this.get('h');
            return this.attributes.h;
        },

        parent: function() {
            return this.attributes._parent;
        },

        _forward: function(rotation) {
            var rot = rotation - 1.570;

            return new Vector2(Math.cos(rot), Math.sin(rot));
        },

        forward: function() {
            return this._forward(this.rotation());
        },

        _right: function(rotation) {
            var rot = rotation;

            return new Vector2(Math.cos(rot), Math.sin(rot));
        },

        right: function() {
            return this._right(this.rotation());
        },

        destroy: function() {
            this.set('_destroyed', true);
        },

        onStart: function() {},

        step: function(dt) {
            this.components.invoke('step', dt);

            this.thisStep(dt);

            this.children.invoke('step', dt);
        },

        thisStep: function(dt) {},

        draw: function(ctx) {
            var pos = this.position();

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.rotation());

            if (this.get('render')) {
                this.thisDraw(ctx);
            }

            this.children.invoke('draw', ctx);
            ctx.restore();
        },

        thisDraw: function(ctx) {
            var pos = this.position();

            // if (pos.x < 0 || pos.x > this.width() || pos.y < 0 || pos.y > this.height()) {
            //     return;
            // }

            ctx.fillStyle = this.get('fillStyle') || '#fff';

            ctx.fillRect(-(this.width() / 2), -(this.height() / 2), this.width(), this.height());
        },

        _parentChanged: function() {
            this.components.invoke('_parentChanged');
        },

        _destroyChildren: function() {
            this.children.each(function(child) {
                child.trigger('destroy');
            });
            this.children.remove(this.children.where({ _destroyed: true }));
        },

        postInitialize: function() {}
    });

    return GameObject;
});