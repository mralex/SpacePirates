// Renderer Module

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Renderer = Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'start', 'loop', 'step', 'draw');
            this.ctx = this.model.ctx();

            this.game = options.game;
        },

        start: function() {
            this.frames = 0;
            // this.lastFPSTime = +new Date();
            this.lastFPSTime = 0;
            this.previousDeltaTime = +new Date();
            this.loop(this.previousDeltaTime);
        },

        loop: function(timestamp) {
            var dt = (timestamp - this.previousDeltaTime) / 1000 ;
            this.previousDeltaTime = timestamp;

            this.step(dt);
            this.draw();

            // this.frames++;
            // if (timestamp - this.lastFPSTime >= 1000) {
            //     this.lastFPSTime = timestamp;
            //     $('#fps').text(this.frames + ' fps');
            //     this.frames = 0;
            // }

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

    return Renderer;
});