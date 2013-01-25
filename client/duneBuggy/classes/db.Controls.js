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

	// Turret positioning
	if (hasGamepad) {
		var turret = this.getTurret();
		var xRot = gamepad.aiming.y*5*delta
		var yRot = gamepad.aiming.x*5*delta;
		
		// Rotate X relative to model axis
		turret.matrix.rotateX(xRot);
		
		// Rotate Y relative to world axis
		var axis = new THREE.Vector3(0,1,0);
		var rotWorldMatrix = new THREE.Matrix4();
		rotWorldMatrix.makeRotationAxis(axis.normalize(), yRot);
		rotWorldMatrix.multiplySelf(turret.matrix); // pre-multiply
		turret.matrix = rotWorldMatrix;
		turret.rotation.setEulerFromRotationMatrix(turret.matrix, 'XYZ');
		
		
		turret.updateMatrixWorld();
		this.turretRotation.setEulerFromRotationMatrix(turret.matrixWorld);
	}
	else if (this.game.pointerLocked) {
		this.getTurret().rotation.y = mouse.rotationX;
		
		// Needs to set Z or X as a function of Y....
		this.getTurret().rotation.x = -mouse.rotationY;
	}
	else {
		// Tank position
		var buggy = this.getRoot()
		buggy.updateMatrixWorld();
		var turretPosition = buggy.matrixWorld.multiplyVector3(this.turretOffset.clone());
		
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
	
		// Draw debug line (laser)
		this.game.debugLine.geometry.vertices[0].copy(turretPosition);
		this.game.debugLine.geometry.vertices[1].copy(targetPoint);
		this.game.debugLine.geometry.verticesNeedUpdate = true;
		
		var matrix = new THREE.Matrix4();
		matrix.lookAt(targetPoint, turretPosition, new THREE.Vector3(0,1,0));
		this.turretRotation.setEulerFromRotationMatrix(matrix, 'XYZ');
		
		// Point the turret at the target
		var turret = this.getTurret();
		
		// Look at the target
		turret.updateMatrixWorld();
		turret.matrixWorld.lookAt(targetPoint, turretPosition, new THREE.Vector3(0,1,0));
		turret.rotation.setEulerFromRotationMatrix(turret.matrixWorld, turret.eulerOrder);
		
		/*
		// Which matrix should be be fing with?
		turret.updateMatrix();
		turret.matrix.lookAt(targetPoint, turretPosition, new THREE.Vector3(0,1,0));
		turret.rotation.setEulerFromRotationMatrix(turret.matrix, turret.eulerOrder);
		*/
		
		// Damn, turret.rotation.y only goes between -Pi/2 and Pi/2!
		// console.log(turret.rotation.y.toFixed(1), buggy.eulerRotation.y.toFixed(1));
		// Take tank rotation into account somehow?
		// turret.rotation.y -= buggy.eulerRotation.y;
	}
	
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
