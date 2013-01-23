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
	        _.bindAll(this, 'keyDown', 'keyUp');

	        this.keysPressed = {};

	        this.on('change:scene', this.sceneChanged);
	    },

	    sceneChanged: function() {
	        this.inputListener = this.get('scene').parent().get('engine').inputListener;
	        this.inputListener.on('keydown', this.keyDown);
	        this.inputListener.on('keyup', this.keyUp);
	    },

	    keyDown: function(e) {
	        if (this.isKeyDown(e.char)) {
	            return;
	        }
	        this.set('key', e.char);
	        this.keysPressed[e.char] = true;
	    },

	    keyUp: function(e) {
	        this.set('key', '');
	        this.keysPressed[e.char] = false;
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
