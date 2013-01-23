// Context Module

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
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

    return Context;
});