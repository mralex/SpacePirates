define([
  'underscore',
  './vector2',
  './bounding_box'
], function(_, Vector2, AABoundingBox) {

    var QuadTree = function(boundingBox, nodeCapacity) {
        this.boundingBox = boundingBox;
        this.nodeCapacity = nodeCapacity || QuadTree.DEFAULT_NODE_CAPACITY;

        this.rootNode = new QuadTreeNode(this.boundingBox, this.nodeCapacity);
    };

    QuadTree.DEFAULT_NODE_CAPACITY = 4;

    QuadTree.prototype = {
        insert: function(point) {
            return this.rootNode.insert(point);
        },

        queryRange: function(range) {
            return this.rootNode.queryRange(range);
        },

        quadCount: function() {
            return this.rootNode.quadCount();
        }
    };

    var QuadTreeNode = function(boundingBox, capacity) {
        this.capacity = capacity;
        this.boundary = boundingBox;
        this.points = [];
        this.northWest = null;
        this.northEast = null;
        this.southWest = null;
        this.southEast = null;
    };

    QuadTreeNode.prototype = {
        insert: function(point) {
            if (!this.boundary.containsPoint(point)) {
                return false;
            }

            if (this.points.length < this.capacity) {
                this.points.push(point);
                return true;
            }

            if (!this.northWest) {
                this.subdivide();
            }

            if (this.northWest.insert(point)) {
                return true;
            } else if (this.northEast.insert(point)) {
                return true;
            } else if (this.southWest.insert(point)) {
                return true;
            } else if (this.southEast.insert(point)) {
                return true;
            }

            return false;
        },

        subdivide: function() {
            var position = this.boundary.position,
                newHalfSize = new Vector2(this.boundary.halfDimension.x * 0.5, this.boundary.halfDimension.y * 0.5),
                centerBox = new AABoundingBox(position, newHalfSize),
                point;

            this.northWest = new QuadTreeNode(new AABoundingBox(centerBox.rectCoordinates().tl, newHalfSize), this.capacity);
            this.northEast = new QuadTreeNode(new AABoundingBox(centerBox.rectCoordinates().tr, newHalfSize), this.capacity);
            this.southWest = new QuadTreeNode(new AABoundingBox(centerBox.rectCoordinates().bl, newHalfSize), this.capacity);
            this.southEast = new QuadTreeNode(new AABoundingBox(centerBox.rectCoordinates().br, newHalfSize), this.capacity);

            for (var i = 0; i < this.points.length; i++) {
                point = this.points[i];

                if (this.northWest.insert(point)) {
                    continue;
                } else if (this.northEast.insert(point)) {
                    continue;
                } else if (this.southWest.insert(point)) {
                    continue;
                } else if (this.southEast.insert(point)) {
                    continue;
                }
            }
        },

        queryRange: function(range) {
            var pointsInRange = [],
                i;

            if (!this.boundary.intersects(range)) {
                return points;
            }

            for (i = 0; i < this.points.length; i++) {
                if (range.containsPoint(this.points[i])) {
                    pointsInRange.push(this.points[i]);
                }
            }

            pointsInRange.concat(this.northWest.queryRange(range));
            pointsInRange.concat(this.northEast.queryRange(range));
            pointsInRange.concat(this.southWest.queryRange(range));
            pointsInRange.concat(this.southEast.queryRange(range));

            return pointsInRange;
        },

        quadCount: function() {
            var count = 1;

            if (!this.northWest) {
                return count;
            }

            count += this.northWest.quadCount();
            count += this.northEast.quadCount();
            count += this.southWest.quadCount();
            count += this.southWest.quadCount();

            return count;
        }
    };

    return {
        QuadTree: QuadTree,
        QuadTreeNode: QuadTreeNode
    };
});
