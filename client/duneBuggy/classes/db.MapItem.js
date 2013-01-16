db.MapItem = new Class({
	toString: 'MapItem',
	extend: db.GameObject,
	
	defaults: {
		position: new THREE.Vector3(0, 0, 0),
		rotation: 0,
		hp: 100,
		mass: 500,
		model: {
			url: "",
			rotation: 0,
			yPosition: 0,
			wrapTextures: true,
			size: 1,
			meshClass: Physijs.BoxMesh,
			faceMaterial: new THREE.MeshFaceMaterial({
				vetexColor: THREE.FaceColors
			}),
			friction: 10,
			restitution: 0.5
		}
	},

	construct: function(options) {
		// Combine default parameters with class parameters and instance parameters 
		var options = this.options = jQuery.extend(true, {}, this.defaults, this.options, options);

		this.destroyed = false;

		// Load model
		var loader = new THREE.JSONLoader();
		loader.load(options.model.url, function(geometry, materials) {

			if (options.model.textures) {
				options.model.textures.forEach(function(texture, index) {
					materials[index].map = THREE.ImageUtils.loadTexture(texture);
					materials[index].map.flipY = false;
				});
			}
			
			// TODO: apply materials
			materials.forEach(function(material, index) {
				// Apply ambient light to all materials
		        material.ambient = new THREE.Color(0xffffff);
		        
		        // Apply color
				if (options.model.color !== undefined) {
					material.color = options.model.color;
				}

		        // Wrap textures
				if (options.model.wrapTextures && material.map) {
					material.map.wrapS = THREE.RepeatWrapping;
					material.map.wrapT = THREE.RepeatWrapping;
				}
				
				materials[index] = Physijs.createMaterial(
					material,
					options.model.friction, // high friction
					options.model.restitution // medium restitution
				);
			});
			
			
			// Body
			this.bodyMesh = new this.options.model.meshClass(geometry, new THREE.MeshFaceMaterial(materials), this.options.mass);
			this.bodyMesh.scale.set(options.model.size, options.model.size, options.model.size);
			
			this.bodyMesh.flipSided = true;
			this.bodyMesh.doubleSided = true;

			// Hitbox
			if (options.hitBox) {
				this.hitBox = new THREE.Mesh(options.hitBox);
				this.hitBox.visible = false;
				this.hitBox.position.y = options.hitBoxYPosition || 0;
				
				this.options.game.scene.add(this.hitBox);
			}

			if (options.model.rotation)
				this.bodyMesh.rotation.y = options.model.rotation;
			
			this.root = this.bodyMesh;
			
			// Set position/rotation
			this.root.position.copy(options.position);
			this.root.rotation.copy(options.rotation);

			this.add();
			this.root.setDamping(0.8, 1.0);
		}.bind(this));
	
		this.hp = options.hp;
	},

	destruct: function() {
		this.game.scene.remove(this.getRoot());

		new db.Explosion({
			position: this.getRoot().position,
			game: this.game
		});

		this.destroyed = true;

		return this;
	},

	getModel: function() {
		return this.bodyMesh;
	},

	getHitBox: function() {
		return this.hitBox || this.bodyMesh;
	},
	
	getRoot: function() {
		return this.root;
	},

	setPosition: function (position, rotation) {
		// position
		this.root.position.x = position[0];
		this.root.position.z = position[1];

		// rotation
		this.root.rotation.y = rotation;
	},

	addTo: function(game) {
		this.game = game;
	
		// Add body to scene
		game.scene.add(this.getRoot());
	
		return this;
	},

	takeHit: function(damage) {
		this.hp -= damage || 10;
		if (this.hp <= 0 && !this.isDestroyed()) {
			this.destruct();
		}
	},

	isDestroyed: function() {
		return this.destroyed;
	}
});
