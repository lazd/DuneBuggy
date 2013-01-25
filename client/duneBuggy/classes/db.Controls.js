db.Buggy.prototype.keyMap = {
	keyStateUp: "up",
	keyStateUp2: "w",
	keyStateDown: "down",
	keyStateDown2: "s",
	keyStateLeft: "left",
	keyStateLeft2: "a",
	keyStateRight: "right",
	keyStateRight2: "d",
	keyStateFire: "ctrl",
	handBrake: "space",
	reset: "backtick",
	boost: "shift"
};


db.Buggy.prototype.controlsLoopCb = function(delta, now) {
	var keyboard = db.keyboard;
	var mouse = db.mouse;
	
	// Gamepad controls
	var hasGamepad = !!this.game.gamepad.gamepads.length;
	var gamepad = {};
	if (hasGamepad) {
		var gamepadState = this.game.gamepad.gamepads[0].state;
		
		gamepad.direction = gamepadState['LEFT_STICK_X']*-1;
		gamepad.aiming = {
			x: gamepadState['RIGHT_STICK_X']*-1,
			y: gamepadState['RIGHT_STICK_Y']*-1
		};
			
		gamepad.reverse = gamepadState['LEFT_TRIGGER'];
		gamepad.forward = gamepadState['RIGHT_TRIGGER'];
		
		gamepad.fire = gamepadState['LB'];
		gamepad.handBrake = gamepadState['RB'];
		
		gamepad.boost = gamepadState['X'];
		
		gamepad.reset = gamepadState['BACK'];
		
	}

	// Get references to important meshes
	var turret = this.getTurret();
	var buggy = this.getRoot();
	
	// Make sure the buggy's world matrix is fresh
	buggy.updateMatrixWorld();
	
	// Set rotation values if using a gamepad or locked pointer
	var xRot, yRot;
	if (hasGamepad) {
		xRot = gamepad.aiming.y*db.config.controls.gamepad.sensitivity*delta
		yRot = gamepad.aiming.x*db.config.controls.gamepad.sensitivity*delta;
		if (db.config.controls.gamepad.inverted)
			xRot *= -1;
	}
	else if (this.game.pointerLocked && this.mouseLastX !== undefined && this.mouseLastY !== undefined) {
		yRot = (this.mouseLastX-mouse.rotationX)*db.config.controls.mouse.sensitivity*delta*-1;
		xRot = (this.mouseLastY-mouse.rotationY)*db.config.controls.mouse.sensitivity*delta;
		if (db.config.controls.mouse.inverted)
			xRot *= -1;
	}
	
	this.mouseLastY = mouse.rotationY;
	this.mouseLastX = mouse.rotationX;
	
	// Turret positioning
	if (hasGamepad || this.game.pointerLocked) {
		// Rotate X relative to model axis
		turret.matrix.rotateX(xRot);
		
		// Rotate Y relative to world axis
		var axis = new THREE.Vector3(0,1,0);
		var rotWorldMatrix = new THREE.Matrix4();
		rotWorldMatrix.makeRotationAxis(axis.normalize(), yRot);
		rotWorldMatrix.multiplySelf(turret.matrix); // pre-multiply -- not sure what that means?
		turret.matrix = rotWorldMatrix;
		turret.rotation.setEulerFromRotationMatrix(turret.matrix, 'XYZ');
		
		turret.updateMatrixWorld();
		this.turretRotation.setEulerFromRotationMatrix(turret.matrixWorld);
	}
	else {
		// Mouse position
		var mouse2D = mouse.position();
		var mouse3D = this.game.get3DCoords(mouse2D[0], mouse2D[1]);
	
		// Cast a ray between the camera and the mouse position
		var ray = this.game.createRay(this.game.camera.position, mouse3D);
		
		var targetPoint = null;
		
		// Find where it hits the ground
		var intersections = ray.intersectObject(this.game.ground.root);
		if (intersections.length) {
			targetPoint = intersections[0].point;
		}
		else {
			targetPoint = mouse3D;
		}
	
		// Laser
		// turret.updateMatrixWorld(); // Make sure the turret's matrix is fresh
		
		// Get the world position of the turret
		var turretPosition = new THREE.Vector3();
		turretPosition.getPositionFromMatrix(this.turret.matrixWorld);
		
		// Look at the target
		var matrix = new THREE.Matrix4();
		matrix.lookAt(targetPoint, turretPosition, new THREE.Vector3(0,1,0));
		
		/*
		// Not doing the right thing
		// Extract the rotation from the buggy
		var matrix2 = new THREE.Matrix4();
		matrix2.extractRotation(buggy.matrixWorld);

		// Get the difference in rotation
		matrix.multiplySelf(matrix2); // UPGRADE: Changes to matrix.multiply in latest!
		*/
		
		// Apply the rotation
		turret.rotation.setEulerFromRotationMatrix(matrix, 'XYZ');
		
		// Extract the world rotation
		turret.updateMatrixWorld();
		this.turretRotation.setEulerFromRotationMatrix(turret.matrixWorld);
	}
	
	// Laser
	turret.updateMatrixWorld(); // Make sure the turret's matrix is fresh

	// Get the world position of the turret
	var turretPosition = new THREE.Vector3();
	turretPosition.getPositionFromMatrix(this.turret.matrixWorld);

	// Calculate a target point laserOffset away
	var targetPoint = this.turret.matrixWorld.multiplyVector3(this.laserOffset.clone());
	
	// Draw laser line
	this.game.debugLine.geometry.vertices[0].copy(turretPosition);
	this.game.debugLine.geometry.vertices[1].copy(targetPoint);
	this.game.debugLine.geometry.verticesNeedUpdate = true;
	
	// Steering
	if (keyboard.pressed(this.keyMap.keyStateLeft) || keyboard.pressed(this.keyMap.keyStateLeft2))
		this.controls.direction = 1;
	else if (keyboard.pressed(this.keyMap.keyStateRight) || keyboard.pressed(this.keyMap.keyStateRight2))
		this.controls.direction = -1;
	else if (hasGamepad) {
		this.controls.direction = null; // no keyboard controls
		this.controls.steering = gamepad.direction;
	}
	else
		this.controls.direction = 0;

	// Power
	if (keyboard.pressed(this.keyMap.keyStateUp) || keyboard.pressed(this.keyMap.keyStateUp2) || gamepad.forward)
		this.controls.forward = true;
	else
		this.controls.forward = false;

	if (keyboard.pressed(this.keyMap.keyStateDown) || keyboard.pressed(this.keyMap.keyStateDown2) || gamepad.reverse)
		this.controls.reverse = true;
	else
		this.controls.reverse = false;
	
	// Braking
	if (keyboard.pressed(this.keyMap.handBrake) || gamepad.handBrake)
		this.controls.brake = true;
	else
		this.controls.brake = false;
	
	// Weapons
	this.controls.fire = keyboard.pressed(this.keyMap.keyStateFire) || mouse.buttons().left || gamepad.fire;
	
	this.controls.boost = keyboard.pressed(this.keyMap.boost) || gamepad.boost;
	
	this.controls.reset = keyboard.pressed(this.keyMap.reset) || gamepad.reset;
};
