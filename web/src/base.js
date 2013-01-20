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
          currentTime = +new Date,
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

var Context = Backbone.Model.extend({
    defaults: {
        'ctx': null,
        'width': 0,
        'height': 0
    },

    setContext: function(canvas) {
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            this.trigger('context-error');
            return;
        }
        
        this.set('ctx', ctx);
        this.set('width', canvas.width);
        this.set('height', canvas.height);

        this.trigger('context-success');
    },

    ctx: function() {
        return this.get('ctx');
    },

    width: function() {
        return this.get('width');
    },

    height: function() {
        return this.get('height');
    }
});

var Engine = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Context();
        this.model.on('context-error', this.contextError);
        this.model.on('context-success', this.contextSuccess);

        this.model.setContext(this.el);

        this.renderer = new Renderer({ model: this.model, game: this });
        this.gameObjects = new GameObjectCollection();
    },

    render: function() {
        this.renderer.start();
        return this;
    },

    contextError: function() {
        $('#msg').text('Error: No graphics context available!');
    },

    contextSuccess: function() {
        $('#msg').text('Graphics context found.');
    }
});

var Renderer = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'start', 'loop', 'step', 'draw');
        this.ctx = this.model.ctx();

        this.game = options.game;
    },

    start: function() {
        this.previousDeltaTime = +new Date();
        this.loop(this.previousDeltaTime);
    },

    loop: function(timestamp) {
        var dt = (timestamp - this.previousDeltaTime) / 1000 ;
        this.previousDeltaTime = timestamp;

        this.step(dt);
        this.draw();

        window.requestAnimationFrame(this.loop);
    },

    step: function(dt) {
        $('#msg').text(new Date() + ': ' + dt);
        this.game.gameObjects.invoke('step', dt);
    },

    draw: function() {
        this.ctx.clearRect(0, 0, this.model.get('width'), this.model.get('height'));

        this.game.gameObjects.invoke('draw', this.ctx);
    }
});


var GameObject = Backbone.Model.extend({
    defaults: {
        id: 0,
        position: Vector3.zero(),
        w: 0,
        h: 0,
        parent: null
    },

    initialize: function(options) {
        this.components = null;

        if (this.get('parent') === null) {
            this.set('parent', new GameObject());
        }
    },

    position: function() {
        return this.get('position');
    },

    width: function() {
        return this.get('w');
    },

    height: function() {
        return this.get('h');
    },

    parent: function() {
        return this.get('parent');
    },

    step: function(dt) {},

    draw: function(ctx) {
        var pos = this.position();
        ctx.fillStyle = this.get('fillStyle') || '#fff';
        ctx.fillRect(pos.x, pos.y, this.width(), this.height());
    }
});

var GameObjectCollection = Backbone.Collection.extend({
    model: GameObject
});


var Entity = GameObject.extend({
    step: function(dt) {
        var pos = this.position();
        pos.x += dt * this.get('speed');

        if (pos.x > this.parent().width()) {
            pos.x = 0 - this.width();
        }

    }
});