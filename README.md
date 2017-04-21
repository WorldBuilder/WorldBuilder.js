# WorldBuilder.js

WorldBuilder.js is a project intended to provide a multiplayer environment for dungeon masters who want to offer a uniquely flavored game engine to their players. It aims to be:

- **Easy to Manage**. Creating maps, enemies, and quests should be easy to do with little-to-no coding.
- **Hackable**. If you know JavaScript, you'll be able to tweak and extend the engine to your liking.
- **Locally Served**. The source code is freely available to run on your own computer.

## Gameplay

The two main game modes are `explore` and `battle`.

Exploration is done in real time; players click where to move, and their avatars move withoun hesistation.

However, battle is much more interesting. The engine aims to be a 2d version of [Grandia II's legendary battle system](https://www.youtube.com/watch?v=LcZJPRHMuhk).

## Roadmap

WorldBuilder.js is in early stages. However, the road to being minimally viable is not a long one:


- [x] Server-client data syncing
  - [ ] Optimize data sent over the wire
- [x] Render map with existing units
  - [x] Render health bars
  - [ ] Render a DM-defined image as background
  - [ ] Render terrain / walls definitons in map data
  - [ ] Collision detection for terrain / walls
  - [ ] Show animation when setting retreat point
  - [ ] Draw retreat path line during battle
  - [ ] Implement fog of war
- [x] Battle Timeline Loop
  - [x] Move units down the timeline based on their stats
  - [x] Pause when it's a player's turn to decide on an action
  - [x] When an action is done, set back unit on the timeline towards the beginning
  - [x] When attacking, move unit towards target and stike when in range
  - [ ] Calculate setback based on battle decision
  - [ ] Implement basic attack animation
  - [ ] Implement pausing for certain animations (spells, etc.)
- [x] Foundation for making battle decisions (attack, defend, etc.)
  - [ ] Implement defend
  - [ ] Implement spell system
- [ ] Basic Chat System
  - [ ] Allow DM to masquerade as NPCs
  - [ ] Render chat bubbles
- [ ] Build DM Dashboard
  - [ ] Allow DM to specify enemies and stats using a [TOML](https://github.com/toml-lang/toml) file
  - [ ] Allow DM to manually control where enemies move
  - [ ] Allow DM to spawn and manipulate enemies
- [ ] Implement cinematic mode
  - [ ] Pause all player activity
- [ ] Themable, artistic user interfaces!

If you're interested in working on any of these, create an issue for it, or chat with me on [gitter](https://gitter.im) for more information.
