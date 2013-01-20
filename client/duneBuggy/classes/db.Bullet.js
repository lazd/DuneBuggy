(function() {
	var bulletTexture = {
		width: 0.5,
		height: 0.5,
		depth: 1
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
			var material = this.alliance === 'friend' ? friendBulletMaterial : enemyBulletMaterial;
			
			this.root = new Physijs.BoxMesh(bulletGeometry, material, db.config.weapons.bullet.mass);
			this.root.instance = this;
			
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
			this.root.setLinearVelocity({ x: 0, y: 100, z: 0}); // Must set after added to scene
		}
	});
}());

