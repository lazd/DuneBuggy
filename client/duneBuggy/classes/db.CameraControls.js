Math.toDegrees = function(radians) {
	return Math.round(radians * 180/Math.PI);
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
				distance: 2000,
				rotate: false
			}
		}, options);
		
		this.bind(this.update);
	},
	update: function() {
		var tank = this.options.tank;
		var tankMesh = tank.getRoot();
		
		var tankPosition = tankMesh.position;
		var tankRotation = tankMesh.rotation.y;
		var tankRotation = (tankMesh.worldY || 0)+Math.PI;
		//var tankRotation = (tankMesh.rotation.y || 0)+Math.PI;
		var turretRotation = tank.getTurret().rotation.y + tankRotation;
		
		
		// Follow tank with camera
		if (this.options.type == 'overhead') {
			this.options.camera.position.x = tankPosition.x;
			this.options.camera.position.y = this.options.overhead.distance;
			this.options.camera.position.z = tankPosition.z;
			
			// Rotate camera with tank
			if (this.options.overhead.rotate)
		    	this.options.camera.rotation.y = tankRotation;
		}
		else if (this.options.type == 'chase') {
			this.options.camera.position.y = tankPosition.y+this.options.chase.height;
			
			
			var camera = this.options.camera;
			if (this.options.chase.follow == 'tank') {
				// Update the matrix before we calculate
				tankMesh.updateMatrixWorld();

				var newCameraPosition = tankMesh.matrixWorld.multiplyVector3(new THREE.Vector3(0,80,-this.options.chase.trailZ));
				
				// Fixed Y position
				newCameraPosition.y = this.options.camera.position.y;
				
				// Set camera position
				camera.position.copy(newCameraPosition);
			}
			else if (this.options.chase.follow == 'turret') {
				this.options.camera.position.x = tankPosition.x+Math.sin(turretRotation)*this.options.chase.trailX;
				this.options.camera.position.z = tankPosition.z+Math.cos(turretRotation)*this.options.chase.trailZ;
			}
		}
	
		this.options.camera.lookAt(tankPosition);
	}
});
