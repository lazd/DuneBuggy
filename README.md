DuneBuggy
========

A 3D multiplayer dune buggy battle game written entirely in JavaScript.


## Running the client

Open `client/index.html` in your WebGL capable browser. You'll have to run a simple webserver or enable local file access to load the models. See [How to run things locally][Run locally].

[Run locally]: https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally


### Controls

**Accelerate:**  W / Up arrow

**Brake:** D / Down arrow / Space

**Turn left:** A / Left arrow

**Turn right:** D / Right arrow

**Switch weapons:** Q

**Fire weapon:** Control / Left mouse button

**Nitrous:** Shift

**Toggle full screen:** Enter


## Starting a server

1. Make sure you have [NodeJS](http://nodejs.org) installed
2. Do a `npm install` inside of `server/`
3. Run `node server/index.js`


# Technology

**WebGL** - Used to render the game environment

**WebSockets** - For real time client/server communication

**WebWorkers** - To ensure physics engine calculations do not block visuals

**Node.js** - As a server

**HTML5 audio** - To play sounds/music

**Full-screen API** - For a real desktop gaming experience

**Pointer lock API** - For smooth first-person style rotation of the turret


# Software used

[Socket.IO] - Socket communication for the client and server

[three.js] - Lightweight JavaScript 3D library

[Physijs] - A physics plugin for [three.js] that utilizes the [ammo.js]/[Bullet physics engine]

[Socket.IO]: http://socket.io/
[three.js]: https://github.com/mrdoob/three.js/
[Physijs]: https://github.com/chandlerprall/Physijs
[ammo.js]: https://github.com/kripken/ammo.js/
[Bullet physics engine]: http://bulletphysics.org


# Credits

DuneBuggy couldn't have been made without the following freely available works:

## Models

[Dune buggy by wta][Model: Buggy]

[Oil tank by jo2bigornia][Model: Oil tank]

[Walls by stuklek][Model: Walls]

[Crate by Rick SL][Model: Crate]

[Missile by piojoman][Model: Missile]

[Barrels by PancakeMan96][Model: Barrels]

[Turret by Angryfly][Model: Turret]

[Jet by PyrZern][Model: Jet]

[Model: Buggy]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/604323
[Model: Oil Tank]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/661238
[Model: Walls]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/288445
[Model: Crate]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/459185
[Model: Missile]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/326837
[Model: Barrels]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/677878
[Model: Turret]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/568855
[Model: Jet]: http://www.turbosquid.com/FullPreview/Index.cfm/ID/511799


## Textures

[Oil tank texture by DeathniteDT][Texture: Oil Tank]

[Explosion by etayrien][Texture: Explosion]

[Texture: Oil Tank]: http://media.photobucket.com/image/recent/DeathniteDT/1-4.png
[Texture: Explosion]: http://blogs.msdn.com/b/etayrien/archive/2008/02/15/quick-n-dirty-tutorial-making-nice-explosion-sprites.aspx


## Sounds

[Missile Launch by Kibblesbob][Sound: Missile]

[Various sounds from Bolo &copy; 1993 Stuart Cheshire](http://www.bolo.net/)

[Sound: Missile]: http://soundbible.com/1794-Missle-Launch.html


# License

Copyright &copy; 2013 Lawrence Davis

[Licensed under the GPL license](https://github.com/lazd/DuneBuggy/blob/master/LICENSE.md)
