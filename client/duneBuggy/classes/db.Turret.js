db.Turret = new Class({
	toString: 'Turret',
	extend: db.MapItem,
	options: {
		hp: 7,
		model: {
			url: "duneBuggy/models/turret.js",
			yPosition: 1,
			size: db.config.size.turret,
			wrapTextures: false
		}
	}
});
