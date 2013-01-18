/*
DuneBuggy - A multiplayer dune buggy battle game for the web  
Copyright (C) 2012 Lawrence Davis

DuneBuggy is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

DuneBuggy is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);

io.set('log level', 1);

// Listen on port 1935
app.listen(1935);

function handler(req, res) {
	// Dump out a basic server status page
	var data = '<!doctype html><head><title>DuneBuggy Server</title></head><body>';
	
	data += '<h1>DuneBuggy Server</h1>';
	
	data += '<table><thead><th>Name</th><th>IP</th><th>Position</th></thead><tbody>'
	for (var player in players) {
		var playerInfo = players[player];
		data += '<tr><td>'+playerInfo.name+'</td><td>'+playerInfo.ip+'</td><td>'+playerInfo.pos+'</td></tr>';
	}
	
	data += '</tbody></table>';
	
	data += '</body></html>';
	
	res.writeHead(200);
	res.end(data);
}

// Holds players
var players = {};

var mapItems = [
	{ type: 'Barrel', pos: [10, 20], rot: 0, hp: 100 },
	{ type: 'Crate',  pos: [10, 30], rot: 0, hp: 100 }
];

var mapSize = 1600;
var maxSpeed = 200; // units per second

function getRandomCoord() {
	return Math.random()*mapSize - mapSize/2;
}
function getRandomPosition() {
	return [getRandomCoord(), 140, getRandomCoord()];
}

io.sockets.on('connection', function (socket) {
    var ip = socket.handshake.address.address;
	console.log('Client connected from '+ip+'...');
	
	// Send welcome message
	socket.emit('welcome', {
		message: 'Welcome to DuneBuggy'
	});
	
	// Setup message handlers
	socket.on('join', function(message) {
		if (players[message.name] !== undefined && ip === players[message.name].ip) {
			console.warn('Error: '+message.name+' tried to join twice!');
			return;
		}
		
		if (!message.name) {
			console.error('Error: Cannot join, player name was null!');
			socket.emit('failed');
			return false;
		}
		
		console.log('Player joined: '+message.name);
		
		// Send list of players
		socket.emit('player list', players);
		
		// Send the map to the players
		socket.emit('map', mapItems);
		
		var pos = getRandomPosition();
		
	    socket.set('name', message.name, function() {
			// Store client info
			players[message.name] = {
				name: message.name,
				pos: pos,
				rot: message.rot,
				tRot: message.tRot,
				aVeloc: message.aVeloc,
				lVeloc: message.lVeloc,
				lastMove: (new Date()).getTime(),
				ip: ip
			};
			
			var packet = {
				name: message.name,
				pos: pos,
				rot: [0, 0, 0],
				tRot: 0,
				aVeloc: [0, 0, 0],
				lVeloc: [0, 0, 0]
			};
			
			socket.emit('move', packet);

			// Notify players of new challenger
			socket.broadcast.emit('join', {
				name: message.name,
				pos: pos,
				rot: message.rot,
				tRot: message.tRot,
				aVeloc: message.aVeloc,
				lVeloc: message.lVeloc
			});
		});
	});
	
	socket.on('disconnect', function() {
	    socket.get('name', function (err, name) {
			console.log(name+' dropped');
			
			// Remove from client list
			delete players[name];
			
			// Notify players
			socket.broadcast.emit('leave', {
				name: name
			});
	    });
	});
	
	socket.on('hit', function(message) {
	    socket.get('name', function (err, name) {
			socket.broadcast.emit('hit', {
				name: name,
				type: message.type
			});
		});
	});
	
	socket.on('mapItem hit', function(message) {
		// Get the map item
		var mapItem = mapItems[message.id];

		if (!mapItem) {
			console.warn('Tried to take hit on non-existant map item at index '+message.id);
			return;
		}

		// Subtract the damage
		mapItem.hp -= mesage.damage;
	
		var newMessage = {
			id: message.id,
			hp: mapItem.hp
		};
		
		// Destroy if necessary
		if (mapItems.hp < 0) {
			
			// Remove the map item reference
			mapItems[message.id] = undefined;
			
			// Broadcast destroyed
			socket.emit('mapItem destroyed', newMessage);
			socket.broadcast('mapItem destroyed', newMessage);
		}
		else {
			// Broadcast hit
			socket.emit('mapItem hit', newMessage);
			socket.broadcast('mapItem hit', newMessage);
		}
	});
	
	socket.on('killed', function(message) {
	    socket.get('name', function (err, name) {
			if (name === null) {
				console.error('killed failed: Player name was null!');
				console.log(err, name, message);
				throw new Error('Player name was null!');
			}

			socket.broadcast.emit('killed', {
				name: name,
				killer: message.killer
			});
			
			var newPos = getRandomPosition();
			var packet = {
				name: name,
				pos: newPos,
				rot: [0, 0, 0],
				tRot: 0,
				aVeloc: [0, 0, 0],
				lVeloc: [0, 0, 0]
			};
			
			players[name].pos = newPos;
			
			// Notify self
			socket.emit('move', packet);
			
			// Notify players
			socket.broadcast.emit('move', packet);
		});
	});
	
	socket.on('fire', function(message) {
	    socket.get('name', function (err, name) {
			socket.broadcast.emit('fire', {
				name: name,
				pos: message.pos,
				rot: message.rot,
				type: message.type
			});
		});
	});
	
	socket.on('move', function(message) {
		socket.get('name', function (err, name) {
			if (players[name]) {
				var player = players[name];
			
				/*	
				var timeDelta = (message.time-player.lastMove)/1000;
				
				var distance = Math.sqrt(Math.pow(player.pos[0]-message.pos[0],2)+Math.pow(player.pos[1]-message.pos[1],2));
				var speed = distance/timeDelta;
				if (speed > maxSpeed) {
					console.warn('Cheat: '+name+' attempted to move at '+speed+' u/s ('+distance+' in '+timeDelta+')');
				
					// Reset to previous position
					socket.emit('move', {
						name: name,
						pos: player.pos,
						rot: player.rot,
						tRot: player.tRot
					});
					return;
				}
				*/
					
				// Update position
				player.pos = message.pos;
				player.rot = message.rot;
				player.tRot = message.tRot;
				player.aVeloc = message.aVeloc;
				player.lVeloc = message.lVeloc;
				player.lastMove = message.time;
			
				// Notify players
				socket.broadcast.emit('move', {
					name: name,
					pos: message.pos,
					rot: message.rot,
					tRot: message.tRot,
					aVeloc: message.aVeloc,
					lVeloc: message.lVeloc
				});
			}
			else {
				socket.emit('failed');
			}
		});
	});
});
