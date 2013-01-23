// Scene Module

define([
    'jquery',
    'underscore',
    'backbone',
    './game_object',
    './input_manager'
], function($, _, Backbone, GameObject, InputManager) {
    var Scene = GameObject.extend({
        type: 'Scene',

        defaults: function() {
            var defaults = {
                    name: '',
                    inputManager: new InputManager()
                };

            return _.extend(Scene.__super__.defaults(), defaults);
        },
        draw: function(ctx) {
            this.children.invoke('draw', ctx);

            this._destroyChildren();
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

    return Scene;
});