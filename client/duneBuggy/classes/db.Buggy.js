db.Buggy = new Class({
	extend: db.GameObject,
	
	getTurret: function() {
		return this.turret;
	},

	setPosition: function (position, rotation, tRot, aVeloc, lVeloc, interpolate) {
		var posInterpolation = 0.05;
		var rotInerpolation = 0.50;
		
		if (interpolate) {
			// Interpolate position by adding the difference of the calulcated position and the position sent by the authoritative client
			var newPositionVec = new THREE.Vector3(position[0], position[1], position[2]);
			var posErrorVec = newPositionVec.subSelf(this.root.position).multiplySelf(new THREE.Vector3(posInterpolation, posInterpolation, posInterpolation));			
			this.root.position.addSelf(posErrorVec);
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
			this.turret.rotation.y = tRot;
			
		if (aVeloc !== undefined && this.root.setAngularVelocity)
			this.root.setAngularVelocity({ x: aVeloc[0], y: aVeloc[1], z: aVeloc[2] });
			
		if (lVeloc !== undefined && this.root.setLinearVelocity)
			this.root.setLinearVelocity({ x: lVeloc[0], y: lVeloc[1], z: lVeloc[2] });
			
		// Tell the physics engine to update our position
		this.root.__dirtyPosition = true;
		this.root.__dirtyRotation = true;
	},
	
	destruct: function() {
		// Remove wheels
		this.game.scene.remove(this.vehicle.wheels[0]);
		this.game.scene.remove(this.vehicle.wheels[1]);
		this.game.scene.remove(this.vehicle.wheels[2]);
		this.game.scene.remove(this.vehicle.wheels[3]);
	},

	construct: function(options) {
		this.options = options;
		
		this.game = options.game;
		
		this.root = new THREE.Object3D();
		
		this.turret = new THREE.Object3D();
		
		this.bind(this.handleControls);
		
		// Store bullets and last fire time
		this.bullets = [];
		this.lastFireTime = {};
		
		this.controls = {
			power: null,
			direction: null,
			steering: 0,
			force: 0
		};
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
		var wheel = this.options.game.models.buggy_wheel.geometry;
		
		materials[0].map.flipY = false;
		materials[0].side = THREE.DoubleSide; // make it so we can't see through the bottom
	
		car.doubleSided = true;
	
		var material = new THREE.MeshFaceMaterial(materials);
	
		this.turret = new THREE.Mesh(turret, material);
		this.turret.position.z = -4.5;
	
		var mesh = this.root = new Physijs.ConvexMesh(
			car,
			material,
			db.config.buggy['mass']
		);
	
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
				wheel,
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
			/*
			mesh.addEventListener('collision', function(mesh) {
				console.log('Buggy collided: ', mesh);
			});
			*/
		
			options.game.scene.addEventListener(
				'update',
				this.handleControls
			);
		}
	},
	
	handleControls: function(delta) {
		if (this.controls && this.vehicle) {
			// Reset position if the vehicle has fallen off the edge or reset is pressed
			if (this.controls.reset || this.root.position.y < -100) {
				this.root.position.set(0, db.config.game.startY, 0);
				this.root.__dirtyPosition = true;
		
				this.root.rotation.set(0,0,0);
				this.root.__dirtyRotation = true;
		
				this.root.setLinearVelocity({x: 0, y: 0, z: 0});
				this.root.setAngularVelocity({x: 0, y: 0, z: 0});
				return;
			}
	
			// Handle steering
			if (this.controls.direction !== null) {
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
	handleFire: function() {
		var time = new Date().getTime();
		if (this.controls.fire && (!this.lastFireTime[this.game.currentWeapon] || time-this.lastFireTime[this.game.currentWeapon] >= db.config.weapons[this.game.currentWeapon].interval)) {
			var tankMesh = this.getRoot();
			var tankPosition = tankMesh.position.clone();
			var tankRotation = tankMesh.rotation.clone();
			// var turretRotation = tankRotation.worldY + this.turret.rotation.y;
			var turretRotation = this.turret.rotation.y;
			
			var type = this.game.currentWeapon;
			var bulletPosition = tankPosition.clone();

			// Create ordinance
			var bulletModel;
			if (type == 'missile') {
				bulletModel = new db.Missile({
					game: this.game,
					position: bulletPosition,
					rotation: tankRotation,
					type: 'friend'
				});
			}
			else {
				bulletModel = new db.Bullet({
					game: this.game,
					position: bulletPosition,
					rotation: tankRotation,
					type: 'friend'
				});
			}

			// Store bullet
			this.bullets.push({
				instance: bulletModel,
				type: type,
				time: time
			});

			// Emit event
			/*
			this.trigger('fire', {
				pos: [bulletPosition.x, bulletPosition.z],
				rot: turretRotation,
				type: type
			});
			*/
			
			var soundInfo = db.config.weapons[this.game.currentWeapon].sound;
			this.game.sound.play(soundInfo.file, soundInfo.volume);

			// Store last fire time
			this.lastFireTime[this.game.currentWeapon] = time;
		}
	},
	getPositionPacket: function() {
		var root = this.getRoot();
		var turret = this.getTurret();
		
		var tankPosition = (root && root.position) || new THREE.Vector3();
		var tankRotation = (root && root.rotation) || new THREE.Vector3();
		var turretRotation = (turret && turret.rotation) || new THREE.Vector3();

		var linearVelocity = (root.getLinearVelocity && root.getLinearVelocity()) || new THREE.Vector3();
		var angularVelocity = (root.getAngularVelocity && root.getAngularVelocity()) || new THREE.Vector3();
		
		return {
			pos: [tankPosition.x, tankPosition.y, tankPosition.z],
			rot: [tankRotation.x, tankRotation.y, tankRotation.z],
			aVeloc: [angularVelocity.x, angularVelocity.y, angularVelocity.z],
			lVeloc: [linearVelocity.x, linearVelocity.y, linearVelocity.z],
			tRot: turretRotation.y
		};
	}
});
