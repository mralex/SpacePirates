define([
  'underscore',
  './vector2'
], function(_, Vector2) {

    var AABoundingBox = function(position, halfDimension) {
        this.position = position; // Vector2
        this.halfDimension = halfDimension;
    };

    AABoundingBox.fromRect = function(rect) {
        var w = rect.w * 0.5,
            h = rect.h * 0.5;

        return new AABoundingBox(
            new Vector2(rect.x + w, rect.y + h),
            new Vector2(w, h)
        );
    };

    AABoundingBox.prototype = {
        rectCoordinatesAtPoint: function(p) {
            return {
                tl: new Vector2(p.x - this.halfDimension.x, p.y - this.halfDimension.y),
                tr: new Vector2(p.x + this.halfDimension.x, p.y - this.halfDimension.y),
                bl: new Vector2(p.x - this.halfDimension.x, p.y + this.halfDimension.y),
                br: new Vector2(p.x + this.halfDimension.x, p.y + this.halfDimension.y)
            };
        },

        rectCoordinates: function() {
            if (!this._coords) {
                this._coords = this.rectCoordinatesAtPoint(this.position);
            }
            return this._coords;
        },

        toRectAtPoint: function(p) {
            var coords = this.rectCoordinatesAtPoint(p);
            return {
                x: coords.tl.x,
                y: coords.tr.y,
                w: this.halfDimension.x * 2,
                h: this.halfDimension.y * 2
            };
        },

        toRect: function() {
            if (!this._rect) {
                this._rect = this.toRectAtPoint(this.position);
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
            var rect = this.toRect(),
                boxRect = box.toRect();

            // var v = box.position.subtract(this.position);

            // return Math.abs(v.x) <= (box.position.x + box.halfDimension.x) &&
            //        Math.abs(v.y) <= (box.position.y + box.halfDimension.y);

                // (min.x < other.max.x) && (max.x > other.min.x) &&
                //      (min.y < other.max.y) && (max.y > other.min.y) &&
                //      (min.z < other.max.z) && (max.z > other.min.z);
                //  }

            // return (rect.tl.x < boxRect.tr.x) && (rect.tr.x > boxRect.tl.x) &&
            //        (rect.tl.y < boxRect.bl.y) && (rect.bl.y > boxRect.tl.y);

            // (b1_x > b2_x + b2_w - 1) || // is b1 on the right side of b2?
            // (b1_y > b2_y + b2_h - 1) || // is b1 under b2?
            // (b2_x > b1_x + b1_w - 1) || // is b2 on the right side of b1?
            // (b2_y > b1_y + b1_h - 1))   // is b2 under b1?

            return !(
                rect.x > boxRect.x + boxRect.w ||
                rect.y > boxRect.y + boxRect.h ||
                boxRect.x > rect.x + rect.w ||
                boxRect.y > rect.y + rect.h
            );

            // return !(
            //     boxRect.tl.x > rect.tr.x ||
            //     boxRect.tr.x < rect.tl.x ||
            //     boxRect.tl.y > rect.bl.y ||
            //     boxRect.bl.y < rect.tl.y
            // );
        }
    };

    return AABoundingBox;
});
