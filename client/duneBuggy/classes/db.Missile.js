(function() {
	db.Missile = new Class({
		toString: 'Missile',
		extend: db.GameObject,
	
		construct: function(options){
			// handle parameters
			options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: new THREE.Vector3(1, 1, 1)
			}, options);
	
			this.alliance = options.alliance;
			
			// Set missile color based on alliance
			var missileColor = this.alliance === 'friend' || this.alliance === 'self' ? db.config.colors.friend : db.config.colors.enemy;
			
			var geometry = this.game.models.missilePhoenix.geometry;
			
			// var material = new THREE.MeshLambertMaterial({ color: missileColor, shading: THREE.FlatShading, vertexColors: THREE.VertexColors });
			var material = new THREE.MeshPhongMaterial({ color: missileColor, ambient: 0x050505, shading: THREE.FlatShading, vertexColors: THREE.VertexColors });
	
			// Body
			this.root = new Physijs.CylinderMesh(geometry, material, db.config.weapons.missile.mass);
			this.root.scale.set(this.game.options.size.missile, this.game.options.size.missile, this.game.options.size.missile);
			this.root.instance = this;

			// Missiles cast shadows
			this.root.castShadow = true;
			//this.root.receiveShadow = true;
			
			// Set initial position
			this.root.position.copy(options.position);
			this.root.rotation.copy(options.rotation);
			
			// Oddly enough, the only way to get CylinderMesh to behave is to point the missile in the Y or X direction.
			// As a result, we need to tilt the missile down and give it Y velocity instead of Z
			// Results in inconsistent application of that damn matrix! Like without updateMatrix
			// this.root.rotation.x -= Math.PI/2;
			
			// Temporary
			this.root.position.y += 25;
			
			// Store start time
			this.time = new Date().getTime();
		},
		init: function() {
			this.inherited(arguments);
			
			// Temporary
			this.root.updateMatrix();
			
			var rotation_matrix = new THREE.Matrix4();
			rotation_matrix.extractRotation(this.root.matrix);
			var force_vector = new THREE.Vector3(0, 250, 0);
			force_vector.applyMatrix4(rotation_matrix);
			this.root.applyCentralImpulse(final_force_vector);
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
