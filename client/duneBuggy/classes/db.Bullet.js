(function() {
	// internal helper variables
	var bulletTexture = {
		width: 4/5,
		height: 4/5,
		depth: 8/5
	};
	
	var friendBulletMaterial = new THREE.MeshBasicMaterial({
		color: db.config.colors.friend,
		transparent: true
	});
	
	var enemyBulletMaterial = new THREE.MeshBasicMaterial({
		color: db.config.colors.enemy,
		transparent: true
	});

	// create the geometry	
	var bulletGeometry = new THREE.CubeGeometry(bulletTexture.width, bulletTexture.height, bulletTexture.depth);

	db.Bullet = new Class({
		extend: db.GameObject,
	
		construct: function(options){
			// handle parameters
			options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: new THREE.Vector3(0, 0, 0)
			}, options);
			
			var Y_OFFSET = 8.1;
		
			var material = options.type == 'friend' ? friendBulletMaterial : enemyBulletMaterial;
		
			// create the mesh
			this.root = new Physijs.BoxMesh(bulletGeometry, material);
		
			// Set initial position
			this.root.position.copy(options.position);
			this.root.rotation.copy(options.rotation);

			// I have no clue how to find the direction and give it velocity
			var velocity = options.rotation.clone().multiplyScalar(1000);
			this.root.setLinearVelocity(velocity);
				
			// Store start time
			this.time = new Date().getTime();
		}
	});
}());

