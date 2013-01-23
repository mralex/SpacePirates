// Engine Module

define([
    'jquery',
    'underscore',
    'backbone',
    './context',
    './renderer',
    './game_object_collection',
    './input_listener'
], function($, _, Backbone, Context, Renderer, GameObjectCollection, InputListener) {
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

    return Engine;
});