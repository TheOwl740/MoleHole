//levels.js contains all level and tile related classes and the set of room tilemaps.

//TILE SYSTEM
//tile super class
class Tile {
  constructor(transform, index, sprite, parentLevel, overlay) {
    //location info
    this.transform = transform;
    this.index = index;
    //tileset spritesheet
    this.sprite = sprite.duplicate();
    //level containing this tile
    this.parentLevel = parentLevel;
    //has been revealed
    this.revealed = false;
    //is currently in line of sight
    this.visible = false;
    //overlay object or null
    this.overlay = overlay;
    //subclass specific
    this.type;
    //boolean is walkable
    this.walkable;
    //boolean is flyable
    this.flyable;
  }
  //returns this tile's collider
  collider() {
    return new Collider(this.transform, tileShape);
  }
  //bonds an assigned overlay to this tile
  attachOverlay() {
    if(this.overlay) {
      this.overlay.attach(this);
    }
  }
  //render function is mostly uniform
  render() {
    if(this.revealed) {
      rt.renderImage(this.transform, this.sprite);
      if(this.overlay) {
        this.overlay.render();
      }
      if(!this.visible) {
        rt.renderRectangle(this.transform, tileShape, new Fill("#000000", 0.5), null);
      }
    }
  }
}
//wall tile class
class Wall extends Tile {
  constructor(transform, index, sprite, parentLevel, overlay) {
    super(transform, index, sprite, parentLevel, overlay);
    this.type = "wall"
    this.walkable = false;
    this.flyable = false;
    this.sprite.setActive(new Pair(tk.randomNum(0, 1), 3));
  }
  //choose appropriate sprite to match adjacent floor positions
  assignDirectionality() {
    //find adjacent floors
    let adjFloors = [];
    for(let j = 0; j < 9; j++) {
      if(j === 4) {
        continue;
      } else {
        let adjTile = this.parentLevel.getIndex(new Pair(this.index.x + ((j % 3) - 1), this.index.y + (Math.floor(j / 3) - 1)))
        if(adjTile !== null && adjTile.type !== "wall") {
          adjFloors.push(j);
        }
      }
    }
    //choose sprites
    if(adjFloors.length > 0) {
      this.sprite.setActive(new Pair(tk.randomNum(0, 1), adjFloors.includes(1) ? 2 : 3))
    }
  }
}
//pit tile class
class Pit extends Tile {
  constructor(transform, index, sprite, parentLevel, overlay) {
    super(transform, index, sprite, parentLevel, overlay);
    this.type = "pit"
    this.walkable = false;
    this.flyable = true;
    this.sprite.setActive(new Pair(tk.randomNum(0, 1), 4));
    //boolean determining if a sprite should be rendered (below floor/wall)
    this.usingSprite = false;
    //entity for fall handling
    this.entity = null;
  }
  //custom render function because some pits don't have sprites
  render() {
    if(this.revealed) {
      if(this.usingSprite) {
        rt.renderImage(this.transform, this.sprite);
      }
      if(this.overlay) {
        this.overlay.render();
      }
      if(!this.visible) {
        rt.renderRectangle(this.transform, tileShape, new Fill("#000000", 0.7), null);
      }
    }
  }
  //choose appropriate sprite to match adjacent floor positions
  assignDirectionality() {
    //find adjacent floors
    let adjFloors = [];
    for(let j = 0; j < 9; j++) {
      if(j === 4) {
        continue;
      } else {
        let adjTile = this.parentLevel.getIndex(new Pair(this.index.x + ((j % 3) - 1), this.index.y + (Math.floor(j / 3) - 1)))
        if(adjTile !== null && adjTile.type !== "pit") {
          adjFloors.push(j);
        }
      }
    }
    //choose sprites
    if(adjFloors.length > 0) {
      this.usingSprite = adjFloors.includes(7);
    }
  }
}
//floor tile subclass
class Floor extends Tile {
  constructor(transform, index, sprite, parentLevel, overlay) {
    super(transform, index, sprite, parentLevel, overlay);
    this.type = "floor"
    this.walkable = true;
    this.flyable = true;
    //floor sprites can be freely rotated
    this.sprite.r = tk.randomNum(0, 3) * 90;
    this.sprite.setActive(new Pair(tk.randomNum(0, 1), tk.randomNum(0, 1)));
    //entity bond point
    this.entity = null;
    //item list
    this.items = [];
  }
  removeItem(itemName) {
    let itemI = 0;
    let removed = false;
    while(itemI < this.items.length && !removed) {
      if(this.items[itemI].name === itemName) {
        this.items.splice(itemI, 1);
        removed = true;
      }
      itemI++;
    }
  }
}
//tile overlay
class TileOverlay {
  constructor(overlayType) {
    this.type = "tile overlay";
    this.overlayType = overlayType;
    this.sprite = null;
    //predetermined overlays
    switch(overlayType) {
      case "couchLeft":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 0));
        break;
      case "couchRight":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(1, 0));
        break;
      case "painting":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 6));
        break;
      case "greenBedLeft":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 1));
        break;
      case "greenBedRight":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(1, 1));
        break;
      case "pinkBedLeft":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 2));
        break;
      case "pinkBedRight":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(1, 2));
        break;
      case "orangeBedLeft":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 3));
        break;
      case "orangeBedRight":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(1, 3));
        break;
      case "dresser":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 4));
        break;
      case "monitor":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(1, 4));
        break;
      case "ballDresser":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(0, 5));
        this.sprite.y += tileSize / 3;
        break;
      case "teddy":
        this.sprite = images.overlays.moleHole.duplicate();
        this.sprite.setActive(new Pair(1, 5));
        break;
      default:
        this.sprite = images.missingTexture.duplicate();
    }
  }
  attach(parentTile) {
    this.parentTile = parentTile;
    //designated walkable overlays (default nonwalkable)
    this.parentTile.walkable = ["entrance", "exit", "couchLeft", "couchRight", "greenBedRight", "pinkBedRight", "orangeBedRight", "decor1", "decor2", "decor3", "decor4"].includes(this.overlayType);
    //determine overlay tileset
    switch(this.parentTile.parentLevel.zone) {
      case "Buggy Burrows":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        break;
      default:
        this.sprite = images.missingTexture.duplicate();
    }
    switch(this.overlayType) {
      case "entrance":
        this.sprite.setActive(new Pair(0, 0));
        break;
      case "exit":
        this.sprite.setActive(new Pair(1, 0));
        break;
      case "decor1":
        this.sprite.setActive(new Pair(0, 1));
        break;
      case "decor2":
        this.sprite.setActive(new Pair(1, 1));
        break;
      case "decor3":
        this.sprite.setActive(new Pair(0, 2));
        break;
      case "decor4":
        this.sprite.setActive(new Pair(1, 2));
        break;
      case "blocker1":
        this.sprite.setActive(new Pair(0, 3));
        break;
      case "blocker2":
        this.sprite.setActive(new Pair(1, 3));
        break;
      case "blocker3":
        this.sprite.setActive(new Pair(0, 4));
        break;
      case "statue":
        this.sprite.setActive(new Pair(1, 4));
        break;
    }
  }
  render() {
    rt.renderImage(this.parentTile.transform, this.sprite);
  }
}

//LEVELS AND ROOMS
//level class for each floor
class Level {
  constructor(levelId) {
    //data initialization
    this.type = "level";
    this.map = [];
    this.enemies = [];
    this.npcs = [];
    this.nmes = [];
    this.items = [];
    this.playerSpawn = null;
    this.visionRange = 5;
    this.levelId = levelId;
    this.zone = "";
    this.enemySpawnCountdown = 75;
    //assign zone
    if(this.levelId === 0) {
      this.zone = "The Mole Hill";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 1) {
      this.zone = "Buggy Burrows";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 5) {
      this.zone = "The Gnome Home";
      this.tileset = images.missingTexture;
    } else if(this.levelId >= 9) {
      this.zone = "Snakey Stronghold";
      this.tileset = images.missingTexture;
    } else if(this.levelId >= 13) {
      this.zone = "The Mustelid Mafia";
      this.tileset = images.missingTexture;
    }
    //populate map with walls
    for(let i = 0; i < 50; i++) {
      this.map.push([]);
      for(let ii = 0; ii < 50; ii++) {
        this.map[i][ii] = new Wall(new Pair((i - 25) * (tileSize - 1), (ii - 25) * (tileSize - 1)), new Pair(i, ii), images.tilesets.dirt, this);
      }
    }
    //array of prepped rooms
    let activeRooms = [];
    //array of matching origin section indices
    let activeSections = [];
    //set of consumed sections including those consumed by wide and tall rooms
    let blockedSections = new Set();
    //add entrance room
    if(this.levelId === 0) {
      //marshall's room entrance
      activeRooms.push(tileMaps[1]);
    } else if(this.levelId === 1) {
      //web room entrance
      activeRooms.push(tileMaps[5]);
    } else {
      //normal entrance
      activeRooms.push(tileMaps[6]);
    }
    //entrance always goes in center, add initial section index and blocked index
    activeSections.push(new Pair(3, 3));
    blockedSections.add(activeSections[0].stringKey());
    //value of rooms for treasure balancing
    let totalValue = 0;
    //list of eligible rooms gathered from tilemaps
    let eligibleRooms = [];
    for(let room of tileMaps) {
      //check that room is an entrance or exit and not blocked floor
      if(!([activeRooms[0].id, "exit"].includes(room.id) || room.blockedFloors.includes(this.levelId))) {
        //add eligible rooms to list
        eligibleRooms.push(room);
      }
    }
    //room search index for eligible rooms
    let rsi;
    //select and prep rooms
    while(activeRooms.length < this.levelId) {
      //select a room at random
      rsi = tk.randomNum(0, eligibleRooms.length - 1);
      //validate tier value
      if(totalValue + eligibleRooms[rsi].tier > 3) {
        //delete and continue if overvalued
        eligibleRooms.splice(rsi, 1)
        continue;
      }
      //connection valid holds parent connector index or false
      let cValid = false;
      //room indexer to pick a random eligible room
      let ri = 0;
      //while cycle limiter
      let lCycle = 0;
      //search for valid link (matching connections)
      while(lCycle < 50 && !cValid) {
        lCycle++;
        ri = tk.randomNum(0, activeRooms.length - 1);
        cValid = activeRooms[ri].validateConnection(eligibleRooms[rsi]);
      }
      //continue if invalid
      if(!cValid) {
        continue;
      }
      //check for room overlap in blocked sections, on all tiles consumed by room
    }
    //reskin floor adjacent walls and pits and attach overlays
    for(let i = 0; i < 50; i++) {
      for(let ii = 0; ii < 50; ii++) {
        let activeTile = this.map[i][ii];
        if(activeTile.type !== "floor") {
          activeTile.assignDirectionality();
        }
        activeTile.attachOverlay()
      }
    }
    //set player spawn an place npcs
    switch(this.levelId) {
      case 0:
        //place npcs alongside player
        for(let room = 0; room < activeRooms.length; room++) {
          if(activeRooms[room].id === "marshallsRoom") {
            this.playerSpawn = this.getIndex(new Pair(activeIndices[room].x + 4, activeIndices[room].y - 1)).transform.duplicate();
            this.npcs.push(new Minnie(this.getIndex(new Pair(activeIndices[room].x + 2, activeIndices[room].y - 1)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 3, activeIndices[room].x - 1))))
          }
          if(activeRooms[room].id === "pitRoom") {
            this.npcs.push(new Michael(this.getIndex(new Pair(activeIndices[room].x + 4, activeIndices[room].y - 2)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 4, activeIndices[room].x - 2))))
            this.npcs.push(new Maxwell(this.getIndex(new Pair(activeIndices[room].x + 2, activeIndices[room].y - 4)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 2, activeIndices[room].x - 4))))
            this.npcs.push(new Magnolia(this.getIndex(new Pair(activeIndices[room].x + 3, activeIndices[room].y - 2)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 3, activeIndices[room].x - 2))))
          }
        }
        //break as playerspawn is also placed, so no need for default
        break;
      case 3:
        //place centipete and centipenny
      case 7:
        //place gerard gnome
      case 11:
        //place leonard lizard
      case 15:
        //place madeline mole
      default:
        for(let room = 0; room < activeRooms.length; room++) {
          if(activeRooms[room].id === "entranceRoom") {
            this.playerSpawn = this.getIndex(new Pair(activeIndices[room].x + 2, activeIndices[room].y - 2)).transform.duplicate();
          }
        }
    }
    for(let i = 0; i < (this.levelId / 2); i++) {
      let spawnTile = null;
      let validSpawn = false;
      while(!validSpawn) {
        spawnTile = this.getIndex(new Pair(tk.randomNum(0, 49), tk.randomNum(0, 49)));
        if(spawnTile.type === "floor") {
          this.items.push(lootRoll(Math.ceil(this.levelId / 9), spawnTile));
          validSpawn = true;
        }
      }
    }
    //place initial enemies (relies on player spawn)
    for(let i = 0; i < (this.levelId * 1.5) + 5; i++) {
      this.spawnEnemy(true);
    }
  }
  render() {
    for(let i = 0; i < 2500; i++) {
      this.map[Math.floor(i / 50)][i % 50].render();
    }
    for(let i = 0; i < this.items.length; i++) {
      this.items[i].render();
    }
    for(let i = 0; i < this.nmes.length; i++) {
      this.nmes[i].render();
    }
    for(let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].render();
    }
    for(let i = 0; i < this.npcs.length; i++) {
      this.npcs[i].render();
    }
  }
  //pinged by turn controller each turn
  turnPing() {
    if(this.enemySpawnCountdown > 0) {
      this.enemySpawnCountdown--;
    } else {
      this.enemySpawnCountdown = 50 - this.levelId;
      this.spawnEnemy(false);
    }
  }
  update() {
    //remove dead enemies
    for(let i = 0; i < this.enemies.length; i++) {
      if(this.enemies[i].health.current < 1) {
        //remove turn
        currentTC.remove(this.enemies[i]);
        //add death fade
        currentEC.add(new Death(this.enemies[i]));
        //add xp to player
        player.addXP(this.enemies[i].xpValue);
        //reduce next spawn countdown
        this.enemySpawnCountdown -= 5;
        //reset tile
        this.enemies[i].tile.entity = null;
        //loot chance
        if(tk.randomNum(0, 5) === 0) {
          this.items.push(lootRoll(1, this.enemies[i].tile));
        }
        //remove from index
        this.enemies.splice(i, 1);
        i--;
      }
    }
    //remove dead npcs
    for(let i = 0; i < this.npcs.length; i++) {
      if(this.npcs[i].health.current < 1) {
        currentTC.remove(this.npcs[i]);
        currentEC.add(new Death(this.npcs[i]));
        this.enemies[i].tile.entity = null;
        this.enemies.splice(i, 1);
        i--;
      }
    }
    //remove deleted nmes
    for(let i = 0; i < this.nmes.length; i++) {
      if(this.nmes[i].deleteNow) {
        if(this.nmes[i].type === "chest") {
          this.items.push(this.nmes[i].loot);
        }
        this.nmes[i].tile.entity = null;
        this.nmes.splice(i, 1);
        i--;
      }
    }
    //remove deleted items
    for(let i = 0; i < this.items.length; i++) {
      if(this.items[i].deleteNow) {
        this.items.splice(i, 1);
        i--;
      }
    }
  }
  getTile(transform) {
    for(let tile = 0; tile < 2500; tile++) {
      if(tk.detectCollision(transform, this.map[Math.floor(tile / 50)][tile % 50].collider())) {
        return this.map[Math.floor(tile / 50)][tile % 50];
      }
    }
    return null;
  }
  getIndex(index) {
    if(index.x >= 0 && index.x < 50 && index.y >= 0 && index.y < 50) {
      return this.map[index.x][index.y] || null;
    } else {
      return null;
    }
  }
  getNonWalkables(client) {
    const retList = [];
    //get entities that can't be walked on
    if(client.type !== "level") {
      //block targeting enemies unless they are target index (for hit)
      this.enemies.forEach((enemy) => {
        if(!(enemy.tile.index.isEqualTo(client.tile.index) || enemy.tile.index.isEqualTo(client.targetIndex) || !enemy.tile.visible)) {
          retList.push(enemy.tile.index.duplicate());
        }
      });
      //block targeting npcs unless they are target index (for interaction)
      this.npcs.forEach((npc) => {
        if(!(npc.tile.index.isEqualTo(client.tile.index) || npc.tile.index.isEqualTo(client.targetIndex) || !npc.tile.visible)) {
          retList.push(npc.tile.index.duplicate());
        }
      });
      //block targeting nmes unless they are target index (for interaction)
      this.nmes.forEach((nme) => {
        if(!(nme.tile.index.isEqualTo(client.tile.index) || nme.tile.index.isEqualTo(client.targetIndex))) {
          retList.push(nme.tile.index.duplicate());
        }
      });
      //block targeting player unless he is target index
      if(!(client.type === "player" || player.tile.index.isEqualTo(client.targetIndex))) {
        retList.push(player.tile.index.duplicate());
      }
    }
    //get walls, pits if not flying, and non revealed tiles
    for(let ct = 0; ct < 2500; ct++) {
      let tObj = this.map[Math.floor(ct / 50)][ct % 50];
      if((!((tObj.flyable && client.flying) || tObj.walkable)) || (client.type === "player" && !tObj.revealed)) {
        retList.push(tObj.index);
      }
    }
    return retList;
  }
  spawnEnemy(earlySpawn) {
    //decides what enemy will spawn, for weighted spawns
    let enemySeed = tk.randomNum(0, 100)
    //find a valid spawn location
    let spawnTile = null;
    let validSpawn = false;
    while(!validSpawn) {
      //pick random index
      spawnTile = this.getIndex(new Pair(tk.randomNum(0, 49), tk.randomNum(0, 49)));
      //check for walkable floor
      if(spawnTile.type === "floor" && spawnTile.entity === null) {
        //check for player
        if(earlySpawn) {
          if(tk.pairMath(spawnTile.index, this.getTile(this.playerSpawn).index, "distance") > this.visionRange * 1.5) {
            validSpawn = true;
          }
        } else {
          if(tk.pairMath(spawnTile.index, player.tile.index, "distance") > this.visionRange * 1.5) {
            validSpawn = true;
          }
        }
      }
    }
    switch(this.levelId) {
      case 1:
        this.enemies.push(new WigglyWorm(spawnTile.transform.duplicate(), spawnTile));
        break;
      case 2:
        if(enemySeed > 50) {
          this.enemies.push(new WigglyWorm(spawnTile.transform.duplicate(), spawnTile));
        } else {
          this.enemies.push(new Spiderling(spawnTile.transform.duplicate(), spawnTile));
        }
        break;
    }
  }
  reshade() {
    //darken all tiles
    for(let ti = 0; ti < 2500; ti++) {
      this.map[Math.floor(ti / 50)][ti % 50].visible = false;
    }
    //lighten player tile
    player.tile.revealed = true;
    player.tile.visible = true;
    //set of tile indices with finished lighting
    const closed = new Set();
    //key function
    function toKey(index) {
      return index.x + "," + index.y;
    }
    //circle around player with tile casts
    for(let angle = 0; angle < 360; angle += 5) {
      //mini raycast
      for(let d = 0; d < this.visionRange; d++) {
        let activeTile = rotationalTile(player.tile.index, angle, d);
        if(activeTile === null) {
          break;
        }
        if(activeTile.type === "wall") {
          activeTile.revealed = true;
          activeTile.visible = true;
          break;
        } else {
          if(!closed.has(toKey(activeTile?.index))) {
            activeTile.revealed = true;
            activeTile.visible = true;
            closed.add(toKey(activeTile.index));
          }
        }
      }
    }
  }
}
//room class for level stamping
class Room {
  constructor(id, tier, entranceCount, blockedFloors, tileOverlays, entities, tileMap) {
    [this.w, this.h] = [tileMap[0].length, tileMap.length];
    this.id = id;
    this.tier = tier;
    this.entranceCount = entranceCount;
    this.blockedFloors = blockedFloors;
    this.tileOverlays = tileOverlays;
    this.entities = entities;
    this.tileMap = tileMap;
    this.connections = [];
    this.wide = this.w > 6;
    this.tall = this.h > 6;
    //determine connection sides (only one max each side, no corners)
    for(let tileRow of this.tileMap) {
      //left
      if(tileRow[0] === 'e') {
        this.connections.push(new Pair(-1, 0))
      }
      //right
      if(tileRow[tileRow.length - 1] === 'e') {
        this.connections.push(new Pair(1, 0))
      }
    }
    //top
    if(this.tileMap[0].includes('e')) {
      this.connections.push(new Pair(0, 1))
    }
    //bottom
    if(this.tileMap[this.tileMap.length - 1].includes('e')) {
      this.connections.push(new Pair(0, -1))
    }
  }
  stamp(level, tlIndex) {
    let tileset = level.tileset.duplicate();
    const retObj = {
      entranceIndices: [],
      nonwalkableIndices: []
    }
    //apply tiles
    for(let i = 0; i < this.w; i++) {
      for(let ii = 0; ii < this.h; ii++) {
        let activeTile = level.map[tlIndex.x + i][tlIndex.y - ii];
        switch(this.tileMap[ii][i]) {
          case 'f':
            level.map[tlIndex.x + i][tlIndex.y - ii] = new Floor(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            break;
          case 'w':
            level.map[tlIndex.x + i][tlIndex.y - ii] = new Wall(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            break;
          case 'p':
            level.map[tlIndex.x + i][tlIndex.y - ii] = new Pit(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            break;
          case 'e':
            level.map[tlIndex.x + i][tlIndex.y - ii] = new Wall(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            retObj.entranceIndices.push(activeTile.index.duplicate());
            break;
          }
        //note entrances
        if(this.tileMap[ii][i] !== 'e') {
          retObj.nonwalkableIndices.push(activeTile.index.duplicate())
        }
      }
    }
    //apply overlays
    if(this.tileOverlays) {
      this.tileOverlays.forEach((overlayModule) => {
        let targetTile = level.map[tlIndex.x + overlayModule.index.x][tlIndex.y - overlayModule.index.y];
        targetTile.overlay = overlayModule.overlay;
      });
    }
    //add entities
    this.entities.forEach((entityModule) => {
      let targetTile = level.map[tlIndex.x + entityModule.index.x][tlIndex.y - entityModule.index.y];
      switch(entityModule.entity) {
        case "silverChest":
          level.nmes.push(new Chest(targetTile.transform.duplicate(), targetTile, 0));
          break;
        case "goldChest":
          level.nmes.push(new Chest(targetTile.transform.duplicate(), targetTile, 0))
          break;
      }
    });
    //trim entrances
    while(retObj.entranceIndices.length > this.entranceCount) {
      let farthestDist = false;
      let farthestEntrance;
      let currentDist;
      for(let ent = 0; ent < retObj.entranceIndices.length; ent++) {
        currentDist = tk.pairMath(retObj.entranceIndices[ent], new Pair(24, 24), "distance")
        if(!farthestDist || farthestDist < currentDist) {
          farthestDist = currentDist;
          farthestEntrance = ent;
        }
      }
      retObj.entranceIndices.splice(farthestEntrance, 1);
    }
    return retObj;
  }
  //validates the connection between two rooms, returning true or false based on if they can be matched
  validateConnection(childRoom) {
    //cycle through this room's connections
    for(let ci = 0; ci < this.connections.length; ci++) {
      //check each connection if it is a pair
      if(ci.type === "pair") {
        //cycle through child room's connections
        for(let connectPoint of childRoom.connections) {
          //check for inverses (connection match)
          if(tk.pairMath(connectPoint, this.connections[ci], "add").isEqualTo(new Pair(0, 0))) {
            return this.connections[ci].duplicate();
          }
        }
      }
    }
    //false if no valid connections
    return false;
  }
}

const tileMaps = [
  new Room("pitRoom", 0, 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("couchLeft"),
      index: new Pair(2, 2)
    },
    {
      overlay: new TileOverlay("couchRight"),
      index: new Pair(3, 2)
    },
    {
      overlay: new TileOverlay("painting"),
      index: new Pair(3, 0)
    }
  ],
  [],
  [
    ['w','w','w','w','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','p','w'],
    ['w','f','f','f','f','p','w'],
    ['e','f','f','f','p','p','w'],
    ['w','e','w','w','w','w','w']
  ]),
  new Room("marshallsRoom", 0, 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("greenBedLeft"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("greenBedRight"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("ballDresser"),
      index: new Pair(1, 1)
    }
  ],
  [],
  [
    ['w','w','e','w','w','w'],
    ['w','f','f','f','f','w'],
    ['w','f','f','f','f','w'],
    ['e','f','f','f','f','e'],
    ['w','w','e','w','w','w']
  ]),
  new Room("minniesRoom", 0, 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("pinkBedLeft"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("pinkBedRight"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("teddy"),
      index: new Pair(4, 2)
    }
  ],
  [],
  [
    ['w','w','e','w','w','w'],
    ['w','f','f','f','f','w'],
    ['e','f','f','f','f','w'],
    ['w','f','f','f','f','w'],
    ['w','w','e','w','w','w']
  ]),
  new Room("maxwellsRoom", 0, 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("greenBedLeft"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("greenBedRight"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("monitor"),
      index: new Pair(1, 1)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w'],
    ['w','f','f','f','f','w'],
    ['w','f','f','f','f','w'],
    ['w','f','f','f','f','e'],
    ['w','e','w','w','w','w']
  ]),
  new Room("parentsRoom", 0, 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("orangeBedLeft"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("orangeBedRight"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("dresser"),
      index: new Pair(1, 1)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w'],
    ['w','f','f','f','f','w'],
    ['w','f','f','f','f','w'],
    ['e','f','f','f','f','e'],
    ['w','w','w','e','w','w']
  ]),
  //web entrance room f1
  new Room("webEntrance", 0, 4, [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("decor1"),
      index: new Pair(2, 2)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //other entrances
  new Room("entranceRoom", 0, 4, [0, 1], [
    {
      overlay: new TileOverlay("entrance"),
      index: new Pair(2, 2)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //exits
  new Room("exitRoom", 0, 4, [0], [
    {
      overlay: new TileOverlay("exit"),
      index: new Pair(2, 2)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //small size square empty room
  new Room("smallEmpty", 0, 2, [0], [
    {
      overlay: new TileOverlay("decor3"),
      index: new Pair(1, 1)
    },
    {
      overlay: new TileOverlay("decor1"),
      index: new Pair(2, 3)
    },
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //medium wide room
  new Room("mediumWideEmpty", 0, 2, [0], [
    {
      overlay: new TileOverlay("decor3"),
      index: new Pair(1, 1)
    },
    {
      overlay: new TileOverlay("blocker1"),
      index: new Pair(5, 2)
    },
    {
      overlay: new TileOverlay("decor2"),
      index: new Pair(2, 3)
    },
    {
      overlay: new TileOverlay("decor1"),
      index: new Pair(3, 2)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','f','f','f','f','f','w'],
    ['w','w','w','e','w','w','w']
  ]),
  //large vertical room
  new Room("largeTallEmpty", 0, 2, [0], [
    {
      overlay: new TileOverlay("decor2"),
      index: new Pair(5, 4)
    },
    {
      overlay: new TileOverlay("blocker2"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("decor3"),
      index: new Pair(7, 7)
    },
    {
      overlay: new TileOverlay("blocker3"),
      index: new Pair(3, 2)
    },
    {
      overlay: new TileOverlay("decor1"),
      index: new Pair(7, 1)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['w','f','f','f','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','f','f','f','w'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //basic 4 way junction
  new Room("4wayJunction", 0, 4, [], [
    {
      overlay: new TileOverlay("statue"),
      index: new Pair(2, 2)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //wide 2 way junction
  new Room("junction2", 0, 2, [], [
    {
      overlay: new TileOverlay("statue"),
      index: new Pair(3, 2)
    }
  ],
  [],
  [
    ['w','w','w','w','w','w','w'],
    ['w','w','f','w','f','w','w'],
    ['e','f','f','f','f','f','e'],
    ['w','w','f','w','f','w','w'],
    ['w','w','w','w','w','w','w']
  ]),
  //tall 2 way junction
  new Room("junction2", 0, 2, [], [
    {
      overlay: new TileOverlay("statue"),
      index: new Pair(2, 3)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['w','w','f','w','w'],
    ['w','f','f','f','w'],
    ['w','w','f','w','w'],
    ['w','f','f','f','w'],    
    ['w','w','e','w','w']
  ]),
  //small web filled room
  new Room("small", 0, 1, [0], [
    {
      overlay: new TileOverlay("decor1"),
      index: new Pair(1, 1)
    },
    {
      overlay: new TileOverlay("decor2"),
      index: new Pair(1, 2)
    },
    {
      overlay: new TileOverlay("decor3"),
      index: new Pair(1, 3)
    },
    {
      overlay: new TileOverlay("decor4"),
      index: new Pair(2, 1)
    },
    {
      overlay: new TileOverlay("decor3"),
      index: new Pair(2, 2)
    },
    {
      overlay: new TileOverlay("decor2"),
      index: new Pair(2, 3)
    },
    {
      overlay: new TileOverlay("decor4"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("decor1"),
      index: new Pair(3, 2)
    },
    {
      overlay: new TileOverlay("decor3"),
      index: new Pair(3, 3)
    }
  ],
  [],
  [
    ['w','w','e','w','w'],
    ['w','f','f','f','w'],
    ['e','f','f','f','e'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
  //small treasure room bottom entrance
  new Room("smallTreasure", 1, 1, [0], [
    {
      overlay: new TileOverlay("decor4"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("decor2"),
      index: new Pair(1, 3)
    },
  ],
  [
    {
      entity: "silverChest",
      index: new Pair(2, 1)
    }
  ],
  [
    ['w','w','w','w','w'],
    ['w','f','f','f','w'],
    ['w','f','f','f','w'],
    ['w','f','f','f','w'],
    ['w','w','e','w','w']
  ]),
]