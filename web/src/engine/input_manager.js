// InputManager Module

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var InputManager = Backbone.Model.extend({
        defaults: {
            key: ''
        },

        initialize: function(options) {
            _.bindAll(this, 'keyDown', 'keyUp', 'mouseDown', 'mouseUp');

            this.keysPressed = {};

            this.on('change:scene', this.sceneChanged);
        },

        sceneChanged: function() {
            this.inputListener = this.get('scene').parent().get('engine').inputListener;

            this.get('scene').on('step', this.step);

            this.inputListener.on('keydown', this.keyDown);
            this.inputListener.on('keyup', this.keyUp);

            this.inputListener.on('mousedown', this.mouseDown);
            this.inputListener.on('mouseup', this.mouseUp);
        },

        step: function(dt) {

        },

        keyDown: function(e) {
            if (this.isKeyDown(e.char)) {
                return;
            }
            this.set('key', e.char);
            this.keysPressed[e.char] = true;

            this.trigger('keyDown', e.char);
        },

        keyUp: function(e) {
            this.set('key', '');
            this.keysPressed[e.char] = false;

            this.trigger('keyUp', e.char);
        },

        mouseDown: function(e) {
            this.trigger('mousedown', e);
        },

        mouseUp: function(e) {
            this.trigger('mouseup', e);
        },

        currentKey: function() {
            return this.attributes.key;
        },

        isKeyDown: function(key) {
            if ((key in this.keysPressed) && this.keysPressed[key]) {
                return true;
            }
            return false;
        }

    });

    return InputManager;
});
