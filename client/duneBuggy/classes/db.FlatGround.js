(function() {
	var faceMaterial = new THREE.MeshFaceMaterial({
		vetexColor: THREE.FaceColors
	});

	db.FlatGround = new Class({
		extend: db.GameObject,
	
		construct: function(options){
			// handle parameters
			options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: 0
			}, options);
	
	
			// Materials
			var ground_material = Physijs.createMaterial(
				new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture('duneBuggy/textures/sand.jpg')
				}),
				0.1, // low friction
				.4 // low restitution
			);
			ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
			ground_material.map.repeat.set( 3, 3 );

			// Ground
			this.root = new Physijs.BoxMesh(
				new THREE.CubeGeometry(10000, 1, 10000),
				ground_material,
				0 // mass
			);
			this.root.receiveShadow = true;
			
			this.root.position.y = 120;
			
			options.game.scene.add(this.root);
		}
	});

}());
