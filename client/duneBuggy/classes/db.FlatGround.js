db.Ground = new Class({
	toString: 'Ground',
	extend: db.GameObject,
	construct: function(options) {
		this.options = options;

		var ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('duneBuggy/textures/sand.jpg') }),
			.8, // high friction
			.4 // low restitution
		);
		ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
		ground_material.map.repeat.set( 3, 3 );

		var ground_geometry = new THREE.PlaneGeometry( 300, 300, 100, 100 );
		ground_geometry.computeFaceNormals();
		ground_geometry.computeVertexNormals();

		// If your plane is not square as far as face count then the HeightfieldMesh
		// takes two more arguments at the end: # of x faces and # of z faces that were passed to THREE.PlaneMaterial
		var ground = new Physijs.HeightfieldMesh(
				ground_geometry,
				ground_material,
				0 // mass
		);
		ground.rotation.x = -Math.PI / 2;
		// ground.receiveShadow = true;

		this.root = ground;
	},
	init: function() {
		this.options.game.scene.add(this.root);
	}
});