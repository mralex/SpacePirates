define([
    '../game_object'
], function(GameObject) {
    var Label = GameObject.extend({
        type: 'Label',

        defaults: function() {
            defaults = {
                font: '10px sans-serif',
                textAlign: 'left',
                textBaseline: 'alphabetic',
                text: ''
            };
            return _.extend(Label.__super__.defaults.call(this), defaults);
        },

        thisDraw: function(ctx) {
            var pos = this.position();

            ctx.fillStyle = this.get('fillStyle');
            ctx.fillText(this.get('text'), pos.x, pos.y);
        }
    });

    return Label;
});