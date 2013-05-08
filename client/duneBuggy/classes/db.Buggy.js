db.Buggy = new Class({
	toString: 'Buggy',
	extend: db.GameObject,
	
	construct: function(options) {
		this.options = options;
		
		this.alliance = options.alliance;
		
		this.game = options.game;
		
		this.bind(this.handleControls);
		this.bind(this.handleCollision);
		
		// Store bullets and last fire time
		this.bullets = [];
		this.lastFireTime = {};
		
		// Set start hp
		this.hp = db.config.buggy.hp;
		
		// Turret's current rotation relative to the world
		this.turretRotation = new THREE.Vector3();
		
		// Turrets world position
		this.turretPosition = new THREE.Vector3();
		
		// Offset of center of turret from buggy
		this.turretOffset = new THREE.Vector3(0,14,-4.75);
		
		// Offset bullet start location
		this.bulletOffset = new THREE.Vector3(0,2,10);
		
		// Laser distance target
		this.laserOffset = new THREE.Vector3(0,0,500);
		
		this.controls = {
			power: null,
			direction: null,
			steering: 0,
			force: 0
		};
	},
	
	destruct: function() {
		// Remove wheels
		this.game.scene.remove(this.vehicle.wheels[0]);
		this.game.scene.remove(this.vehicle.wheels[1]);
		this.game.scene.remove(this.vehicle.wheels[2]);
		this.game.scene.remove(this.vehicle.wheels[3]);
	},

	init: function() {
		var options = this.options;
		
		var axle_width = 11.5;
		var wheel_z_front = 19;
		var wheel_z_back = -15;
		
		var box_height = 14;
		
		var wheel_y_front = -box_height/5; //-0.5-box_height/6;
		var wheel_y_back = -box_height/5; //-0.25-box_height/6
		
		var tuning_frontWheel = {
			suspension_stiffness: db.config.buggy['suspension_stiffness'],
			suspension_compression: db.config.buggy['suspension_compression'],
			suspension_damping: db.config.buggy['suspension_damping'],
			max_suspension_travel: db.config.buggy['max_suspension_travel'],
			max_suspension_force: db.config.buggy['max_suspension_force']
		};
	
		var tuning_backWheel = {
			suspension_stiffness: db.config.buggy['suspension_stiffness'],
			suspension_compression: db.config.buggy['suspension_compression'],
			suspension_damping: db.config.buggy['suspension_damping'],
			max_suspension_travel: db.config.buggy['max_suspension_travel'],
			max_suspension_force: db.config.buggy['max_suspension_force']
		};
		
		var that = this;
		
		var car = this.options.game.models.buggy_body.geometry;
		var materials = this.options.game.models.buggy_body.materials;
		var turret = this.options.game.models.buggy_turret.geometry;
		var wheelLeft = this.options.game.models.buggy_wheelLeft.geometry;
		var wheelRight = this.options.game.models.buggy_wheelRight.geometry;
		
		// Make texture map correctly
		materials[0].map.flipY = false;
		
		// Make it so we can't see through the bottom
		materials[0].side = THREE.DoubleSide;
	
		// Use the materials from the buggy
		var material = new THREE.MeshFaceMaterial(materials);
	
		// Create the mesh representing the buggy
		var mesh = this.root = new Physijs.ConvexMesh(
			car,
			material,
			db.config.buggy['mass']
		);
		
		mesh.instance = this;

		// Create the turret, position it on top of the buggy
		this.turret = new THREE.Mesh(turret, material);
		this.turret.position.copy(this.turretOffset);
		this.root.add(this.turret);

		if (options.position)
			mesh.position.copy(options.position);
		else
			mesh.position.y = 145;
	
		mesh.castShadow = true;
		//mesh.receiveShadow = true;

		var vehicle = this.vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
			db.config.buggy['suspension_stiffness'],
			db.config.buggy['suspension_compression'],
			db.config.buggy['suspension_damping'],
			db.config.buggy['max_suspension_travel_cm'],
			db.config.buggy['friction_slip'],
			db.config.buggy['max_suspension_force']
		));

		// mesh.useQuaternion = true;

		options.game.scene.add(vehicle);

		for (var i = 0; i < 4; i++) {
			var leftWheel = i % 2 === 0;
			var frontWheel = i <= 1;
	
			// TODO: flip wheel for left/right sides
			vehicle.addWheel(
				leftWheel ? wheelLeft : wheelRight,
				material,
				/* connection_point */ new THREE.Vector3(
						leftWheel ? -axle_width : axle_width,
						frontWheel ? wheel_y_front : wheel_y_back,
						frontWheel ? wheel_z_front : wheel_z_back
				),
				/* wheel_direction */ new THREE.Vector3(0, -1, 0),
				/* wheel_axle */ new THREE.Vector3(-1, 0, 0),
				/* suspension_rest_length */ db.config.buggy['suspension_rest_length'],
				/* wheel_radius */ db.config.buggy['wheel_radius'],
				/* is_front_wheel */ frontWheel,
				/* tuning */ !frontWheel ? tuning_frontWheel : tuning_backWheel
			);
		}
	
	
		if (options.alliance === 'self') {
			this.light = new THREE.DirectionalLight(0xFFFFFF, 2);
			// this.light.shadowCameraVisible = true; // For debugging
			this.light.castShadow = true;
			this.light.onlyShadow = true;
			this.light.shadowMapWidth = 1024;
			this.light.shadowMapHeight = 1024;
			this.light.shadowCameraNear = 500;
			this.light.shadowCameraFar = 4000;
			this.light.shadowCameraFov = 30;
			this.light.target = this.root;
			this.game.scene.add(this.light);
		
			// Process controls on each tick
			options.game.scene.addEventListener(
				'update',
				this.handleControls
			);
		}
		
		// Detect collisions
		mesh.addEventListener('collision', this.handleCollision);
	},
	
	getTurret: function() {
		return this.turret;
	},

	getPosition: function() {
		return {
			pos: this.root.position.clone(),
			rot: this.root.rotation.clone()
		};
	},

	setPosition: function (position, rotation, tRot, aVeloc, lVeloc, interpolate) {
		var posInterpolation = 0.05;
		var rotInerpolation = 0.50;
		
		if (interpolate) {
			// Interpolate position by adding the difference of the calulcated position and the position sent by the authoritative client
			var newPositionVec = new THREE.Vector3(position[0], position[1], position[2]);
			var posErrorVec = newPositionVec.sub(this.root.position).multiply(new THREE.Vector3(posInterpolation, posInterpolation, posInterpolation));
			this.root.position.add(posErrorVec);
		}
		else {
			// Directly set position
			this.root.position.set(position[0], position[1], position[2]);
		}

		// Set rotation
		if (rotation)
			this.root.rotation.set(rotation[0], rotation[1], rotation[2]);
		
		// Set turret rotation
		if (tRot !== undefined)
			this.turret.rotation.set(tRot[0], tRot[1], tRot[2]);
			
		if (aVeloc !== undefined && this.root.setAngularVelocity)
			this.root.setAngularVelocity({ x: aVeloc[0], y: aVeloc[1], z: aVeloc[2] });
			
		if (lVeloc !== undefined && this.root.setLinearVelocity)
			this.root.setLinearVelocity({ x: lVeloc[0], y: lVeloc[1], z: lVeloc[2] });
			
		// Tell the physics engine to update our position
		this.root.__dirtyPosition = true;
		this.root.__dirtyRotation = true;
	},
	
	handleCollision: function(mesh) {
		if (mesh.instance && mesh.instance.toString() !== 'Buggy') {
			var instance = mesh.instance;
			var ordinanceType = instance.toString().toLowerCase();
			
			var bulletAlliance = instance.alliance;
			
			if (this.options.alliance === 'enemy' && bulletAlliance === 'self') {
				console.log('Enemy buggy hit with '+ordinanceType);
				
				this.game.sound.play('hit_tank', this.game.getVolumeAt(this.getRoot().position));
				this.game.comm.hit(this.getName(), ordinanceType);
			}
			
		}
	},
	
	getName: function() {
		return this.options.name || 'self';
	},
	
	updateEulerRotation: function() {
		// Update the matrix
		this.root.updateMatrix();

		// Extract just the rotation from the matrix
		var rotation_matrix = new THREE.Matrix4();
		rotation_matrix.extractRotation(this.root.matrix);

		// Convert the rotation to euler coordinates with the proper order
		var rotation = new THREE.Vector3();
		rotation.setEulerFromRotationMatrix(rotation_matrix, 'XZY');
		
		this.root.eulerRotation = rotation;
		
		// Store position of bullet relative to the world
		this.bulletPosition = this.bulletOffset.clone().applyMatrix4(this.turret.matrixWorld);
	},
	
	handleControls: function(delta) {
		// Position shadow light
		this.light.position.copy(this.root.position);
		this.light.position.x -= 250;
		this.light.position.z -= 250;
		this.light.position.y = 500;
		
		if (this.controls && this.vehicle) {
			// Reset position if the vehicle has fallen off the edge or reset is pressed
			if (this.controls.reset || this.root.position.y < -100) {
				this.reset();
				return;
			}
	
			// Handle steering
			if (this.controls.direction !== null) {
				if (this.controls.direction !== 0) {
					this.controls.steering += this.controls.direction * db.config.buggy['steering_increment'];
					if (this.controls.steering < -db.config.buggy['max_steering_radius']) this.controls.steering = -db.config.buggy['max_steering_radius'];
					if (this.controls.steering > db.config.buggy['max_steering_radius']) this.controls.steering = db.config.buggy['max_steering_radius'];
				}
				else {
					if (this.controls.steering < 0)
						this.controls.steering = Math.min(this.controls.steering + db.config.buggy['steering_increment'], 0);
					else
						this.controls.steering = Math.max(this.controls.steering - db.config.buggy['steering_increment'], 0);
				}
			}
			else {
				// Adjust gamepad steering values
				this.controls.steering *= db.config.buggy['max_steering_radius'];
			}
			
			this.vehicle.setSteering(this.controls.steering, 0);
			this.vehicle.setSteering(this.controls.steering, 1);
			
			// Power/coast only when brakes not depressed
			// Forward overrides reverse
			// TODO: brake when reverse/forward given
			if (this.controls.brake) {
				this.controls.force = 0;
				this.vehicle.applyEngineForce(this.controls.force);
				this.vehicle.setBrake(db.config.buggy['brake_power'], 2);
				this.vehicle.setBrake(db.config.buggy['brake_power'], 3);
			}
			else if (this.controls.forward === true) {
				/*
				// Acceleration
				this.controls.force += db.config.buggy['max_power']/10;
				if (this.controls.force > db.config.buggy['max_power'])
					this.controls.force = db.config.buggy['max_power'];
				*/
				this.controls.force = db.config.buggy['max_power'];
	
				if (this.controls.boost) {
					this.controls.force = db.config.buggy['boost_power'];
				}
		
				this.vehicle.applyEngineForce(this.controls.force);
			}
			else if (this.controls.reverse === true) {
				this.controls.force = -db.config.buggy['max_power'];
				this.vehicle.applyEngineForce(this.controls.force);
			}
			else {
				this.controls.force = 0;
				this.vehicle.applyEngineForce(this.controls.force);
			}
		
			if (this.controls.fire)
				this.handleFire();
		}
	},
	
	takeHit: function(damage) {
		this.hp -= damage || 10;
		if (this.hp <= 0) {
			// Explode
			console.log('Killed!');
		}
	},
	
	reset: function() {
		this.root.position.set(0, db.config.game.startY, 0);
		this.root.__dirtyPosition = true;

		this.root.rotation.set(0,0,0);
		this.root.__dirtyRotation = true;

		this.root.setLinearVelocity({x: 0, y: 0, z: 0});
		this.root.setAngularVelocity({x: 0, y: 0, z: 0});
	},
	
	handleFire: function() {
		var time = new Date().getTime();
		if (this.controls.fire && (!this.lastFireTime[this.game.currentWeapon] || time-this.lastFireTime[this.game.currentWeapon] >= db.config.weapons[this.game.currentWeapon].interval)) {
			var buggy = this.getRoot();
			var tankPosition = buggy.position.clone();
			var tankRotation = buggy.eulerRotation.clone();
			
			var type = this.game.currentWeapon;

			// Create ordinance
			var bulletModel;
			var bulletPosition;
			if (type == 'missile') {
				bulletPosition = tankPosition;
				bulletRotation = tankRotation;
				bulletModel = new db.Missile({
					game: this.game,
					position: bulletPosition,
					rotation: bulletRotation,
					alliance: 'self'
				});
			}
			else {
				bulletPosition = this.bulletPosition;
				bulletRotation = this.turretRotation;
				bulletModel = new db.Bullet({
					game: this.game,
					position: bulletPosition,
					rotation: bulletRotation,
					alliance: 'self'
				});
			}

			// Store bullet
			this.bullets.push({
				instance: bulletModel,
				type: type,
				time: time
			});

			// Emit event
			this.trigger('fire', {
				pos: [bulletPosition.x, bulletPosition.y, bulletPosition.z],
				rot: [bulletRotation.x, bulletRotation.y, bulletRotation.z],
				type: type
			});
			
			var soundInfo = db.config.weapons[this.game.currentWeapon].sound;
			this.game.sound.play(soundInfo.file, soundInfo.volume);

			// Store last fire time
			this.lastFireTime[this.game.currentWeapon] = time;
		}
	},
	getPositionPacket: function() {
		var root = this.getRoot();
		var turret = this.getTurret();
		
		// Position & rotation
		var tankPosition = (root && root.position) || new THREE.Vector3();
		var tankRotation = (root && root.rotation) || new THREE.Vector3();
		var turretRotation = (turret && turret.rotation) || new THREE.Vector3();

		// Velocity
		var linearVelocity = (root.getLinearVelocity && root.getLinearVelocity()) || new THREE.Vector3();
		var angularVelocity = (root.getAngularVelocity && root.getAngularVelocity()) || new THREE.Vector3();
		
		return {
			pos: [tankPosition.x, tankPosition.y, tankPosition.z],
			rot: [tankRotation.x, tankRotation.y, tankRotation.z],
			aVeloc: [angularVelocity.x, angularVelocity.y, angularVelocity.z],
			lVeloc: [linearVelocity.x, linearVelocity.y, linearVelocity.z],
			tRot: [turretRotation.x, turretRotation.y, turretRotation.z]
		};
	}
});
