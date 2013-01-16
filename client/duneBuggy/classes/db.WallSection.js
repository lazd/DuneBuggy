db.WallSection = new Class({
	toString: 'WallSection',
	extend: db.MapItem,
	options: {
		hp: 1000,
		mass: 0,
		model: {
			url: "duneBuggy/models/wall_section.js",
			yPosition: 10,
			size: db.config.size.wall
		}
	}
});
