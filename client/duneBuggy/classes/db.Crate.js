db.Crate = new Class({
	toString: 'Crate',
	extend: db.MapItem,
	options: {
		hp: 21,
		model: {
			url: "duneBuggy/models/crate.js",
			yPosition: 4,
			size: db.config.size.crate,
			wrapTextures: false
		}
	}
});
