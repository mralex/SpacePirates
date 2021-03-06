define([
  'underscore'
], function(_) {

    var Vector2 = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    Vector2.prototype = {
        equals: function(v) {
            return (this.x === v.x) && (this.y === v.y);
        },

        distance: function(vector) {
            return this.subtract(vector).magnitude();
        },

        add: function(v) {
            var n = parseFloat(v);
            if (!_.isNaN(n) && typeof n === "number") {
                return new Vector2(this.x + n, this.y + n);
            }
            return new Vector2(this.x + v.x, this.y + v.y);
        },

        subtract: function(v) {
            var n = parseFloat(v);
            if (!_.isNaN(n) && typeof n === "number") {
                return new Vector2(this.x - n, this.y - n);
            }
            return new Vector2(this.x - v.x, this.y - v.y); 
        },

        multiply: function(v) {
            var n = parseFloat(v);
            if (!_.isNaN(n) && typeof n === "number") {
                return new Vector2(this.x * n, this.y * n);
            }
            return new Vector2(this.x * v.x, this.y * v.y);
        },

        divide: function(d) {
            var n = parseFloat(v);
            if (!_.isNaN(n) && typeof n === "number") {
                return new Vector2(this.x / n, this.y / n);
            }
            return new Vector2(this.x / d, this.y / d);
        },

        rotate: function(r, origin) {
            var sin = Math.sin(-r),
                cos = Math.cos(-r),
                x,
                y;

            if (!origin) {
                origin = Vector2.zero();
            }

            x = (origin.x + (this.x - origin.x) * cos) + ((this.y - origin.y) * sin);
            y = (origin.y - (this.x - origin.x) * sin) + ((this.y - origin.y) * cos);

            return new Vector2(x, y);
        },

        angle: function() {
            return Math.atan2(this.y, this.x);
        },

        sqrMagnitude: function() {
            return (this.x * this.x) + (this.y * this.y);
        },

        magnitude: function() {
            return Math.sqrt(this.sqrMagnitude());
        },

        normalize: function() {
            var magnitude = this.magnitude();
            return new Vector2(this.x / magnitude, this.y / magnitude);
        },

        dot: function(v) {
            return (this.x * v.x) + (this.y * v.y);
        },

        normalizedDot: function(v) {
            return this.normalize().dot(v.normalize());
        },

        leftNormal: function() {
            return new Vector2(this.y, -this.x);
        },

        rightNormal: function() {
            return new Vector2(-this.y, this.x);
        },

        greaterThan: function(v) {
            return (this.x > v.x && this.y > v.y);
        },

        lessThan: function(v) {
            return (this.x < v.x && this.y < v.y);
        }
    };

    Vector2.zero = function() {
        return new Vector2(0, 0);
    };

    Vector2.one = function() {
        return new Vector2(1, 1);
    };

    Vector2.up = function() {
        return new Vector2(0, -1);
    };

    Vector2.down = function() {
        return new Vector2(0, 1);
    };

    Vector2.left = function() {
        return new Vector2(-1, 0);
    };

    Vector2.right = function() {
        return new Vector2(1, 0);
    };

    return Vector2;
});
