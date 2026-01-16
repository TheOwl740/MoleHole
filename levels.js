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
    }
  }
  attach(parentTile) {
    this.parentTile = parentTile;
    //designated walkable overlays
    this.parentTile.walkable = ["couchLeft", "couchRight", "greenBedRight", "pinkBedRight", "orangeBedRight"].includes(this.overlayType);
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
      this.tutorialStage = 0;
    } else if(this.levelId >= 4) {
      this.zone = "Buggy Burrows";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 8) {
      this.zone = "The Gnome Home";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 12) {
      this.zone = "Snakey Stronghold";
      this.tileset = images.tilesets.dirt;
    } else if(this.levelId >= 16) {
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
      if((!activeIds.includes(currentSelection.id)) && (currentSelection.usableFloors === "all" || currentSelection.usableFloors.includes(this.levelId))) {
        activeRooms.push(currentSelection);
        activeIds.push(currentSelection.id);
      }
    }
    //additional spawn attempts for later levels
    for(let spawnAttempt = 0; spawnAttempt < this.levelId; spawnAttempt++) {
      currentSelection = tileMaps[tk.randomNum(0, tileMaps.length - 1)];
      if((!activeIds.includes(currentSelection.id)) && (currentSelection.usableFloors === "all" || currentSelection.usableFloors.includes(this.levelId))) {
        activeRooms.push(currentSelection);
        activeIds.push(currentSelection.id);
      }
    }
    //place rooms randomly until all are open
    let activeIndices = [];
    let loopActive = true;
    while(loopActive) {
      loopActive = false;
      activeIndices = [];
      activeRooms.forEach((room) => {
        activeIndices.push(new Pair(tk.randomNum(2 + room.h, 49), tk.randomNum(0, 47 - room.w)));
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
    let nonwalkableIndices = [];
    for(let room = 0; room < activeRooms.length; room++) {
      let stampObj = activeRooms[room].stamp(this, activeIndices[room]);
      nonwalkableIndices = nonwalkableIndices.concat(stampObj.nonwalkableIndices);
      entranceIndices = entranceIndices.concat(stampObj.entranceIndices);
    }
    //carve corridors
    let carvePather = new PathfindingController(this.map, false);
    for(let e1 = 0; e1 < entranceIndices.length; e1++) {
      for(let e2 = 0; e2 < entranceIndices.length; e2++) {
        if(e1 !== e2) {
          carvePather.pathfind(entranceIndices[e1], entranceIndices[e2], nonwalkableIndices, 5000).forEach((carveIndex) => {
            this.map[carveIndex.x][carveIndex.y] = new Floor(this.getIndex(carveIndex).transform, carveIndex, this.tileset, this, null);
          });
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
    //set player spawn
    if(this.levelId === 0) {
      //place npcs
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
  update() {
    for(let i = 0; i < this.enemies.length; i++) {
      if(this.enemies[i].health.current < 1) {
        currentTC.remove(this.enemies[i]);
        currentEC.add(Death(this.enemies[i]));
        player.addXP(this.enemies[i].xpValue);
        this.enemies[i].tile.entity = null;
        this.enemies.splice(i, 1);
        i--;
      }
    }
    for(let i = 0; i < this.npcs.length; i++) {
      if(this.npcs[i].health.current < 1) {
        currentTC.remove(this.npcs[i]);
        currentEC.add(new Death(this.npcs[i]));
        this.enemies[i].tile.entity = null;
        this.enemies.splice(i, 1);
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
      this.enemies.forEach((enemy) => {
        if(!(enemy.tile.index.isEqualTo(client.tile.index) || enemy.tile.index.isEqualTo(client.targetIndex))) {
          retList.push(enemy.tile.index.duplicate());
        }
      });
      this.npcs.forEach((npc) => {
        if(!(npc.tile.index.isEqualTo(client.tile.index) || npc.tile.index.isEqualTo(client.targetIndex))) {
          retList.push(npc.tile.index.duplicate());
        }
      });
      if(!(client.type === "player" || player.tile.index.isEqualTo(client.targetIndex))) {
        retList.push(player.tile.index.duplicate());
      }
    }
    //get walls
    for(let ct = 0; ct < 2500; ct++) {
      let tObj = this.map[Math.floor(ct / 50)][ct % 50];
      if(!tObj.walkable) {
        retList.push(tObj.index);
      }
    }
    return retList;
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
  constructor(w, h, id, entranceCount, usableFloors, tileOverlays, tileMap) {
    [this.w, this.h] = [w, h];
    this.id = id;
    this.entranceCount = entranceCount;
    this.usableFloors = usableFloors;
    this.tileOverlays = tileOverlays;
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
    return new Collider(tlIndex.duplicate().add(new Pair(((this.w / 2) + 1), (this.w / 2) + 1)), new Rectangle(0, this.w + 2, this.h + 2));
  }
}

const tileMaps = [
  new Room(8, 6, "pitRoom", 2, [0], [
    {
      overlay: new TileOverlay("couchLeft"),
      index: new Pair(2, 2)
    },
    {
      overlay: new TileOverlay("couchRight"),
      index: new Pair(3, 2)
    }
  ], [
    ['w','e','w','w','w','w','e','w'],
    ['w','f','f','f','f','f','f','w'],
    ['w','f','f','f','f','p','p','w'],
    ['w','f','f','f','f','p','p','w'],
    ['w','f','f','f','f','f','f','w'],
    ['w','e','w','w','w','w','e','w']
  ]),
  new Room(7, 5, "marshallsRoom", 1, [0], [
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
  ], [
    ['w','w','e','w','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','w','e','w','w','w','w']
  ]),
  new Room(7, 5, "minniesRoom", 1, [0], [
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
  ], [
    ['w','w','e','w','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','w','e','w','w','e','w']
  ]),
  new Room(7, 5, "maxwellsRoom", 1, [0], [
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
  ], [
    ['w','w','w','e','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['w','e','w','w','w','e','w']
  ]),
  new Room(7, 5, "parentsRoom", 1, [0], [
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
  ], [
    ['w','w','w','e','w','w','w'],
    ['w','f','f','f','f','f','w'],
    ['w','f','f','f','f','f','w'],
    ['e','f','f','f','f','f','e'],
    ['w','w','w','e','w','w','w']
  ])
]