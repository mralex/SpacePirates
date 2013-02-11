define([
    '../base_component'
], function(BaseComponent) {
    var SceneCollisionManager = BaseComponent.extend({
        type: 'SceneCollisionManager',

        onStart: function() {
            this.set('colliders', []);

            _.bindAll(this, 'childAdded', 'childRemoved', 'lateStep');
            this.gameObject.children.on('add', this.childAdded);
            this.gameObject.children.on('remove', this.childRemoved);
            this.gameObject.on('lateStep', this.lateStep);
        },

        childAdded: function(gameObject) {
            if (gameObject.components.ofType('ColliderComponent')) {
                this.attributes.colliders.push(gameObject);
            }
        },

        childRemoved: function(gameObject) {
            var index = this.attributes.colliders.indexOf(gameObject);
            if (index > -1) {
                this.attributes.colliders.splice(index, 1);
            }
        },

        lateStep: function(dt) {
            var colliders = this.attributes.colliders,
                colliderCount = colliders.length,
                colliderA,
                colliderB,
                componentA,
                componentB,
                boxA,
                boxB,
                i,
                j;

            for (i = 0; i < colliderCount; i++) {
                colliderA = colliders[i];
                for (j = 0; j < colliderCount; j++) {
                    colliderB = colliders[j];
                    if (colliderA === colliderB) {
                        continue;
                    }

                    componentA = colliderA.components.ofType('ColliderComponent');
                    componentB = colliderB.components.ofType('ColliderComponent');
                    boxA = componentA.getBounds();
                    boxB = componentB.getBounds();

                    if (boxA.intersects(boxB)) {

                        if (componentA.colliders.indexOf(colliderB) < 0) {
                            colliderA.trigger('collision', colliderB);
                            componentA.colliders.push(colliderB);
                        }
                        if (componentB.colliders.indexOf(colliderA) < 0) {
                            colliderB.trigger('collision', colliderA);
                            componentB.colliders.push(colliderA);
                        }
                    }
                }
            }
        }
    });

    return SceneCollisionManager;
});
