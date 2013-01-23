// BaseComponent Module

define([
    'jquery',
    'underscore',
    'backbone',
    './game_object'
], function($, _, Backbone, GameObject) {
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

    return BaseComponent;
});