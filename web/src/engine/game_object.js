// GameObject Module

define([
    'jquery',
    'underscore',
    'backbone',
    './math/vector2',
    './math/bounding_box',
    './math/uuid',
    './game_object_collection'
], function($, _, Backbone, Vector2, AABoundingBox, UUID, GameObjectCollection) {
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
                fillStyle: '#fff',
                render: true,
                _parent: null
            };
        },

        initialize: function(options) {
            _.bindAll(this, 'draw', 'destroy');

            this.set('type', this.type);
            this.components = new GameObjectCollection(null, { gameObject: this });
            this.children = new GameObjectCollection(null, { gameObject: this });

            this.on('change:_parent', this._parentChanged);
            this.on('change:rotation', this._rotationChanged);

            this.on('destroy', this._destroyChildren);
            this.on('draw', this.thisDraw);
        },

        position: function() {
            //return this.get('position');
            return this.attributes.position;
        },

        absolutePosition: function() {
            var absolutePosition, r;
            // get parent position
            if (this.parent().type === 'Scene') {
                return this.position();
            } else {
                absolutePosition = this.parent().absolutePosition();
            }

            r = this.absoluteRotation();
            return absolutePosition.add(this.position().rotate(r, Vector2.zero()));
        },

        absoluteRotation: function() {
            var r;

            if (this.parent()) {
                r = this.parent().absoluteRotation();
            }

            return this.rotation() + r;
        },

        boundingBox: function() {
            if (!this._boundingBox) {
                this._boundingBox = new AABoundingBox(this.position(), new Vector2(this.width() * 0.5, this.height() * 0.5));
            }
            return this._boundingBox;
        },

        bounds: function() {
            if (!this._bounds) {
                var bounds = this.boundingBox(),
                    pos = this.position(),
                    w = this.width(),
                    h = this.height(),
                    coords = bounds.rectCoordinates(),
                    rect = bounds.toRect();

                this.children.each(function(child) {
                    var cb = child.boundingBox(),
                        cp = child.position(),
                        cw = child.width(),
                        ch = child.height(),
                        absPos = pos.add(cp),
                        childRect = cb.toRectAtPoint(absPos),
                        childCoords = cb.rectCoordinatesAtPoint(absPos);

                    if ((cw === 0 && ch === 0) || !child.get('render')) {
                        return;
                    }

                    if (childCoords.tl.x < coords.tl.x) {
                        coords.tl.x = childCoords.tl.x;
                    }

                    if (childCoords.tr.x > coords.tr.x) {
                        coords.tr.x = childCoords.tr.x;
                    }

                    if (childCoords.tl.y < coords.tl.y) {
                        coords.tl.y = childCoords.tl.y;
                    }

                    if (childCoords.bl.y > coords.bl.y) {
                        coords.bl.y = childCoords.bl.y;
                    }
                });

                this._bounds = {
                    w: coords.tr.x - coords.tl.x,
                    h: coords.bl.y - coords.tl.y
                };
            }

            return this._bounds;
        },

        rotation: function() {
            return this.attributes.rotation;
        },

        width: function() {
            return this.attributes.w;
        },

        height: function() {
            return this.attributes.h;
        },

        parent: function() {
            return this.attributes._parent;
        },

        _up: function(rotation) {
            var rot = rotation - 1.570;

            return new Vector2(Math.cos(rot), Math.sin(rot));
        },

        up: function() {
            return this._up(this.rotation());
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

            this.trigger('step', dt);
            this.thisStep(dt);

            this._boundingBox = null;

            this.children.invoke('step', dt);
            this.trigger('lateStep', dt);
        },

        thisStep: function(dt) {},

        draw: function(ctx) {
            var pos = this.position();

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.rotation());

            if (this.get('render')) {
                this.trigger('draw', ctx);
            }

            this.children.invoke('draw', ctx);
            this.trigger('lateDraw', ctx);
            ctx.restore();
        },

        thisDraw: function(ctx) {
            ctx.fillStyle = this.get('fillStyle') || '#fff';
            ctx.fillRect(-(this.width() / 2), -(this.height() / 2), this.width(), this.height());
        },

        _parentChanged: function() {
            this.components.invoke('_parentChanged');
        },

        _rotationChanged: function() {
            this._bounds = null;
        },

        _destroyChildren: function() {
            this.children.each(function(child) {
                child.trigger('destroy');
            });
            this.children.remove(this.children.where({ _destroyed: true }));
        }
    });

    return GameObject;
});