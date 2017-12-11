# WorldBuilder.js

WorldBuilder.js is a project intended to provide a multiplayer environment for dungeon masters who want to offer a uniquely flavored game engine to their players. It aims to be:

- **Easy to Manage**. Creating maps, enemies, and quests should be easy to do with little-to-no coding.
- **Hackable**. If you know JavaScript, you'll be able to tweak and extend the engine to your liking.
- **Locally Served**. The source code is freely available to run on your own computer.

## Requirements

- node 7.8.0+
- [Tiled Map Editor](www.mapeditor.org) (for dungeon masters creating maps)

## Setup

```bash
$ git clone https://github.com/gilbert/WorldBuilder.js
$ cd WorldBuilder.js
$ npm install
$ npm start
```

Now visit [localhost:4242](http://localhost:4242).

## Gameplay

The two main game modes are `explore` and `battle`.

Exploration is done in real time; players click where to move, and their avatars move without hesistation.

However, battle is much more interesting. The engine aims to be a 2d version of [Grandia II's legendary battle system](https://www.youtube.com/watch?v=LcZJPRHMuhk).

## Code Flow

This app is a client/server architecture with syncing game state, so the code can feel unwieldy at first. However, once understood, it's not difficult to navigate around.

Starting from the user's perspective, when making a decision:

- The [DecisionPrompt](./client/components/battle/decision-prompt.ts) component activates
- User selects action type (skill or item)
  - User selects a skill if needed
- Game engine displays a list of valid targets based on [getValidTargets](./engine/battle-shared.ts)
- User selects a target
- The client-side [game model](./client/models/game.ts) sends a message via a websocket to the server using the `act` function
- The server receives the message via the [`'user-input'`](./server/config/config-websockets.ts) message
- After validation, the server passes the message to the [game engine](./engine/index.ts) `registerUserInput` method, which just stores it in the game state
- Dring the next frame, the [game engine](./engine/index.ts) handles the user input within its `step` function
  - During a battle, this will pass the user input to the [battle engine's](./engine/battle.ts) handleAction function
- From here, game state is updated, and changes are distributed across all clients via [websocket + multicast](./server/config/config-websockets.ts).
- Each client receives an updated game state in the [client-side game model](./client/models/game.ts), which simply stores it and redraws the UI.
- Loop!

## Roadmap

WorldBuilder.js is in early stages. However, the road to being minimally viable is not a long one:


- [x] Server-client data syncing
  - [ ] Optimize data sent over the wire
  - [ ] Occasionally save gamestate to disk on server-side
- [ ] User Authentication
  - [ ] Allow DM to specify usernames & passwords in a [TOML](https://github.com/toml-lang/toml) file
- [x] Render map with existing units
  - [x] Render health bars
  - [ ] Render a DM-defined image as background
  - [ ] Render terrain / walls definitons in map data
  - [ ] Collision detection for terrain / walls
  - [ ] Show animation when setting retreat point
  - [ ] Draw intent path for user player
  - [ ] Draw retreat path for user player during battle
  - [ ] Implement fog of war
  - [ ] Draw orange highlight on targeted units
- [x] Battle Timeline Loop
  - [x] Pause when it's a player's turn to decide on an action
  - [ ] Implement movement as an action (with pathfinding)
  - [ ] When a skill is done, set back unit on the timeline based on the skill's cooldown
  - [ ] Implement basic attack animation
  - [ ] Implement pausing for certain animations (skills, etc.)
- [x] Foundation for making battle decisions (skills, items, etc.)
- [x] Implement skill system
  - [ ] Implement "single-target" skill target type
  - [ ] Implement "radius" (area of effect) skill target type
  - [ ] Implement "cancel" skill effect
- [ ] Implement items
  - [ ] Implement item inventory
  - [ ] Implement item usage during battle
  - [ ] Implement item usage outside of battle
- [ ] Basic Chat System
  - [ ] Allow DM to masquerade as NPCs
  - [ ] Render chat bubbles
- [ ] Build DM Dashboard
  - [x] Allow DM to specify skills using a [TOML](https://github.com/toml-lang/toml) file
  - [ ] Allow DM to specify enemies and stats using a [TOML](https://github.com/toml-lang/toml) file
  - [ ] Allow DM to manually control where enemies move
  - [ ] Allow DM to spawn and manipulate enemies
- [ ] Implement cinematic mode
  - [ ] Pause all player activity
- [ ] Themable, artistic user interfaces!

If you're interested in working on any of these, create an issue for it, or chat with me on [gitter](https://gitter.im) for more information.
