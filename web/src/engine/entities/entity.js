define([
    '../game_object'
], function(GameObject) {
    var Entity = GameObject.extend({
        type: 'Entity'
        // Add bounds, width, and height stuff here
    });

    return Entity;
});