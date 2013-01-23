// InputListener Module

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
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

	return InputListener;
});
