// GameObject Module

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var GameObjectCollection = Backbone.Collection.extend({
        // model: GameObject,

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
            gameObject.onStart();
        },

        ofType: function(type) {
            var objects = this.where({type: type});

            if (objects.length) {
                return objects[0];
            }
            return null;
        },

        withName: function(name) {
            return this.where({ name: name });
        }
    });

    return GameObjectCollection;
});