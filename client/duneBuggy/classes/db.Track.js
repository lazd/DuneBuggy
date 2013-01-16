(function() {
	var trackTexture = {
		width: 70/5,
		height: 10/5,
		segmentsW: 1,
		segmentsH: 1,
		textureUrl: 'duneBuggy/textures/tracks.png'
	};

	// Define the track texture
	var texture = THREE.ImageUtils.loadTexture(trackTexture.textureUrl);

	// Create the geometry	
	var geometry = new THREE.PlaneGeometry(trackTexture.width, trackTexture.height, trackTexture.segmentsW, trackTexture.segmentsH);

	db.Track = new Class({
		extend: db.GameObject,
		construct: function(options){
			options = jQuery.extend({
				position: new THREE.Vector3(0, 0, 0),
				rotation: new THREE.Vector3(0, 0, 0),
				time: 0
			}, options);
	
			this.time = options.time;
	
			var Y_POSITION = 1;
		
			this.material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				overdraw: true
			});

			// Create the mesh
			this.root = new THREE.Mesh(geometry, this.material);

			this.root.rotation.copy(options.rotation);
			this.root.position.copy(options.position);
			this.root.position.y = Y_POSITION;
		},
		setOpacity: function(opacity) {
			this.material.opacity = opacity;
			return this;
		}
	});
}());