(function() {
	var friendBulletMaterial = new THREE.MeshBasicMaterial({
		color: db.config.colors.friend,
		transparent: true
	});
	
	var enemyBulletMaterial = new THREE.MeshBasicMaterial({
		color: db.config.colors.enemy,
		transparent: true
	});

	// create the geometry	
	var bulletGeometry = new THREE.CubeGeometry(db.config.weapons.bullet.dimensions.width, db.config.weapons.bullet.dimensions.height, db.config.weapons.bullet.dimensions.depth);

	db.Bullet = new Class({
		toString: 'Bullet',
		
		extend: db.GameObject,
	
		construct: function(options){
			options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: new THREE.Vector3(0, 0, 0),
				alliance: 'enemy'
			}, options);
			
			this.alliance = options.alliance;
			
			// Set bullet color according to alliance
			var material = this.alliance === 'friend' || this.alliance === 'self' ? friendBulletMaterial : enemyBulletMaterial;
			
			this.root = new Physijs.BoxMesh(bulletGeometry, material, db.config.weapons.bullet.mass);
			this.root.instance = this;

			// Set initial position
			this.root.position.copy(options.position);
			this.root.rotation.copy(options.rotation);
			
			this.root.setDamping(0, 0);
			
			// Remove on collision
			this.root.addEventListener('collision', this.handleCollision.bind(this));
			
			// Store start time
			this.time = new Date().getTime();
		},
		
		handleCollision: function(mesh) {
			if (!(this.alliance === 'self' && mesh.instance && mesh.instance.alliance === 'self')) {
				this.destruct();
			}
		},
		
		update: function() {
			// Remove bullets if they've been around for too long
			var curTime = new Date().getTime();
			if (curTime - this.time > this.game.options.weapons.bullet.time)
				this.destruct();
		},
		
		init: function() {
			this.inherited(arguments);
			
			// Enable CCD if the bullet moves more than 1 meter in one simulation frame
			this.root.setCcdMotionThreshold(4);
			this.root.setCcdSweptSphereRadius(0.8);
			
			// Make sure the bullet's matrix is up to date
			this.root.updateMatrix();
			
			// Extract the rotation from the bullet's matrix
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.extractRotation(this.root.matrix);
			
			// Get a force vetor based on the bullet's rotation
			this.forceVector = rotationMatrix.multiplyVector3(new THREE.Vector3(0, 0, this.game.options.weapons.bullet.impulse));

			// Apply a force to the bullet so it goes forward
			this.root.applyCentralImpulse(this.forceVector);
			
			this.root.applyCentralImpulse(new THREE.Vector3(0, 0.25, 0));
			
			// this.velocityVector = this.root.getLinearVelocity();
		}
	});
}());

