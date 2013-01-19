(function() {
	var faceMaterial = new THREE.MeshFaceMaterial({
		vetexColor: THREE.FaceColors
	});

	db.Missile = new Class({
		extend: db.GameObject,
	
		construct: function(options){
			// handle parameters
			options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: new THREE.Vector3(1, 1, 1)
			}, options);
	
			// Set missile color based on alliance
			var missileColor = options.type == 'friend' ? db.config.colors.friend : db.config.colors.enemy;
	
			// Load model
			var geometry = this.game.models.missilePhoenix.geometry;
			
			this.missileGeometry = geometry;
	
			// geometry.materials[0] = new THREE.MeshLambertMaterial({ color: missileColor, shading: THREE.FlatShading, vertexColors: THREE.VertexColors });
			var material = new THREE.MeshPhongMaterial({ color: missileColor, ambient: 0x050505, shading: THREE.FlatShading, vertexColors: THREE.VertexColors });
	
			// Body
			this.root = new Physijs.CylinderMesh(geometry, material, db.config.weapons.missile.mass);
			this.root.scale.set(db.config.size.missile, db.config.size.missile, db.config.size.missile);
			
			this.root.castShadow = true;
			this.root.receiveShadow = true;
			
			// Set initial position
			this.root.position.copy(options.position);
			this.root.rotation.copy(options.rotation);

			// Temporary
			this.root.position.y += 25;
			
			// Store start time
			this.time = new Date().getTime();
		},
		init: function() {
			this.inherited(arguments);
			
			// Temporary
			this.root.setLinearVelocity({x: 0, y: 100, z: 0}); // must set after added to scene
		},
	
		setPosition: function(position, rotation) {
			// position
			this.root.position.x = position[0];
			this.root.position.y = position[1];
			this.root.position.z = position[2];

			// rotation
			this.root.rotation.y = rotation;
		},
		/*
		update: function(delta) {
			this.velocity = THREE.Math.clamp(this.speed + delta * this.ACCELERATION, 0, this.MAX_SPEED);
		
			// bullet update
			var forwardDelta = this.speed * delta;

			// displacement
			this.root.position.x += Math.sin(this.root.rotation.y) * forwardDelta;
			this.root.position.z += Math.cos(this.root.rotation.y) * forwardDelta;
		
			// Spin missile according to speed
			this.root.rotation.z += this.speed/Math.PI/512;
		}
		*/
	});

}());
