// requestAnimationFrame polyfill by @rma4ok
!function (window) {
  var
      equestAnimationFrame = 'equestAnimationFrame',
      requestAnimationFrame = 'r' + equestAnimationFrame,
 
      ancelAnimationFrame = 'ancelAnimationFrame',
      cancelAnimationFrame = 'c' + ancelAnimationFrame,
 
      expectedTime = 0,
      vendors = ['moz', 'ms', 'o', 'webkit'],
      vendor;
 
  while (!window[requestAnimationFrame] && (vendor = vendors.pop())) {
    window[requestAnimationFrame] = window[vendor + 'R' + equestAnimationFrame];
    window[cancelAnimationFrame] =
        window[vendor + 'C' + ancelAnimationFrame] ||
            window[vendor + 'CancelR' + equestAnimationFrame];
  }
 
  if (!window[requestAnimationFrame]) {
    window[requestAnimationFrame] = function (callback) {
      var
          currentTime = +new Date(),
          adjustedDelay = 16 - (currentTime - expectedTime),
          delay = adjustedDelay > 0 ? adjustedDelay : 0;
 
      expectedTime = currentTime + delay;
 
      return setTimeout(function () {
        callback(expectedTime);
      }, delay);
    };
 
    window[cancelAnimationFrame] = clearTimeout;
  }
}(this);

require.config({
    paths: {
        jquery: '../lib/jquery-1.9.0',
        underscore: '../lib/underscore',
        backbone: '../lib/backbone'
    }
});

require([
    'jquery',
    'underscore',
    'backbone', 
    '../src/engine',
    '../src/engine/math/bounding_box',
    '../src/engine/math/quad_tree'
], function($, _, Backbone, Engine, AABoundingBox, QT) {
    var game = new Engine.Engine({ el: '#gameCanvas' });
    window.game = game;


    var QuadTreeNodeVisual = Engine.GameObject.extend({
        postInitialize: function() {
            var quadTreeNode = this.get('quadTreeNode');

            if (quadTreeNode.northEast) {
                this.children.add(new QuadTreeNodeVisual({ quadTreeNode: quadTreeNode.northEast }));
                this.children.add(new QuadTreeNodeVisual({ quadTreeNode: quadTreeNode.northWest }));
                this.children.add(new QuadTreeNodeVisual({ quadTreeNode: quadTreeNode.southEast }));
                this.children.add(new QuadTreeNodeVisual({ quadTreeNode: quadTreeNode.southWest }));
            }
        },

        thisDraw: function(ctx) {
            var node = this.get('quadTreeNode'),
                rect = node.boundary.toRect();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 0.5;

            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        }
    });

    var QuadTreeVisual = Engine.GameObject.extend({
        defaults: function() { 
            var defaults = {
                w: 10,
                h: 10,
                pointCount: 100,
                nodeCapacity: 2,
                delay: 0.5
            };
            return _.extend(QuadTreeVisual.__super__.defaults(), defaults);
        },

        resetTimer: 0,

        makeTree: function() {
            var pos = new Engine.Vector2(this.width() * 0.5, this.height() * 0.5),
                i;
            this.quadTree = new QT.QuadTree(new AABoundingBox(pos, pos), this.get('nodeCapacity'));

            // this.generatePoints();

            for (i = 0; i < this.points.length; i++) {
                this.quadTree.insert(this.points[i]);
            }
            // this.generateVisual();
        },

        step: function(dt) {
            if (this.resetTimer > this.get('delay')) {
                this.resetTimer = this.get('delay');
            }
            this.resetTimer -= dt;
            
            if (this.resetTimer <= 0) {
                // this.makeTree();
                this.generatePoints();
                this.resetTimer = this.get('delay');
            }
            this.makeTree();
        },

        generatePoints: function() {
            var i,
                x,
                y,
                point,
                minX = 10,
                minY = 10,
                maxX = this.width() - 10 - minX,
                maxY = this.height() - 10 - minY;

            this.points = [];

            for (i = 0; i < this.get('pointCount'); i++) {
                x = Math.floor(Math.random() * maxX + minX);
                y = Math.floor(Math.random() * maxY + minY);

                point = new Engine.Vector2(x, y);

                this.points.push(point);
                // this.quadTree.insert(point);
            }

            // this.generateVisual();
        },

        generateVisual: function() {
            this.children.reset();
            this.children.add(new QuadTreeNodeVisual({ quadTreeNode: this.quadTree.rootNode }));

        },

        thisDraw: function(ctx) {
            var endAngle = 2 * Math.PI;
            ctx.fillStyle = '#fff';

            for (var i = 0; i < this.points.length; i++) {
                ctx.beginPath();
                ctx.arc(this.points[i].x, this.points[i].y, 3, 0, endAngle, false);
                ctx.closePath();
                ctx.fill();
            }
        }
    });

    var scene = new Engine.Scene({ name: 'test2', w: game.width(), h: game.height() });
    game.scenes.add(scene);

    scene.load(function() {
        var width = this.width(),
            height = this.height(),
            quadTree = new QuadTreeVisual({ w: width, h: height });
            //, position: new Engine.Vector2(width * 0.5, height * 0.5)
        this.children.add(quadTree);
    });

    game.setActiveScene('test2');
    game.render();
});