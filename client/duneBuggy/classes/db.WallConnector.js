db.WallConnector = new Class({
	toString: 'WallConnector',
	extend: db.MapItem,
	options: {
		mass: 0,
		model: {
			url: "duneBuggy/models/wall_connector.js",
			yPosition: 10,
			size: db.config.size.wall
		}
	}
});
