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
    type: 'Context',

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

var InputListener = Backbone.View.extend({
    events: {
        'keydown': 'keyboard',
        'keyup': 'keyboard',
        'click': 'mouse',
        'mousedown': 'mouse',
        'mouseup': 'mouse',
    },

    initialize: function(options) {

    },

    _keyType: function(e) {
        var char = String.fromCharCode(e.keyCode);
        return {
            keyCode: e.keyCode,
            char: char,
            isShift: e.shiftKey,
            isAlt: e.altKey,
            isCtrl: e.ctrlKey,
            isMeta: e.metaKey,
            isEsc: e.keyCode === 27,
            isSuper: e.keyCode === 91
        };
    },

    _mouseInfo: function(e) {
        return {
            button: e.which,
            x: e.offsetX,
            y: e.offsetY
        };
    },

    keyboard: function(e) {
        e.preventDefault();
        this.trigger(e.type, this._keyType(e));
    },

    mouse: function(e) {
        e.preventDefault();
        this.trigger(e.type, this._mouseInfo(e));
    }
});

var Engine = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Context({ engine: this });
        this.model.on('context-error', this.contextError);
        this.model.on('context-success', this.contextSuccess);

        this.model.setContext(this.el);

        this.renderer = new Renderer({ model: this.model, game: this });
        this.scenes = new GameObjectCollection(null, { gameObject: this.model });
        this.activeScene = null;

        this.inputListener = new InputListener({ el: this.el });
    },

    setActiveScene: function(id) {
        if (_.isNumber(id)) {
            this.activeScene = this.scenes.at(id);
        } else {
            this.activeScene = this.scenes.where({name: id})[0];
        }
    },

    render: function() {
        this.activeScene.setup();
        this.renderer.start();
        return this;
    },

    contextError: function() {
        $('#msg').text('Error: No graphics context available!');
    },

    contextSuccess: function() {
        $('#msg').text('Graphics context found.');
    },

    width: function() {
        return this.model.width();
    },

    height: function() {
        return this.model.height();
    }
});

var Renderer = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'start', 'loop', 'step', 'draw');
        this.ctx = this.model.ctx();

        this.game = options.game;
    },

    start: function() {
        this.frames = 0;
        this.lastFPSTime = new Date();
        this.previousDeltaTime = +new Date();
        this.loop(this.previousDeltaTime);
    },

    loop: function(timestamp) {
        var dt = (timestamp - this.previousDeltaTime) / 1000 ;
        this.previousDeltaTime = timestamp;

        this.step(dt);
        this.draw();

        this.frames++;
        if (timestamp - this.lastFPSTime >= 1000) {
            this.lastFPSTime = timestamp;
            $('#fps').text(this.frames + ' fps');
            this.frames = 0;
        }

        window.requestAnimationFrame(this.loop);
    },

    step: function(dt) {
        //$('#msg').text(new Date() + ': ' + dt);
        this.game.activeScene.step(dt);
    },

    draw: function() {
        this.ctx.clearRect(0, 0, this.model.get('width'), this.model.get('height'));
        this.game.activeScene.draw(this.ctx);
    }
});


var GameObject = Backbone.Model.extend({
    type: 'GameObject',

    defaults: function() { 
        return {
            id: Math.uuidFast(),
            position: Vector2.zero(),
            rotation: -1.570,
            w: 0,
            h: 0,
            _parent: null
        };
    },

    initialize: function(options) {
        this.components = new GameObjectCollection(null, { gameObject: this });
        this.children = new GameObjectCollection(null, { gameObject: this });
        this.on('change:_parent', this._parentChanged);

        this.postInitialize();
    },

    position: function() {
        //return this.get('position');
        return this.attributes.position;
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

    forward: function() {
        var rot = this.rotation();

        return new Vector2(Math.cos(rot), Math.sin(rot));
    },

    step: function(dt) {
        this.components.invoke('step', dt);

        this.thisStep(dt);

        this.children.invoke('step', dt);
    },

    thisStep: function(dt) {},

    draw: function(ctx) {
        ctx.save();
        this.thisDraw(ctx);
        ctx.restore();
        this.children.invoke('draw', ctx);
    },

    thisDraw: function(ctx) {
        var pos = this.position();
        ctx.fillStyle = this.get('fillStyle') || '#fff';
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.rotation());
        ctx.fillRect(-(this.width() / 2), -(this.height() / 2), this.width(), this.height());
    },

    _parentChanged: function() {
        this.components.invoke('_parentChanged');
    },

    postInitialize: function() {}
});

var GameObjectCollection = Backbone.Collection.extend({
    model: GameObject,

    initialize: function(models, options) {
        this.gameObject = null;

        _.bindAll(this, 'addedObject');

        if (options) {
            this.gameObject = options.gameObject || null;
        }

        this.on('add', this.addedObject);
    },

    addedObject: function(gameObject) {
        gameObject.set('_parent', this.gameObject);
    } 
});

var Scene = GameObject.extend({
    type: 'Scene',

    defaults: function() {
        var defaults = {
                name: '',
                inputManager: new InputManager()
            };

        return _.extend(Scene.__super__.defaults(), defaults);
    },
    thisDraw: function() {},

    setup: function() {
        this.inputManager().set('scene', this);
        this.afterSetup();
    },

    afterSetup: function() {},

    load: function(callback) {
        this.afterSetup = callback;
    },

    inputManager: function() {
        return this.attributes.inputManager;
    }
});
//var Stage;

var InputManager = Backbone.Model.extend({
    defaults: {
        key: ''
    },

    initialize: function(options) {
        _.bindAll(this, 'keyDown', 'keyUp');

        this.on('change:scene', this.sceneChanged);
    },

    sceneChanged: function() {
        this.inputListener = this.get('scene').parent().get('engine').inputListener;
        this.inputListener.on('keydown', this.keyDown);
        this.inputListener.on('keyup', this.keyUp);
    },

    keyDown: function(e) {
        if (this.currentKey() === e.char) {
            return;
        }
        this.set('key', e.char);
    },

    keyUp: function(e) {
        this.set('key', '');
    },

    currentKey: function() {
        return this.attributes.key;
    }

});

var ComponentCollection = GameObjectCollection.extend({
    model: BaseComponent,

    addedObject: function(gameObject) {
        gameObject.set('_parent', this.gameObject);
    } 
});

var BaseComponent = GameObject.extend({
    type: 'BaseComponent',

    defaults: function() {
        defaults = {
            gameObject: null
        };
        return _.extend(BaseComponent.__super__.defaults(), defaults);
    },

    setup: function() {},
    step: function(dt) {},
    draw: function(ctx) {},

    _parentChanged: function() {
        var gameObject = null;

        this.gameObject = this.attributes._parent;
        this.position = this.gameObject.position();
        this.rotation = this.gameObject.rotation();

        gameObject = this.gameObject;
        while(gameObject.attributes._parent !== null) {
            if (gameObject.type === 'Scene') {
                this.scene = gameObject;
                break;
            }

            gameObject = gameObject.attributes._parent;
        }
    }
});


var MoveXComponent = BaseComponent.extend({
    type: 'MoveXComponent',

    step: function(dt) {
        var multiplier = 1;
        
        if (this.scene.inputManager().currentKey() === 'S') {
            return;
        }
        if (this.scene.inputManager().currentKey() === 'D') {
            multiplier = 2;
        }
        if (this.scene.inputManager().currentKey() === 'A') {
            multiplier = -2;
        }


        this.position.x += dt * this.gameObject.get('speed') * multiplier;
        // this.position.add(Vector2.right().multiply(dt * this.gameObject.get('speed') * multiplier));

        if (this.position.x > this.scene.width()) {
            this.position.x = 0 - this.gameObject.width();
        }
    }
});
var MoveYComponent = BaseComponent.extend({
    type: 'MoveYComponent',

    step: function(dt) {
        if (this.scene.inputManager().currentKey() === 'W') {
            return;
        }
        this.position.y += dt * this.gameObject.get('speed');

        if (this.position.y > this.scene.height()) {
            this.position.y = 0 - this.gameObject.height();
        }
    }
});
var RotationComponent = BaseComponent.extend({
    type: 'RotationComponent',

    step: function(dt) {
        if (this.scene.inputManager().currentKey() === 'D') {
            this.gameObject.attributes.rotation += (100 * dt * Math.PI)/180;
        }
        if (this.scene.inputManager().currentKey() === 'A') {
            this.gameObject.attributes.rotation -= (100 * dt * Math.PI)/180;
        }
    }
});

var MoveComponent = BaseComponent.extend({
    type: 'MoveComponent',

    step: function(dt) {
        var pos = this.gameObject.position();
        if (this.scene.inputManager().currentKey() === 'W') {
            this.gameObject.set('position', pos.add(this.gameObject.forward().multiply(100 * dt)));
        }
        if (this.scene.inputManager().currentKey() === 'S') {
            this.gameObject.set('position', pos.subtract(this.gameObject.forward().multiply(100 * dt)));
        }
    }
});

var Entity = GameObject.extend({
    type: 'Entity',

    postInitialize: function() {
        this.components.add([
            new RotationComponent(),
            new MoveXComponent(),
            new MoveYComponent()
        ]);
    }
});
