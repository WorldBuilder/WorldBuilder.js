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

Now visit [localhost:4242](http://localhost:4242). The default Game Master id/password is `gm` / `123`

## Gameplay

The two main game modes are `explore` and `battle`.

Exploration is done in real time; players click where to move, and their avatars move without hesistation.

However, battle is much more interesting. The engine aims to be a 2d version of [Grandia II's legendary battle system](https://www.youtube.com/watch?v=LcZJPRHMuhk).

## Code Flow

This app is a client/server architecture with syncing game state, so the code can feel unwieldy at first. However, once understood, it's not difficult to navigate around.

Starting from the user's perspective, when making a decision:

- The [DecisionPrompt](./client/components/battle/decision-prompt.ts) component activates
- User selects action type (skill, item, or move)
  - User selects a skill if needed
- Game engine displays a list of valid targets based on [getValidTargets](./engine/battle-shared.ts), or prompts a point on the map (for movement and certain skills)
- User selects a target or point
- The client-side [game model](./client/models/game.ts) sends a message via a websocket to the server using the `act` function
- The server receives the message via the [`'user-input'`](./server/config/config-websockets.ts) message
- After validation, the server passes the message to the [game engine](./engine/index.ts) `registerUserInput` method, which just stores it in the game state
- Dring the next frame, the [game engine](./engine/index.ts) handles the user input within its `step` function
  - During a battle, this will pass the user input to the [battle engine's](./engine/battle.ts) `handleAction` function
- From here, game state is updated, and changes are distributed across all clients via [websocket + multicast](./server/config/config-websockets.ts).
- Each client receives an updated game state in the [client-side game model](./client/models/game.ts), which simply stores it and redraws the UI.
- Loop!

## Roadmap

WorldBuilder.js is in early stages. However, the road to being minimally viable is not a long one:


- [x] Server-client data syncing
  - [ ] Optimize data sent over the wire
  - [ ] Occasionally save gamestate to disk on server-side
  - [ ] Watch for TOML file changes and update server state accordingly
- [x] User Authentication
  - [x] Allow DM to specify usernames & passwords in a [TOML](https://github.com/toml-lang/toml) file
- [x] Render map with existing units
  - [x] Render health bars
  - [ ] Render a DM-defined image as background
  - [x] Render terrain / walls definitons in map data
  - [x] Collision detection for terrain / walls
  - [ ] Draw intent path for user player
  - [ ] Implement fog of war
  - [x] Draw orange highlight on targeted units
- [x] Battle Timeline Loop
  - [x] Pause when it's a player's turn to decide on an action
  - [x] Implement movement as an action (with pathfinding)
  - [x] When a skill is done, set back unit on the timeline based on the skill's cooldown
  - [x] Implement basic attack animation
  - [ ] Implement timeline pausing for certain skill / item animations
- [x] Foundation for making battle decisions (skills, items, etc.)
- [x] Implement skill system
  - [x] Implement "single-target" skill target type
  - [ ] Implement "radius" (area of effect) skill target type
  - [x] Implement "cancel" skill effect
- [ ] Implement items
  - [ ] Implement item inventory
  - [ ] Implement item usage during battle
  - [ ] Implement item usage outside of battle
- [ ] Basic Chat System
  - [ ] Allow DM to masquerade as NPCs
  - [ ] Render chat bubbles
- [ ] Build DM Dashboard
  - [x] Allow DM to specify skills using a [TOML](https://github.com/toml-lang/toml) file
  - [ ] Allow DM to define enemy templates using a [TOML](https://github.com/toml-lang/toml) file
  - [x] Allow DM to manually control where enemies move
  - [ ] Allow DM to spawn and manipulate enemies
- [ ] Implement cinematic mode
  - [ ] Pause all player activity
- [ ] Themable, artistic user interfaces!

If you're interested in working on any of these, create an issue for it, or chat with me on [gitter](https://gitter.im) for more information.
