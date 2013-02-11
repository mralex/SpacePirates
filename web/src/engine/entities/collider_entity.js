define([
    './entity',
    '../components/axis_aligned_collider'
], function(Entity, AxisAlignedColliderComponent) {
    var ColliderEntity = Entity.extend({
        type: 'ColliderEntity',

        initialize: function(options) {
            ColliderEntity.__super__.initialize.apply(this, arguments);
            this.components.add(new AxisAlignedColliderComponent());
        }
    });

    return ColliderEntity;
});