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
				rotation: 0
			}, options);
	
			this.groundMeshes = [];
	
			
			// Load model
			var loader = new THREE.JSONLoader();
			loader.load("duneBuggy/models/terrain.js", function(geometry, materials) {
				this.groundGeometry = geometry;
		
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
				
				this.groundGeometry = geometry;
				this.groundMaterials = materials;
				
				var xSpacingMax = 2326.48;
				var xSpacingMin = -2326.48;
				var zSpacingMax = 2339.54;
				var zSpacingMin = -2419.3;
				var yHeight = 20;
				
				//this.groundMesh = new THREE.Mesh(geometry, faceMaterial);
				this.makeGround(new THREE.Vector3(xSpacingMax/2,yHeight,zSpacingMax/2), new THREE.Vector3(0,Math.PI/4,0));
				//this.makeGround(new THREE.Vector3(xSpacingMax,yHeight,xSpacingMax), new THREE.Vector3(0,0,0));
				//this.makeGround(new THREE.Vector3(xSpacingMax,yHeight,zSpacingMin-xSpacingMax+zSpacingMin), new THREE.Vector3(0,-Math.PI,0));
				//this.makeGround(new THREE.Vector3(xSpacingMin,yHeight,zSpacingMax), new THREE.Vector3(0,0,0));
				//this.makeGround(new THREE.Vector3(xSpacingMin,yHeight,zSpacingMin), new THREE.Vector3(0,0,0));
			}.bind(this));
			
		},
		makeGround: function(position, rotation) {
			var mesh = new Physijs.ConcaveMesh(this.groundGeometry, new THREE.MeshFaceMaterial(this.groundMaterials), 0);
			mesh.receiveShadow = true;
			mesh.position.copy(position);
			mesh.rotation.copy(rotation);
			
			this.groundMeshes.push(mesh)
			this.options.game.scene.add(mesh);
		}
	});

}());
