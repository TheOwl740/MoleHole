//data.js contains all of the global data used by the game

//ENVIRONMENT INITIALIZATION
//engine tool constants
const cs = new Canvas(document.getElementById("canvas"));
const rt = new RenderTool(cs);
const et = new EventTracker(cs);
const tt = new TouchTracker(cs);
const tk = new Toolkit();
const hrt = new RenderTool(cs);
let gt;
//canvas initialization
cs.setDimensions(window.visualViewport?.width || window.innerWidth, window.visualViewport?.height || window.innerHeight);
cs.cx.imageSmoothingEnabled = false;
//browser limiters
et.tabEnabled = false;
et.rightClickEnabled = false;

//GLOBAL VARIABLES
//clicking bool
let clicking = false;
//freecam mode bool
let freecam = true;
//epoch counter (ticks since game start)
let ec = 0;
//current game state for script handling
let gameState = "homescreen";
//current level object or null when loading
let currentLevel = null;
//player object or null when loading
let player = null;
//turn controller object
let currentTC = null;
//pathfinding controller object
let currentPC = null;
//effect controller object
let currentEC = null;
//landscape bool for multiplatform rendering
const landscape = cs.w > cs.h;
//tilesize for rendering tiles
const tileSize = Math.floor(landscape ? cs.w / 15 : cs.h / 10);
//hud tile size for rendering hud elements
const hudTileSize = tileSize * 0.67;
//tile size rectangle for overlays
const tileShape = new Rectangle(0, tileSize, tileSize);

//ASSET LOADING
//font
const pixelFont = new FontFace('pixelFont', 'url(Assets/pixelFont.ttf)');
pixelFont.load().then((font) => {
  document.fonts.add(font);
});
//images
const images = {
  missingTexture: new Img(tk.generateImage("Assets/missingTexture.png"), 1, 0, 0, 0, tileSize, tileSize, false, false),
  hud: {
    player: new Img(tk.generateImage("Assets/HUD/player.png"), 1, 0, 0, 0, hudTileSize * 3, hudTileSize, false, false),
    stopWait: new Sprite(tk.generateImage("Assets/HUD/stopWait.png"), 1, 0, 0, 0, hudTileSize, hudTileSize, false, false, 32, 32),
    exit: new Img(tk.generateImage("Assets/HUD/exit.png"), 1, 0, 0, 0, hudTileSize, hudTileSize, false, false),
    speechBubble: new Sprite(tk.generateImage("Assets/HUD/speechBubble.png"), 1, 0, 0, 0, hudTileSize, hudTileSize, false, false, 32, 32),
    miniIcons: new Sprite(tk.generateImage("Assets/HUD/miniIcons.png"), 1, 1, 0, 0, hudTileSize / 4, hudTileSize / 4, false, false, 9, 9)
  },
  moles: {
    marshall: {
      body: new Sprite(tk.generateImage("Assets/Moles/Marshall/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    },
    minnie: {
      body: new Sprite(tk.generateImage("Assets/Moles/Minnie/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    },
    maxwell: {
      body: new Sprite(tk.generateImage("Assets/Moles/Maxwell/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    },
    madeline: {
      body: new Sprite(tk.generateImage("Assets/Moles/Madeline/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    },
    magnolia: {
      body: new Sprite(tk.generateImage("Assets/Moles/Magnolia/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    },
    michael: {
      body: new Sprite(tk.generateImage("Assets/Moles/Michael/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    }
  },
  enemies: {
    wigglyWorm: {
      body: new Sprite(tk.generateImage("Assets/Enemies/WigglyWorm/body.png"), 1, 0, 0, tileSize / 3, tileSize, tileSize, false, false, 32, 32)
    }
  },
  tilesets: {
    dirt: new Sprite(tk.generateImage("Assets/Tilesets/dirt.png"), 1, 0, 0, 0, tileSize, tileSize, false, false, 32, 32)
  },
  overlays: {
    moleHole: new Sprite(tk.generateImage("Assets/Overlays/moleHole.png"), 1, 0, 0, 0, tileSize, tileSize, false, false, 32, 32),
    buggyBurrows: new Sprite(tk.generateImage("Assets/Overlays/buggyBurrows.png"), 1, 0, 0, 0, tileSize, tileSize, false, false, 32, 32)
  }
}

//GLOBAL ARRAYS
//stores loaded levels
const levels = [];

//GLOBAL OBJECTS
//mobile drag controller
const tapData = {
  realClick: false,
  lifetime: 0,
  cameraStart: null,
  zoomStart: null,
  rcObj: null,
  update: () => {
    switch(tt.activeTouches.length) {
      case 0:
        //reset
        tapData.cameraStart = null;
        tapData.zoomStart = null;
        tapData.lastCount = 0;
        if(tapData.lifetime > 0) {
          tapData.lifetime = -2; 
        } else if(tapData.lifetime < 0) {
          tapData.lifetime++;
          tapData.realClick = true;
        } else {
          tapData.realClick = false;
          tapData.rcObj = null;
        }
        break;
      case 1:
        if(tapData.lastCount !== 2) {
          if(tt.activeTouches[0].getMovement().distToOrigin() < 5) {
            tapData.lifetime++;
          } else {
            tapData.lifetime = 0;
          }
          tapData.rcObj = tt.activeTouches[0];
          tapData.zoomStart = null;
          tapData.realClick = false;
          tapData.cameraStart = tapData.cameraStart ? tapData.cameraStart : rt.camera.duplicate();
          rt.camera = tk.pairMath(tapData.cameraStart, tt.activeTouches[0].getMovement().multiply(rt.zoom), "subtract");
          tapData.lastCount = 1;
        }
        break;
      case 2:
        tapData.lifetime = 0;
        tapData.realClick = false;
        if(gameState === "inGame") {
          if(tapData.lastCount === 1 || tapData.cameraStart === null) {
            tapData.cameraStart = rt.camera.duplicate();
          }
          tapData.zoomStart = tapData.zoomStart ? tapData.zoomStart : rt.zoom;
          rt.zoom = tapData.zoomStart + ((tk.pairMath(tt.activeTouches[0].sTransform, tt.activeTouches[1].sTransform, "distance") - tk.pairMath(tt.activeTouches[0].transform, tt.activeTouches[1].transform, "distance")) / -500);
          if(rt.zoom > 3) {
            rt.zoom = 3;
          } else if(rt.zoom < 1) {
            rt.zoom = 1;
          } else {
            rt.camera = tk.pairMath(tapData.cameraStart, new Pair((rt.zoom - tapData.zoomStart) * (cs.w / -2), (rt.zoom - tapData.zoomStart) * (cs.h / 2)), "add").subtract(tk.calcAveragePair([tt.activeTouches[0].getMovement(), tt.activeTouches[1].getMovement()]));  
          }
        }
        tapData.lastCount = 2;
        break;
    }
  }
};
//hud button data
const buttonData = {
  stopWait: {
    transform: () => {return new Pair(cs.w - (hudTileSize / 2), hudTileSize / -2)},
    shape: new Rectangle(0, hudTileSize, hudTileSize),
    collider: () => {return new Collider(buttonData.stopWait.transform(), buttonData.stopWait.shape)}
  },
  skillTree: {
    transform: () => {return new Pair(hudTileSize * 2.5, hudTileSize / -2)},
    shape: new Rectangle(0, hudTileSize, hudTileSize),
    collider: () => {return new Collider(buttonData.skillTree.transform(), buttonData.skillTree.shape)}
  },
  exit: {
    transform: () => {return new Pair(cs.w - (hudTileSize / 2), hudTileSize / -2)},
    shape: new Rectangle(0, hudTileSize, hudTileSize),
    collider: () => {return new Collider(buttonData.exit.transform(), buttonData.exit.shape)}
  }
};
//button count data
const bc = {
  time: 0,
  ready: () => {
    if(bc.time > 0) {
      return false;
    } else {
      bc.time = 50;
      return true;
    }
  },
  update: () => {
    if(bc.time > 0) {
      bc.time--;
    }
  }
};
//dialog data
const dialogController = {
  queued: [],
  update: () => {
    //update dialog
    if(dialogController.queued.length > 0) {
      //render dialog
      dialogController.queued[0].render();
      //update bubble
      images.hud.speechBubble.setActive(new Pair(dialogController.queued[0].isThought ? 1 : 0, 0));
      images.hud.speechBubble.y = Math.sin(ec / 20) * 3;
      //cycle
      if(clicking && bc.ready()) {
        dialogController.queued.shift();
      }
    }
  }
}
//tileschema for dialog boxes of different entities
const entityTS = {
  player: new TileScheme(hrt, new Fill("#1da7a9", 1), new Border("#199092", 1, 5, "bevel"), new Border("#22bbbd", 1, 3, "bevel"), new Fill("#000000", 1)),
  enemy: new TileScheme(hrt, new Fill("#a91d1d", 1), new Border("#921919", 1, 5, "bevel"), new Border("#bd2222", 1, 3, "bevel"), new Fill("#000000", 1)),
  npc: new TileScheme(hrt, new Fill("#3ba91d", 1), new Border("#259219", 1, 5, "bevel"), new Border("#32bd22", 1, 3, "bevel"), new Fill("#000000", 1)),
  nme: new TileScheme(hrt, new Fill("#a4a4a4", 1), new Border("#949494", 1, 5, "bevel"), new Border("#cfcfcf", 1, 3, "bevel"), new Fill("#000000", 1))
};
//debug options
const debug = {
  clearDialog: () => {
    dialogController.queued = [];
  },
  revealAll: () => {
    //reveal all tiles
    for(let ti = 0; ti < 2500; ti++) {
      currentLevel.map[Math.floor(ti / 50)][ti % 50].visible = true;
      currentLevel.map[Math.floor(ti / 50)][ti % 50].revealed = true;
    }
  },
  teleport: (targetTile) => {
    player.transform = targetTile.transform.duplicate();
    updateTERelationship(player.tile, player, targetTile);
  }
};