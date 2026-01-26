//data.js contains all of the global data used by the game

//ENVIRONMENT INITIALIZATION
//engine tool constants
const cs = new Canvas(document.getElementById("canvas"));
const rt = new RenderTool(cs);
const et = new EventTracker(cs);
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
  holdTime: 0,
  dragging: false,
  dragStart: null,
  cameraStart: null,
  realClick: false,
  rct: 0,
  update: () => {
    if(!landscape) {
      if(et.getClick("left")) {
        tapData.realClick = false;
        tapData.rct = 0;
        tapData.holdTime++;
        if(tapData.holdTime > 5) {
          tapData.dragging = true;
          rt.camera = tapData.cameraStart.duplicate().subtract(et.cursor.duplicate().subtract(tapData.dragStart));
        } else if(tapData.holdTime < 2) {
          tapData.dragStart = et.cursor.duplicate();
          tapData.cameraStart = rt.camera.duplicate();
        }
      } else {
        if(tapData.holdTime < 10 && tapData.holdTime > 0 && !tapData.realClick) {
          tapData.realClick = true;
          tapData.rct = 0;
        } else if(tapData.realClick) {
          tapData.rct++;
        }
        if(tapData.rct > 10) {
          tapData.realClick = false;
        }
        tapData.dragStart = null;
        tapData.holdTime = 0;
        tapData.dragging = false;
      }
    }
  },
};
//hud button data
const buttonData = {
  stopWait: {
    transform: () => {return new Pair(cs.w - (cs.h / 32), cs.h / -32)},
    shape: new Rectangle(0, cs.h / 16, cs.h / 16),
    collider: () => {return new Collider(buttonData.stopWait.transform(), buttonData.stopWait.shape)}
  },
  skillTree: {
    transform: () => {return new Pair(cs.w - ((cs.h * 3) / 32), cs.h / -32)},
    shape: new Rectangle(0, cs.h / 16, cs.h / 16),
    collider: () => {return new Collider(buttonData.skillTree.transform(), buttonData.skillTree.shape)}
  },
  exit: {
    transform: () => {return new Pair(cs.w - (cs.h / 32), cs.h / -32)},
    shape: new Rectangle(0, cs.h / 16, cs.h / 16),
    collider: () => {return new Collider(buttonData.exit.transform(), buttonData.exit.shape)}
  },
  upgrade: {
    transforms: {
      speed: () => {return new Pair(cs.w / 8, (cs.h / -2) + (cs.h / 8))},
      attack: () => {return new Pair(cs.w - (cs.w / 8), (cs.h / -2) + (cs.h / 8))},
      health: () => {return new Pair(cs.w / 8, (cs.h / -2) - (cs.h / 8))},
      regen: () => {return new Pair(cs.w - (cs.w / 8), (cs.h / -2) - (cs.h / 8))},
    },
    shape: new Rectangle(0, cs.h / 8, cs.h / 16),
    collider: (transform) => {return new Collider(transform, buttonData.upgrade.shape)}
  },
  tutorial: {
    transform: () => {return new Pair(cs.w / 2, cs.h * -0.75)},
    shape: new Rectangle(0, cs.h / 4, cs.h / 12),
    collider: () => {return new Collider(buttonData.tutorial.transform(), buttonData.tutorial.shape)}
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
    if(dialogController.queued.length > 0) {
      dialogController.queued[0].render();
      if(et.getClick("left") && bc.ready()) {
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