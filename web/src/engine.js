define([
	'./engine/math/uuid',
	'./engine/math/vector2',
	'./engine/engine',
	'./engine/context',
	'./engine/renderer',
	'./engine/input_listener',
	'./engine/input_manager',
	'./engine/game_object',
	'./engine/game_object_collection',
	'./engine/base_component',
	'./engine/component_collection',
	'./engine/scene',
	'./engine/math/bounding_box',
	'./engine/gui'
], function(UUID, Vector2, Engine, Context, Renderer, InputListener, InputManager, GameObject, GameObjectCollection, BaseComponent, ComponentCollection, Scene, AABoundingBox, Gui) {
	return {
		UUID: UUID,
		Vector2: Vector2,
		Engine: Engine,
		Context: Context,
		Renderer: Renderer,
		InputListener: InputListener,
		InputManager: InputManager,
		GameObject: GameObject,
		GameObjectCollection: GameObjectCollection,
		BaseComponent: BaseComponent,
		ComponentCollection: ComponentCollection,
		Scene: Scene,
		AABoundingBox: AABoundingBox,
		Gui: Gui
	};
});