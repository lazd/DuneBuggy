(function() {
	var faceMaterial = new THREE.MeshFaceMaterial({
		vetexColor: THREE.FaceColors
	});

	var hitBoxMaterial = new THREE.MeshBasicMaterial({
		color: 0xFF0000,
		doubleSided: true
	});

	var hitBoxGeometry = new THREE.CubeGeometry(13.5, 9, 26.2);

	db.Tank = new Class({
		extend: db.GameObject,
		
		construct: function(options) {
			// handle parameters
			this.options = jQuery.extend({
				name: 'Unknown',
				type: 'friend',
				position: new THREE.Vector3(0, 0, 0),
				rotation: 0,
				turretRotation: 0
			}, options);
			
			// internal control variables
			this.loaded = false;
	
			this.speed = 0;
		
			this.wheelOrientation = 0;
	
			this.turretOrientation = db.config.tank.initialTurretRotation;
			this.tankOrientation = db.config.tank.initialRotation;

			// internal helper variables
			this.Y_POSITION = 6;
	
			// root object
			/*
			this.root = new THREE.Object3D();
			*/
	
			this.hitBox = this.root = new Physijs.BoxMesh(hitBoxGeometry, hitBoxMaterial, db.config.tank.mass);
			this.hitBox.visible = false;
			this.root.position.set(0, this.Y_POSITION+220, 0);
			this.root.rotation.set(0, db.config.tank.initialRotation, 0);
			
			//this.root.add(this.hitBox);
	
			this.body = new THREE.Object3D();
			this.body.position.set(0, 0.25, 4);
			this.root.add(this.body);
	
			this.turret = new THREE.Object3D();
			this.turret.position.set(0, 0.75, 0);
			this.root.add(this.turret);
	
			this.loadPartsJSON("duneBuggy/models/tankBody.js", "duneBuggy/models/tankTurret.js");
	
			this.tracks = [];
			this.lastPosition = this.options.position.clone();
		},
		
	
		destruct: function() {
			// Remove tracks
			for (var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].destruct();
			}
		},
		
		createTank: function() {
			if (!this.tankGeometry || !this.turretGeometry)
				return false;
	
			var tankMaterial;
			if (this.options.type == 'friend') {
				tankMaterial = new THREE.MeshLambertMaterial({
					color: db.config.colors.friend,
					ambient: 0x222222,
					shading: THREE.SmoothShading,
					vertexColors: THREE.VertexColors
				});
			}
			else {
				tankMaterial = new THREE.MeshLambertMaterial({
					color: db.config.colors.enemy,
					ambient: 0x222222,
					shading: THREE.SmoothShading,
					vertexColors: THREE.VertexColors
				});
			}
			
			this.tankGeometry.materials[0] = tankMaterial;
			this.turretGeometry.materials[0] = tankMaterial;

			// Body
			this.bodyMesh = new Physijs.BoxMesh(this.tankGeometry, faceMaterial);
			//this.bodyMesh.scale.set(db.config.size.tank, db.config.size.tank, db.config.size.tank);
			//this.bodyMesh.rotation.y = db.config.tank.modelRotation;
			this.bodyMesh.castShadow = true;
			this.bodyMesh.receiveShadow = true;
			//this.body.add(this.bodyMesh);
	
			// Turret
			this.turretMesh = new THREE.Mesh(this.turretGeometry, faceMaterial);
			this.turretMesh.scale.set(db.config.size.tank, db.config.size.tank, db.config.size.tank);
			this.turretMesh.rotation.y = db.config.tank.modelRotation;
			this.turretMesh.position.z = 4;
			this.turretMesh.castShadow = true;
			this.turretMesh.receiveShadow = true;
			//this.turret.add(this.turretMesh);
	
			this.vehicle = new Physijs.Vehicle(this.bodyMesh, new Physijs.VehicleTuning(
				10.88,
				1.83,
				0.28,
				500,
				10.5,
				6000
			));
			this.options.game.scene.add(this.vehicle);
	
			this.loaded = true;
		},
		
		// Refactor to generic loader, put in gameobject
		loadPartsJSON: function(bodyURL, turretURL) {
			var loader = new THREE.JSONLoader();

			//console.log('Loading %s and %s', bodyURL, turretURL);
			var scope = this;
			loader.load(bodyURL, function(geometry) {
				scope.tankGeometry = geometry;
				scope.createTank();
			});
			
			loader.load(turretURL, function(geometry) {
				scope.turretGeometry = geometry;
				scope.createTank();
			});
		},
		
		update: function(delta) {
			this.updateTracks();
		},
		
		updateTracks: function() {
			var time = new Date().getTime();

			// Get current position and rotation vectors
			var curPosition = this.getRoot().position.clone();
			var curRotation = this.getRoot().rotation.clone();

			// Draw tracks if the otherTank has moved
			if ((Math.abs(curPosition.x-this.lastPosition.x) + Math.abs(curPosition.z-this.lastPosition.z)) > db.config.tracks.distance) {
				var track = new db.Track({
					game: this.game,
					position: curPosition,
					rotation: curRotation,
					time: time
				});
				
				// Store tracks
				this.tracks.push(track);

				this.lastPosition = curPosition;
			}
		
			// Erase old tracks
			for (var i = this.tracks.length-1; i >= 0; i--) {
				var track = this.tracks[i];
				var age = time-track.time;

				// Remove stale tracks
				if (age > db.config.tracks.fadeTime) {
					this.tracks.splice(i, 1);
					track.destruct();
				}
				else {
					// Fade old tracks
					var opacity = 1-(age/db.config.tracks.fadeTime);
					track.setOpacity(opacity);
				}
			}
		},
	
		getPosition: function() {
			return this.root.position.clone();
		},

		setPosition: function (position, rotation, tRot) {
			// position
			this.root.position.x = position[0];
			this.root.position.z = position[1];

			// rotation
			this.root.rotation.y = rotation !== undefined ? rotation : this.root.rotation.y;
	
			this.turret.rotation.y = tRot !== undefined ? tRot : this.turret.rotation.y;
		},

		reset: function(pos, rotation, tRot) {
			this.wheelOrientation = 0;
			this.tankOrientation = 0;
			this.speed = 0;
			this.root.position.x = pos ? pos[0] : 0;
			this.root.position.z = pos ? pos[1] : 0;
			this.turretOrientation = tRot || db.config.tank.initialTurretRotation;
			this.tankOrientation = rotation || db.config.tank.initialRotation;
		},
		
		applyOpacity: function(opacity, obj, time) {
			setTimeout(function() {
				obj.opacity = opacity;
			}, time);
		},

		takeHit: function() {
			var steps = 20;
			for (var i = 0; i <= steps; i++) {
				this.applyOpacity(i/steps, this.tankGeometry.materials[0], i*5);
				this.applyOpacity(i/steps, this.turretGeometry.materials[0], i*5);
			}
		},
	
		getBody: function() {
			return this.body;
		},

		getTurret: function() {
			return this.turret;
		},

		getType: function() {
			return this.options.type;
		},
	
		getHitBox: function() {
			return this.hitBox;
		},
		
		getType: function() {
			return this.options.type;
		},
		
		getName: function() {
			return this.options.name;
		}
	});
}());

