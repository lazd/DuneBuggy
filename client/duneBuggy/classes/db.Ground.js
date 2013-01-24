(function() {
	var faceMaterial = new THREE.MeshFaceMaterial({
		vetexColor: THREE.FaceColors
	});

	db.Ground = new Class({
		extend: db.GameObject,
	
		construct: function(options){
			// handle parameters
			this.options = options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: new THREE.Vector3(0, 0, 0)
			}, options);
	
			var geometry = this.game.models.terrain.geometry;
			var materials = this.game.models.terrain.materials;
	
			// TODO: apply materials
			materials.forEach(function(material, index) {
				material.map.wrapS = THREE.RepeatWrapping;
				material.map.wrapT = THREE.RepeatWrapping;
				material.map.repeat.set(0.125, 0.125);
				
				materials[index] = Physijs.createMaterial(
					material,
					1, // high friction
					.4 // low restitution
				);
			});
			
			this.root = new Physijs.ConcaveMesh(geometry, new THREE.MeshFaceMaterial(materials), 0);
			this.root.receiveShadow = true;
			this.root.position.copy(options.position);
			this.root.rotation.copy(options.rotation);
			this.options.game.scene.add(this.root);
		}
	});

}());
