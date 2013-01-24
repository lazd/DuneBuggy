db.Mouse = function() {
	this.mousePosition = [0, 0];
	
	this.mouseButtons = {
		left: false,
		middle: false,
		right: false
	};
	
	this.rotationX = 0;
	this.rotationY = 0;
	
	this._onMouseMove = this._onMouseMove.bind(this);
	this._onMouseDown = this._onMouseDown.bind(this);
	this._onMouseUp = this._onMouseUp.bind(this);
	
	// bind keyEvents
	document.addEventListener("mousemove", this._onMouseMove, false);
	document.addEventListener("mousedown", this._onMouseDown, false);
	document.addEventListener("mouseup", this._onMouseUp, false);
	
	// Disable right click
	document.oncontextmenu = function() { return false; };
};

db.Mouse.prototype.destroy	= function() {
	// unbind keyEvents
	document.removeEventListener("mousemove", this._onMouseMove, false);
	document.removeEventListener("mousedown", this._onMouseDown, false);
	document.removeEventListener("mouseup", this._onMouseUp, false);
};

db.Mouse.prototype._onMouseDown = function(evt) {
	if (evt.button == 0)
		this.mouseButtons.left = true;
	else if (evt.button == 1)
		this.mouseButtons.right = true;
	else if (evt.button == 2)
		this.mouseButtons.middle = true;
	
	// Stop event
	evt.preventDefault();
	
	return false;
};

db.Mouse.prototype._onMouseUp = function(evt) {
	if (evt.button == 0)
		this.mouseButtons.left = false;
	else if (evt.button == 1)
		this.mouseButtons.right = false;
	else if (evt.button == 2)
		this.mouseButtons.middle = false;
};

db.Mouse.prototype._onMouseMove = function(evt) {
	this.mousePosition[0] = evt.pageX;
	this.mousePosition[1] = evt.pageY;
	
	var movementX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || 0;
	var movementY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || 0;
	
	this.rotationX = this.rotationX + movementX*-1 * Math.PI/1024;
	this.rotationY = this.rotationY + movementY*-1 * Math.PI/1024;
};

db.Mouse.prototype.buttons = function() {
	return this.mouseButtons;
};

db.Mouse.prototype.position = function() {
	return this.mousePosition;
};

db.mouse = new db.Mouse();
