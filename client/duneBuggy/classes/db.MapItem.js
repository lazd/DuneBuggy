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
	
	init: function() {
		

		// Use model
		var geometry = this.options.game.models[this.options.model.name].geometry;
		var materials = this.options.game.models[this.options.model.name].materials;
		
		if (this.options.model.textures) {
			this.options.model.textures.forEach(function(texture, index) {
				materials[index].map = THREE.ImageUtils.loadTexture(texture);
				materials[index].map.flipY = false;
			});
		}
		
		// TODO: apply materials
		materials.forEach(function(material, index) {
			// Apply ambient light to all materials
	        material.ambient = new THREE.Color(0xffffff);
	        
	        // Apply color
			if (this.options.model.color !== undefined) {
				material.color = this.options.model.color;
			}

	        // Wrap textures
			if (this.options.model.wrapTextures && material.map) {
				material.map.wrapS = THREE.RepeatWrapping;
				material.map.wrapT = THREE.RepeatWrapping;
			}
			
			materials[index] = Physijs.createMaterial(
				material,
				this.options.model.friction, // high friction
				this.options.model.restitution // medium restitution
			);
		}.bind(this));
		
		// Body
		this.root = new this.options.model.meshClass(geometry, new THREE.MeshFaceMaterial(materials), this.options.mass);
		this.root.scale.set(this.options.model.size, this.options.model.size, this.options.model.size);
		
		this.root.flipSided = true;
		this.root.doubleSided = true;
		
		// Shadow
		if (this.options.model.castShadow)
			this.root.castShadow = true;
		
		if (this.options.model.rotation)
			this.root.rotation.y = this.options.model.rotation;
		
		// Set position/rotation
		this.root.position.copy(this.options.position);
		this.root.rotation.copy(this.options.rotation);

		// Wtf?
		this.root.setDamping(0.8, 1.0);
	
		
		this.add();
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
