define([
  'underscore',
  './vector2'
], function(_, Vector2) {

    var AABoundingBox = function(position, halfDimension) {
        this.position = position; // Vector2
        this.halfDimension = halfDimension
    };

    AABoundingBox.prototype = {
        rectCoordinates: function() {
            if (!this._coords) {
                this._coords = {
                    tl: new Vector2(this.position.x - this.halfDimension.x, this.position.y - this.halfDimension.y),
                    tr: new Vector2(this.position.x + this.halfDimension.x, this.position.y - this.halfDimension.y),
                    bl: new Vector2(this.position.x - this.halfDimension.x, this.position.y + this.halfDimension.y),
                    br: new Vector2(this.position.x + this.halfDimension.x, this.position.y + this.halfDimension.y)
                }
            }
            return this._coords;
        },

        toRect: function() {
            if (!this._rect) {
                var coords = this.rectCoordinates();

                this._rect = {
                    x: coords.tl.x,
                    y: coords.tr.y,
                    w: this.halfDimension.x * 2,
                    h: this.halfDimension.y * 2
                }
            }
            return this._rect;
        },

        containsPoint: function(point) {
            var rect = this.rectCoordinates();

            if (point.greaterThan(rect.tl) && point.lessThan(rect.br)) {
                return true;
            }

            return false;
        },

        intersects: function(box) {
            var rect = this.rectCoordinates(),
                boxRect = box.rectCoordinates();

            return !(
                boxRect.tl.x > rect.tr.x ||
                boxRect.tr.x < rect.tl.x ||
                boxRect.tl.y > rect.bl.y ||
                boxRect.bl.y < rect.tl.y
            );
        }
    };

    return AABoundingBox;
});
