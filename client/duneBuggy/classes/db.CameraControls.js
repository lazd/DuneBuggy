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
				
				
				// Using rotation straight up
				// var rotation = tankMesh.rotation.clone();
				// console.log('Y: ', Math.toDegrees(rotation.y));
				
				
				/*
				// Using matrix rotation world
				var matrix = tankMesh.matrixRotationWorld.clone();
				matrix.extractRotation(tankMesh.matrixWorld);
				
				var rotation = new THREE.Vector3().setEulerFromRotationMatrix(matrix);
				//console.log('Y: ', Math.toDegrees(rotation.y));
				*/
					
				
				// Using quaternion
				//var rotation = new THREE.Vector3().setEulerFromQuaternion(tankMesh.quaternion);
				//console.log('Y: ', Math.toDegrees(rotation.y));
				
				/*
				camera.matrixRotationWorld.extractRotation(tankMesh.matrixWorld);
				
				camera.matrixRotationWorld.rotateY(Math.PI);
				//camera.matrixRotationWorld.makeRotationX(0);
				//camera.matrixRotationWorld.makeRotationZ(0);
				
				camera.rotation.setEulerFromRotationMatrix(camera.matrixRotationWorld);
				
				camera.updateMatrix();
				camera.matrixRotationWorld.multiplyVector3(new THREE.Vector3(0, 0, 1));
				
				camera.position.x = tankPosition.x;
				camera.position.z = tankPosition.z;
				*/
				
				camera.position.x = tankPosition.x+Math.sin(tankRotation)*this.options.chase.trailX;
				camera.position.z = tankPosition.z+Math.cos(tankRotation)*this.options.chase.trailZ;
			}
			else if (this.options.chase.follow == 'turret') {
				this.options.camera.position.x = tankPosition.x+Math.sin(turretRotation)*this.options.chase.trailX;
				this.options.camera.position.z = tankPosition.z+Math.cos(turretRotation)*this.options.chase.trailZ;
			}
		}
	
		this.options.camera.lookAt(tankPosition);
	}
});
