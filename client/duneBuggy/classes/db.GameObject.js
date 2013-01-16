db.GameObject = new Class({
	toString: 'GameObject',
	extend: EventEmitter,
	construct: function(options) {
		// Bind execution scope of update, if necessary
		if (this.update)
			this.bind(this.update);
		
		// Store scene for remove
		this.game = options.game;
	},
	
	init: function() {
		this.add();
	},
	
	destruct: function() {
		// Unhook from the rendering loop
		if (this.update)
			this.game.unhook(this.update);
		
		// Remove from the scene
		if (this.root)
			this.game.scene.remove(this.root);
	},
	
	add: function() {
		// Add mesh to world
		if (this.root)
			this.game.scene.add(this.root);
		
		// Hook to the rendering loop
		if (this.update && !this.hooked) {
			this.game.hook(this.update);
			this.hooked = true;
		}
			
		return this;
	},

	getModel: function() {
		return this.root;
	},
	
	// TODO: use only getModel or getRoot
	getRoot: function() {
		return this.root;
	},
	
	show: function() {
		this.root.visible = true;
	},
	
	hide: function() {
		this.root.visible = false;
	}
});
