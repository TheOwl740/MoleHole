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
    //countdown until a new enemy spawns
    this.enemySpawnCountdown = 75;
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
    //floor sprites can be freely rotated
    this.sprite.r = tk.randomNum(0, 3) * 90;
    this.sprite.setActive(new Pair(tk.randomNum(0, 1), tk.randomNum(0, 1)));
    //entity bond point
    this.entity = null;
  }
}
//tile overlay
class TileOverlay {
  constructor(overlayType) {
    this.type = "tile overlay";
    this.overlayType = overlayType;
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
      case "entrance":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(0, 0));
        break;
      case "exit":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(1, 0));
        break;
      case "web1":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(0, 1));
        break;
      case "web2":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(1, 1));
        break;
      case "web3":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(0, 2));
        break;
      case "web4":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(1, 2));
        break;
      case "rockpile":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(0, 3));
        break;
      case "spiderStatue":
        this.sprite = images.overlays.buggyBurrows.duplicate();
        this.sprite.setActive(new Pair(1, 3));
        break;
      default:
        this.sprite = images.missingTexture.duplicate();
    }
  }
  attach(parentTile) {
    this.parentTile = parentTile;
    //designated walkable overlays
    this.parentTile.walkable = ["web1", "web2", "web3", "web4", "entrance", "exit", "couchLeft", "couchRight", "greenBedRight", "pinkBedRight", "orangeBedRight"].includes(this.overlayType);
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
    //assign zone
    if(this.levelId === 0) {
      this.zone = "The Mole Hill";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 1) {
      this.zone = "Buggy Burrows";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 5) {
      this.zone = "The Gnome Home";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 9) {
      this.zone = "Snakey Stronghold";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 13) {
      this.zone = "The Mustelid Mafia";
      this.tileset = images.tilesets.dirt;
    }
    //populate map with walls
    for(let i = 0; i < 50; i++) {
      this.map.push([]);
      for(let ii = 0; ii < 50; ii++) {
        this.map[i][ii] = new Wall(new Pair((i - 25) * (tileSize - 1), (ii - 25) * (tileSize - 1)), new Pair(i, ii), images.tilesets.dirt, this);
      }
    }
    //get set of rooms
    let activeRooms = [];
    let activeIds = [];
    let currentSelection = null;
    //first 5 required rooms
    while(activeRooms.length < 5) {
      currentSelection = tileMaps[tk.randomNum(0, tileMaps.length - 1)];
      if((!activeIds.includes(currentSelection.id)) && !currentSelection.blockedFloors.includes(this.levelId)) {
        activeRooms.push(currentSelection);
        activeIds.push(currentSelection.id);
      }
    }
    //entrance and exit rooms
    if(this.levelId !== 0) {
      while(!(activeIds.includes("entranceRoom") && activeIds.includes("exitRoom"))) {
        currentSelection = tileMaps[tk.randomNum(0, tileMaps.length - 1)];
        if((!activeIds.includes(currentSelection.id)) && !currentSelection.blockedFloors.includes(this.levelId)) {
          activeRooms.push(currentSelection);
          activeIds.push(currentSelection.id);
        }
      }
    }
    //additional spawn attempts for later levels
    for(let spawnAttempt = 0; spawnAttempt < this.levelId; spawnAttempt++) {
      currentSelection = tileMaps[tk.randomNum(0, tileMaps.length - 1)];
      if((!activeIds.includes(currentSelection.id)) && !currentSelection.blockedFloors.includes(this.levelId)) {
        activeRooms.push(currentSelection);
        activeIds.push(currentSelection.id);
      }
    }
    //place rooms randomly until all are open
    let activeIndices = [];
    let loopActive = true;
    let tolerance = 0;
    while(loopActive) {
      if(tolerance < 30) {
        tolerance += 0.01
      }
      loopActive = false;
      activeIndices = [];
      activeRooms.forEach((room) => {
        activeIndices.push(new Pair(tk.randomNum(2 + room.h, 17 + tolerance), tk.randomNum(2, (17 - room.w) + tolerance)));
      });
      for(let room = 0; room < activeRooms.length; room++) {
        for(let comparedRoom = 0; comparedRoom < activeRooms.length; comparedRoom++) {
          if(room !== comparedRoom) {
            if(tk.detectCollision(activeRooms[room].getIndexCollider(activeIndices[room]), activeRooms[comparedRoom].getIndexCollider(activeIndices[comparedRoom]))) {
              loopActive = true;
            }
          }
        }
      }
    }
    //stamp rooms and collect entrances and nonwalkables
    let entranceIndices = [];
    let eiImmuted = [];
    let nonwalkableIndices = [];
    for(let room = 0; room < activeRooms.length; room++) {
      let stampObj = activeRooms[room].stamp(this, activeIndices[room]);
      nonwalkableIndices = nonwalkableIndices.concat(stampObj.nonwalkableIndices);
      entranceIndices = entranceIndices.concat(stampObj.entranceIndices);
      eiImmuted = eiImmuted.concat(stampObj.entranceIndices);
    }
    //randomize entrance indices
    for(let i = 0; i < 10; i++) {
      entranceIndices.sort(() => {
        return tk.randomNum(-1, 1);
      });
    }
    //carve pathfinder
    let carvePather = new PathfindingController(this.map, false);
    //corridor junction points
    let junctionIndices = [];
    //take care of 75% of entrances
    while(entranceIndices.length > eiImmuted.length / 4) {
      //pick random entrances to bond
      let e1 = tk.randomNum(0, entranceIndices.length - 1);
      let e2 = tk.randomNum(0, entranceIndices.length - 1);
      if(e1 !== e2) {
        //cut the start point manually
        this.map[entranceIndices[e1].x][entranceIndices[e1].y] = new Floor(this.getIndex(entranceIndices[e1]).transform, entranceIndices[e1], this.tileset, this, null);
        //generate path to carve through
        let carvePath = carvePather.pathfind(entranceIndices[e1], entranceIndices[e2], nonwalkableIndices, 5000);
        //iterate over each index to carve
        for(let carveIndex = 0; carveIndex < carvePath.length; carveIndex++) {
          //carve index
          this.map[carvePath[carveIndex].x][carvePath[carveIndex].y] = new Floor(this.getIndex(carvePath[carveIndex]).transform, carvePath[carveIndex], this.tileset, this, null);
          //create junctions at midpoint of each path
          if(carveIndex === Math.floor(carvePath.length / 2)) {
            junctionIndices.push(carvePath[carveIndex]);
          }
        }
        //splice higher index first to avoid off by 1
        entranceIndices.splice(e1 < e2 ? e2 : e1, 1);
        entranceIndices.splice(e1 < e2 ? e1 : e2, 1);
      }
    }
    //while loop ensures that all rooms are connected by getting remaining entrances paired with junctions
    while(entranceIndices.length > 0) {
      //cut the start point manually
      this.map[entranceIndices[0].x][entranceIndices[0].y] = new Floor(this.getIndex(entranceIndices[0]).transform, entranceIndices[0], this.tileset, this, null);
      //carve out remaining entrances to junctions
      carvePather.pathfind(entranceIndices[0], junctionIndices[0], nonwalkableIndices, 5000).forEach((carveIndex) => {
        this.map[carveIndex.x][carveIndex.y] = new Floor(this.getIndex(carveIndex).transform, carveIndex, this.tileset, this, null);
      });
      //cut out entrance and cycle junctions
      entranceIndices.shift();
      junctionIndices.push(junctionIndices.shift());
    }
    //final while loop checks all immuted entrances to make sure all rooms are connected, using junctions
    let verified = false;
    while(!verified) {
      //join junction 0 and a random junction
      carvePather.pathfind(junctionIndices[0], junctionIndices[tk.randomNum(1, junctionIndices.length - 1)], nonwalkableIndices, 5000).forEach((carveIndex) => {
        this.map[carveIndex.x][carveIndex.y] = new Floor(this.getIndex(carveIndex).transform, carveIndex, this.tileset, this, null);
      });
      //cycle junction 0
      junctionIndices.push(junctionIndices.shift());
      //reassert verification
      verified = true;
      for(let e1 = 0; e1 < eiImmuted.length; e1++) {
        for(let e2 = 0; e2 < eiImmuted.length; e2++) {
          if(e1 !== e2) {
            if(carvePather.pathfind(eiImmuted[e1], eiImmuted[e2], this.getNonWalkables(this), 5000) === null) {
              verified = false;
            }
          }
        }
      }
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
            this.playerSpawn = this.getIndex(new Pair(activeIndices[room].y + 5, activeIndices[room].x - 1)).transform.duplicate();
            this.npcs.push(new Minnie(this.getIndex(new Pair(activeIndices[room].y + 3, activeIndices[room].x - 1)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 3, activeIndices[room].x - 1))))
          }
          if(activeRooms[room].id === "pitRoom") {
            this.npcs.push(new Michael(this.getIndex(new Pair(activeIndices[room].y + 4, activeIndices[room].x - 2)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 4, activeIndices[room].x - 2))))
            this.npcs.push(new Maxwell(this.getIndex(new Pair(activeIndices[room].y + 2, activeIndices[room].x - 4)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 2, activeIndices[room].x - 4))))
            this.npcs.push(new Magnolia(this.getIndex(new Pair(activeIndices[room].y + 3, activeIndices[room].x - 2)).transform.duplicate(), this.getIndex(new Pair(activeIndices[room].y + 3, activeIndices[room].x - 2))))
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
            this.playerSpawn = this.getIndex(new Pair(activeIndices[room].y + 2, activeIndices[room].x - 2)).transform.duplicate();
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
    for(let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].render();
    }
    for(let i = 0; i < this.npcs.length; i++) {
      this.npcs[i].render();
    }
    for(let i = 0; i < this.nmes.length; i++) {
      this.nmes[i].render();
    }
    for(let i = 0; i < this.items.length; i++) {
      this.items[i].render();
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
        currentTC.remove(this.enemies[i]);
        currentEC.add(new Death(this.enemies[i]));
        player.addXP(this.enemies[i].xpValue);
        this.enemySpawnCountdown -= 5;
        this.enemies[i].tile.entity = null;
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
          this.nmes[i].tile.entity = this.nmes[i].loot;
        } else {
          this.nmes[i].tile.entity = null;
        }
        this.nmes.splice(i, 1);
        i--;
      }
    }
    //remove deleted items
    for(let i = 0; i < this.items.length; i++) {
      if(this.items[i].deleteNow) {
        this.items[i].tile.entity = null;
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
        if(!(enemy.tile.index.isEqualTo(client.tile.index) || enemy.tile.index.isEqualTo(client.targetIndex))) {
          retList.push(enemy.tile.index.duplicate());
        }
      });
      //block targeting npcs unless they are target index (for interaction)
      this.npcs.forEach((npc) => {
        if(!(npc.tile.index.isEqualTo(client.tile.index) || npc.tile.index.isEqualTo(client.targetIndex))) {
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
    //get walls, pits, and non revealed tiles
    for(let ct = 0; ct < 2500; ct++) {
      let tObj = this.map[Math.floor(ct / 50)][ct % 50];
      if((!tObj.walkable) || (client.type === "player" && !tObj.revealed)) {
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
  constructor(w, h, id, entranceCount, blockedFloors, tileOverlays, entities, tileMap) {
    [this.w, this.h] = [w, h];
    this.id = id;
    this.entranceCount = entranceCount;
    this.blockedFloors = blockedFloors;
    this.tileOverlays = tileOverlays;
    this.entities = entities;
    this.tileMap = tileMap;
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
        let activeTile = level.map[tlIndex.y + i][tlIndex.x - ii];
        switch(this.tileMap[ii][i]) {
          case 'f':
            level.map[tlIndex.y + i][tlIndex.x - ii] = new Floor(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            break;
          case 'w':
            level.map[tlIndex.y + i][tlIndex.x - ii] = new Wall(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            break;
          case 'p':
            level.map[tlIndex.y + i][tlIndex.x - ii] = new Pit(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
            break;
          case 'e':
            level.map[tlIndex.y + i][tlIndex.x - ii] = new Wall(activeTile.transform.duplicate(), activeTile.index.duplicate(), tileset, level, null);
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
        let targetTile = level.map[tlIndex.y + overlayModule.index.x][tlIndex.x - overlayModule.index.y];
        targetTile.overlay = overlayModule.overlay;
      });
    }
    //add entities
    this.entities.forEach((entityModule) => {
      let targetTile = level.map[tlIndex.y + entityModule.index.x][tlIndex.x - entityModule.index.y];
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
  getIndexCollider(tlIndex) {
    return new Collider(tlIndex.duplicate().add(new Pair(this.w / 2, this.h / 2)), new Rectangle(0, this.w + 4, this.h + 4));
  }
}

const tileMaps = [
  new Room(8, 6, "pitRoom", 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
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
    ['w','w','w','w','w','w','w','w'],
    ['w','f','f','f','f','f','f','w'],
    ['w','f','f','f','f','p','p','w'],
    ['w','f','f','f','f','p','p','w'],
    ['e','f','f','f','f','f','p','w'],
    ['w','e','w','w','w','w','w','w']
  ]),
  new Room(7, 5, "marshallsRoom", 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("greenBedLeft"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("greenBedRight"),
      index: new Pair(5, 1)
    },
    {
      overlay: new TileOverlay("ballDresser"),
      index: new Pair(1, 1)
    }
  ],
  [],
  [
    ['w','w','e','w','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','w','e','w','w','w','w']
  ]),
  new Room(7, 5, "minniesRoom", 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("pinkBedLeft"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("pinkBedRight"),
      index: new Pair(5, 1)
    },
    {
      overlay: new TileOverlay("teddy"),
      index: new Pair(5, 2)
    }
  ],
  [],
  [
    ['w','w','e','w','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','w','e','w','w','e','w']
  ]),
  new Room(7, 5, "maxwellsRoom", 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("greenBedLeft"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("greenBedRight"),
      index: new Pair(5, 1)
    },
    {
      overlay: new TileOverlay("monitor"),
      index: new Pair(1, 1)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','e','w','w','w','e','w']
  ]),
  new Room(7, 5, "parentsRoom", 1, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("orangeBedLeft"),
      index: new Pair(4, 1)
    },
    {
      overlay: new TileOverlay("orangeBedRight"),
      index: new Pair(5, 1)
    },
    {
      overlay: new TileOverlay("dresser"),
      index: new Pair(1, 1)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','w','w','e','w','w','w']
  ]),
  new Room(5, 5, "entranceRoom", 2, [0, 1], [
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
  new Room(5, 5, "entranceRoom", 2, [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], [
    {
      overlay: new TileOverlay("web1"),
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
  new Room(5, 5, "exitRoom", 2, [0], [
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
  new Room(5, 5, "smallEmpty", 2, [0], [
    {
      overlay: new TileOverlay("web3"),
      index: new Pair(1, 1)
    },
    {
      overlay: new TileOverlay("web1"),
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
  new Room(7, 7, "mediumEmpty", 3, [0], [
    {
      overlay: new TileOverlay("web3"),
      index: new Pair(1, 1)
    },
    {
      overlay: new TileOverlay("rockpile"),
      index: new Pair(5, 2)
    },
    {
      overlay: new TileOverlay("web2"),
      index: new Pair(5, 4)
    },
    {
      overlay: new TileOverlay("web1"),
      index: new Pair(3, 2)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','w','w','e','w','w','w']
  ]),
  new Room(9, 9, "largeEmpty", 3, [0], [
    {
      overlay: new TileOverlay("web2"),
      index: new Pair(5, 4)
    },
    {
      overlay: new TileOverlay("rockpile"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("web3"),
      index: new Pair(7, 7)
    },
    {
      overlay: new TileOverlay("rockpile"),
      index: new Pair(3, 2)
    },
    {
      overlay: new TileOverlay("web1"),
      index: new Pair(7, 1)
    }
  ],
  [],
  [
    ['w','w','e','w','e','w','e','w','w'],
    ['w','f','f','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','f','f','e'],
    ['w','f','f','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','f','f','e'],
    ['w','f','f','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','f','f','e'],
    ['w','f','f','f','f','f','f','f','w'],
    ['w','w','e','w','e','w','e','w','w']
  ]),
  new Room(7, 7, "4wayJunction", 4, [0], [
    {
      overlay: new TileOverlay("spiderStatue"),
      index: new Pair(3, 3)
    }
  ],
  [],
  [
    ['w','w','w','e','w','w','w'],
    ['w','w','f','f','f','w','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','w','f','w','f','e'],
    ['w','f','f','f','f','f','w'],
    ['w','w','f','f','f','w','w'],
    ['w','w','w','e','w','w','w']
  ]),
  new Room(7, 7, "2wayJunction", 2, [0], [
    {
      overlay: new TileOverlay("spiderStatue"),
      index: new Pair(3, 3)
    }
  ],
  [],
  [
    ['w','w','w','w','w','w','w'],
    ['w','w','f','w','f','w','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','f','f','f','f','f','w'],
    ['w','w','f','w','f','w','w'],
    ['w','w','w','w','w','w','w']
  ]),
  new Room(5, 5, "smallWebRoom", 1, [0], [
    {
      overlay: new TileOverlay("web3"),
      index: new Pair(1, 1)
    },
    {
      overlay: new TileOverlay("web3"),
      index: new Pair(1, 2)
    },
    {
      overlay: new TileOverlay("web2"),
      index: new Pair(1, 3)
    },
    {
      overlay: new TileOverlay("web4"),
      index: new Pair(2, 1)
    },
    {
      overlay: new TileOverlay("web3"),
      index: new Pair(2, 2)
    },
    {
      overlay: new TileOverlay("web2"),
      index: new Pair(2, 3)
    },
    {
      overlay: new TileOverlay("web4"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("web2"),
      index: new Pair(3, 2)
    },
    {
      overlay: new TileOverlay("web1"),
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
  new Room(5, 5, "smallTreasure", 1, [0], [
    {
      overlay: new TileOverlay("web4"),
      index: new Pair(3, 1)
    },
    {
      overlay: new TileOverlay("web2"),
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