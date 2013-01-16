db.Wall = new Class({
	toString: 'Wall',
	extend: db.MapItem,
	construct: function(opts) {
		this.item = new THREE.Wall(this._opts);
	}
});
