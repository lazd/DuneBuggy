Math.toDegrees = function(radians) {
	return radians * 180/Math.PI;
};

db.CameraControls = new Class({
	toString: 'CameraControls',
	construct: function(options) {
		// handle parameters
		this.options = jQuery.extend({
			type: 'overhead',
			chase: {
  				height: 80,
				trailX: 300,
				trailZ: 300,
				follow: 'tank'
			},
			overhead: {
				height: 400,
				rotate: false
			}
		}, options);
		
		this.bind(this.update);
	},
	update: function() {
		var tank = this.options.tank;
		var tankMesh = tank.getRoot();
		var turretMesh = tank.getTurret();
		
		var tankPosition = tankMesh.position;
		
		// Follow tank with camera
		if (this.options.type == 'overhead') {
			this.options.camera.position.x = tankPosition.x;
			this.options.camera.position.y = this.options.overhead.height;
			this.options.camera.position.z = tankPosition.z;
			
			// Rotate camera with tank
			if (this.options.overhead.rotate) {
				// TODO: Get tank rotation here!
			}
		}
		else if (this.options.type == 'chase') {
			this.options.camera.position.y = tankPosition.y+this.options.chase.height;
			
			var camera = this.options.camera;
			if (this.options.chase.follow == 'tank') {
				// Update the matrix before we calculate
				tankMesh.updateMatrixWorld();
				
				var newCameraPosition = tankMesh.matrixWorld.multiplyVector3(new THREE.Vector3(0,this.options.chase.height,-this.options.chase.trailZ));
				
				// Fixed Y position
				newCameraPosition.y = this.options.camera.position.y;
				
				// Set camera position
				camera.position.copy(newCameraPosition);
				
				// console.log('Rotation: ',
				// 	Math.toDegrees(tankMesh.rotation.x).toFixed(1),
				// 	Math.toDegrees(tankMesh.rotation.y).toFixed(1),
				// 	Math.toDegrees(tankMesh.rotation.z).toFixed(1)
				// );
				// this.options.camera.position.x = tankPosition.x+Math.sin(rotation.y+Math.PI)*this.options.chase.trailX;
				// this.options.camera.position.z = tankPosition.z+Math.cos(rotation.y+Math.PI)*this.options.chase.trailZ;
			}
			else if (this.options.chase.follow == 'turret') {
				// Update the matrix before we calculate
				tankMesh.updateMatrixWorld();
				turretMesh.updateMatrixWorld();

				var newCameraPosition = turretMesh.matrixWorld.multiplyVector3(new THREE.Vector3(0,this.options.chase.height,-this.options.chase.trailZ));
				
				// Fixed Y position, may not be ideal for aiming
				newCameraPosition.y = this.options.camera.position.y;
				
				// Set camera position
				camera.position.copy(newCameraPosition);
			}
		}
	
		this.options.camera.lookAt(tankPosition);
	}
});
