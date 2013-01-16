/** @namespace */
var THREEx	= THREEx 		|| {};

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
*/
THREEx.MouseState = function()
{
	this.mousePosition = [0, 0];
	
	this.mouseButtons = {
		left: false,
		middle: false,
		right: false
	};
	
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

/**
 * To stop listening of the keyboard events
*/
THREEx.MouseState.prototype.destroy	= function()
{
	// unbind keyEvents
	document.removeEventListener("mousemove", this._onMouseMove, false);
	document.removeEventListener("mousedown", this._onMouseDown, false);
	document.removeEventListener("mouseup", this._onMouseUp, false);
};

/**
 * to process the keyboard dom event
*/
THREEx.MouseState.prototype._onMouseDown = function(evt) {
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

/**
 * to process the keyboard dom event
*/
THREEx.MouseState.prototype._onMouseUp = function(evt) {
	if (evt.button == 0)
		this.mouseButtons.left = false;
	else if (evt.button == 1)
		this.mouseButtons.right = false;
	else if (evt.button == 2)
		this.mouseButtons.middle = false;
};

/**
 * to process the keyboard dom event
*/
THREEx.MouseState.prototype._onMouseMove = function(evt) {
	this.mousePosition[0] = evt.pageX;
	this.mousePosition[1] = evt.pageY;
};

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
*/
THREEx.MouseState.prototype.buttons = function()
{
	return this.mouseButtons;
};

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
*/
THREEx.MouseState.prototype.position = function()
{
	return this.mousePosition;
};

db.Mouse = new THREEx.MouseState();
