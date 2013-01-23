// GameObject Module

define([
    'jquery',
    'underscore',
    'backbone',
    './game_object_collection',
    './base_component'
], function($, _, Backbone, GameObjectCollection, BaseComponent) {
    var ComponentCollection = GameObjectCollection.extend({
        model: BaseComponent,

        addedObject: function(gameObject) {
            gameObject.set('_parent', this.gameObject);
        }
    })

    return ComponentCollection;
});