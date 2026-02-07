//functions.js contains all the functions used in other files.

//renders and updates button on homescreen
function updateHomescreen() {
  //reset cam
  rt.camera = new Pair(0, 0);
  rt.zoom = 1;
  //canvas clear
  cs.fillAll(new Fill("#783b0d", 1));
  //update mole animation
  let tempPlayer = new Player(new Pair(cs.w / 2, cs.h / -2));
  [tempPlayer.sprites.body.w, tempPlayer.sprites.body.h] = [tileSize * 3, tileSize * 3]; 
  //circle render
  hrt.renderCircle(new Pair(cs.w / 2, cs.h / -2), new Circle(((landscape ? cs.w : cs.h) / 2) * (((Math.sin(ec / 50) + 1) / 8) + 1)), new Fill("#301f04", (Math.sin(ec / 50) + 2) / 4), null);
  hrt.renderCircle(new Pair(cs.w / 2, cs.h / -2), new Circle(((landscape ? cs.w : cs.h) / 3) * (((Math.sin(ec / 25) + 1) / 8) + 1)), new Fill("#301f04", (Math.sin(ec / 25) + 2) / 4), null);
  //particle control
  if(menuEC) {
    if(tk.randomNum(0, 10) === 0) {
      menuEC.add(new ParticleEffect(new Pair(cs.w / 2, cs.h / -2), "omniDirectional", images.hud.miniIcons.duplicate().setActive(new Pair(0, 0)), tk.randomNum(1, 3), 1, landscape ? 75 : 150, true));
    }
    menuEC.update(true);
  } else {
    menuEC = new EffectController;
  }
  //player render
  tempPlayer.render();
  //text render
  hrt.renderText(new Pair(cs.w / 2, cs.h / -3), new TextNode("pixelFont", "MoleHole", 0, landscape ? cs.w / 30 : cs.h / 20, "center"), new Fill("#EEEEFF", 1));
  hrt.renderText(new Pair(cs.w / 2, (cs.h / -1.5) - (landscape ? cs.w / 40 : cs.h / 30)), new TextNode("pixelFont", `- ${landscape ? "click" : "tap"} anywhere to begin -`, 0, landscape ? cs.w / 50 : cs.h / 30, "center"), new Fill("#EEEEFF", 1));
  //game start
  if((et.getClick("left") || tapData.realClick) && bc.ready()) {
    loadLevel(0);
  }
}
//camera update for player and freecam
function updateCamera() {
  //in freecam mode
  if(freecam) {
    if(et.getKey("a")) {
      rt.camera.x -= 10 * rt.zoom;
    }
    if(et.getKey("d")) {
      rt.camera.x += 10 * rt.zoom;
    }
    if(et.getKey("w")) {
      rt.camera.y += 10 * rt.zoom;
    }
    if(et.getKey("s")) {
      rt.camera.y -= 10 * rt.zoom;
    }
    //in player locked mode
  } else {
    rt.zoom = 1;
    rt.camera = new Pair(player.transform.x - (cs.w / 2), player.transform.y + (cs.h / 2));
  }
}
//loads next level
function loadLevel(levelId) {
  //create new effect controller
  currentEC = new EffectController();
  //create new turn controller
  currentTC = new TurnController();
  //store past level
  if(currentLevel) {
    levels[currentLevel.levelId] = currentLevel;
  }
  //generate new level or return to old
  if(levels.length > levelId) {
    currentLevel = levels[levelId];
  } else {
    currentLevel = new Level(levelId);
  }
  //instantiate pathfinding controller on new level
  currentPC = new PathfindingController(currentLevel.map, true);
  //apply start transform to player
  player = new Player(currentLevel.playerSpawn.duplicate());
  updateTERelationship(null, player, currentLevel.getTile(currentLevel.playerSpawn));
  player.movePath = null;
  //initialize turn controller data
  currentTC.initialize();
  //lock camera to player
  rt.camera = new Pair(player.transform.x - (cs.w / 2), player.transform.y + (cs.h / 2));
  //shade first area
  currentLevel.reshade();
  //add levelEffect
  currentEC.add(new NewLevelEffect);
  //start game
  gameState = "inGame";
}
//renders healthbar of an object, provided it has a health and transform object attached
function renderHealthbar(targetObj, yOffset) {
  rt.renderRectangle(targetObj.transform.duplicate().add(new Pair(0, yOffset)), new Rectangle(0, tileSize * 0.75, tileSize * 0.2), new Fill("#d60000", 0.5), null);
  rt.renderRectangle(targetObj.transform.duplicate().add(new Pair(0, yOffset)), new Rectangle(0, tileSize * 0.7 * (targetObj.health.current / targetObj.health.max), tileSize * 0.175), new Fill("#16d700", 0.5), null)
}
//renders and updates hud overlay
function updateHUD() {
  //health fill
  hrt.renderRectangle(new Pair(hudTileSize * 1.5, hudTileSize * -0.5), new Rectangle(0, hudTileSize, hudTileSize), new Fill("#690000", 1), null);
  let healthRect = new Rectangle(0, hudTileSize, hudTileSize * (player.health.current / player.health.max))
  hrt.renderRectangle(new Pair(hudTileSize * 1.5, (healthRect.h / 2) - hudTileSize), healthRect, new Fill("#ff0707", 1), null);
  hrt.renderText(new Pair(hudTileSize * 1.5, hudTileSize * -0.5), new TextNode("pixelFont", `${player.health.current}/${player.health.max}`, 0, hudTileSize / 5, "center"), new Fill("#FFFFFF", 1));
  //xp fill
  hrt.renderRectangle(new Pair(hudTileSize * 2.5, hudTileSize * -0.5), new Rectangle(0, hudTileSize, hudTileSize), new Fill("#5e5300", 1), null);
  let xpRect = new Rectangle(0, hudTileSize, hudTileSize * (player.xp / 20))
  hrt.renderRectangle(new Pair(hudTileSize * 2.5, (xpRect.h / 2) - hudTileSize), xpRect, new Fill("#ffee00", 1), null);
  hrt.renderText(new Pair(hudTileSize * 2.5, hudTileSize * -0.5), new TextNode("pixelFont", `${player.xp}/20`, 0, hudTileSize / 5, "center"), new Fill("#FFFFFF", 1));
  //add small burst if sp available
  if(player.skillPoints > 0) {
    if(tk.randomNum(0, 100 / player.skillPoints) === 0) {
      currentEC.add(new ParticleEffect(new Pair(hudTileSize * 2.5, hudTileSize / -2), "omniDirectional", images.hud.miniIcons.duplicate().setActive(new Pair(0, 0)), 1, 0.2, 50, true));
    }
  }
  //player overlay
  hrt.renderImage(new Pair(hudTileSize * 1.5, hudTileSize * -0.5), images.hud.player);
  let playerIcon = player.sprites.body.duplicate();
  [playerIcon.w, playerIcon.h] = [hudTileSize, hudTileSize];
  playerIcon.setActive(player.sprites.body.activeTile);
  hrt.renderImage(new Pair(hudTileSize * 0.5, hudTileSize * -0.9), playerIcon);
  //stop/wait button
  images.hud.stopWait.setActive(new Pair(player.targetIndex ? 1 : 0, 0));
  hrt.renderImage(buttonData.stopWait.transform(), images.hud.stopWait);  
  //update dialogs
  dialogController.update();
  //stop (wait controlled in player runturn)
  if(player.targetIndex !== null && clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.stopWait.collider())) {
    player.targetIndex = null;
    player.path = null;
  }
  //skill tree access
  if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.skillTree.collider())) {
    gameState = "skillTree";
  }
  //effects screen access
  if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.effectsScreen.collider())) {
    gameState = "effects";
  }
  //inventory tree access
  if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.inventory.collider())) {
    gameState = "inventory";
  }
}
//renders fail screen
function updateFailscreen() {
  //reset
  player = null;
  currentLevel = null;
  currentEC = null;
  currentTC = null;
  currentPC = null;
  rt.camera = new Pair(0, 0);
  rt.zoom = 1;
  //canvas clear
  cs.fillAll(new Fill("#783b0d", 1));
  //rendering
  hrt.renderCircle(new Pair(cs.w / 2, cs.h / -2), new Circle(((landscape ? cs.w : cs.h) / 2) * (((Math.sin(ec / 50) + 1) / 8) + 1)), new Fill("#301f04", (Math.sin(ec / 50) + 2) / 4), null);
  hrt.renderCircle(new Pair(cs.w / 2, cs.h / -2), new Circle(((landscape ? cs.w : cs.h) / 3) * (((Math.sin(ec / 25) + 1) / 8) + 1)), new Fill("#301f04", (Math.sin(ec / 25) + 2) / 4), null);
  hrt.renderText(new Pair(cs.w / 2, cs.h / -2), new TextNode("pixelFont", "Game Over", 0, landscape ? cs.w / 40 : cs.h / 20, "center"), new Fill("#EEEEFF", 1));
  hrt.renderText(new Pair(cs.w / 2, (cs.h / -2) - (landscape ? cs.w / 40 : cs.h / 30)), new TextNode("pixelFont", `- ${landscape ? "click" : "tap"} anywhere for main menu -`, 0, landscape ? cs.w / 80 : cs.h / 40, "center"), new Fill("#EEEEFF", 1));
  //game start
  if(clicking && bc.ready()) {
    gameState = "homescreen";
  }
}
function updateSkillTree() {
  //clear canvas
  cs.fillAll(new Fill("#000000", 1));
  //exit button render
  hrt.renderImage(buttonData.exit.transform(), images.hud.exit);
  //exit button function
  if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.exit.collider())) {
    gameState = "inGame";
  }
  //main text and points
  hrt.renderText(new Pair(cs.w / 2, (landscape ? cs.w : cs.h) / -30), new TextNode("pixelFont", `-Upgrades: ${player.skillPoints}pts-`, 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#ffffff", 1));
}
function updateInventory() {
  //clear canvas
  cs.fillAll(new Fill("#000000", 1));
  //exit button render
  hrt.renderImage(buttonData.exit.transform(), images.hud.exit);
  //exit button function
  if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.exit.collider()) && bc.ready()) {
    gameState = "inGame";
    inventorySelection = null;
  }
  //main text and points
  hrt.renderText(new Pair(cs.w / 2, (landscape ? cs.w : cs.h) / -30), new TextNode("pixelFont", "-Inventory-", 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#ffffff", 1));
  //generate sorted inventory
  let playerInventory = [].concat(player.inventory);
  //sorted nodes contain quantity data
  let stackedInventory = [];
  //repeat until all inventory items processed
  while(playerInventory.length > 0) {
    let itemAdded = false;
    if(playerInventory[0].stackable) {
      stackedInventory.forEach((itemNode) => {
        if(itemNode.item.name === playerInventory[0].name) {
          itemNode.quantity++;
          itemAdded = true;
        }
      });
    }
    //add item if not stacked
    if(!itemAdded) {
      stackedInventory.push({quantity: 1, item: playerInventory[0]});
    }
    //remove processed item
    playerInventory.shift();
  }
  //sort stacks
  stackedInventory.sort((a, b) => {
    return a.item.name.localeCompare(b.item.name);
  });
  //find odd number of tiles which fit within w bound
  let hTileCount = Math.floor(cs.w / (tileSize * 1.2));
  hTileCount -= ((hTileCount % 2) - 1) * -1;
  //generate and render boxes
  let currentBox;
  let currentTransform;
  for(let i = 0; i < stackedInventory.length; i++) {
    //place in inventory
    currentTransform = new Pair(((i % hTileCount) - Math.floor(hTileCount / 2)) * tileSize * 1.2, Math.floor(i / hTileCount) * tileSize * -1.2).add(new Pair(cs.w / 2, tileSize * -4));
    currentBox = new BlankTile(tileschema.hud, currentTransform, new Pair(tileSize * 1.1, tileSize * 1.1));
    //render inventory tile
    currentBox.render();
    //render item
    hrt.renderImage(currentTransform, stackedInventory[i].item.sprite);
    //render quantity if > 1
    if(stackedInventory[i].quantity > 1) {
      hrt.renderText(new Pair(tileSize * 0.3, tileSize * -0.4).add(currentTransform), new TextNode("pixelFont", stackedInventory[i].quantity, 0, tileSize / 3, "left"), new Fill("#ffffff", 1));
    }
    //check for new selection
    if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, new Collider(currentTransform, new Rectangle(0, currentBox.dimensions.x, currentBox.dimensions.y))) && bc.ready()) {
      if(inventorySelection?.name === stackedInventory[i].item.name) {
        inventorySelection = null;
      } else {
        inventorySelection = stackedInventory[i].item;
      }
    }
    //highlight selection
    if(inventorySelection?.name === stackedInventory[i].item.name) {
      hrt.renderRectangle(currentTransform, new Rectangle(0, currentBox.dimensions.x, currentBox.dimensions.y), new Fill("#ffffff", 0.2), null);
    }
  }
  //if selected item, render
  if(inventorySelection) {
    //draw buttons and selection readout
    let dropBox = new BlankTile(tileschema.hud, new Pair((cs.w / 2) - (tileSize * 1.1), tileSize * -2.3), new Pair(tileSize * 2, tileSize * 0.75));
    let useBox = new BlankTile(tileschema.hud, new Pair((cs.w / 2) + (tileSize * 1.1), tileSize * -2.3), new Pair(tileSize * 2, tileSize * 0.75));
    dropBox.render();
    useBox.render();
    hrt.renderText(new Pair((cs.w / 2) - (tileSize * 1.1), tileSize * -2.3), new TextNode("pixelFont", "Drop", 0, tileSize / 2, "center"), new Fill("#ffffff", 1));
    hrt.renderText(new Pair((cs.w / 2) + (tileSize * 1.1), tileSize * -2.3), new TextNode("pixelFont", inventorySelection.useText, 0, tileSize / 2, "center"), new Fill("#ffffff", 1));
    hrt.renderText(new Pair(cs.w / 2, tileSize * -1.5), new TextNode("pixelFont", "Selected: " + inventorySelection.name, 0, tileSize / 3, "center"), new Fill("#ffffff", 1));
    //button activation
    if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, new Collider(dropBox.transform, new Rectangle(0, dropBox.dimensions.x, dropBox.dimensions.y))) && bc.ready()) {

    }
    if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, new Collider(useBox.transform, new Rectangle(0, useBox.dimensions.x, useBox.dimensions.y))) && bc.ready()) {
      gameState = "inGame";
      inventorySelection.activate();
      inventorySelection = null;
    }
  }
}
function updateEffectsScreen() {
  //clear canvas
  cs.fillAll(new Fill("#000000", 1));
  //exit button render
  hrt.renderImage(buttonData.exit.transform(), images.hud.exit);
  //exit button function
  if(clicking && tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, buttonData.exit.collider()) && bc.ready()) {
    gameState = "inGame";
  }
  //main text and points
  hrt.renderText(new Pair(cs.w / 2, (landscape ? cs.w : cs.h) / -30), new TextNode("pixelFont", "-Status Effects-", 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#ffffff", 1));
  //find odd number of tiles which fit within w bound
  let hTileCount = Math.floor(cs.w / (tileSize * 1.2));
  hTileCount -= ((hTileCount % 2) - 1) * -1;
  //generate and render boxes
  let currentBox;
  let currentTransform;
  let scaledIcon = null;
  for(let i = 0; i < player.effects.length; i++) {
    //place in inventory
    currentTransform = new Pair(((i % hTileCount) - Math.floor(hTileCount / 2)) * tileSize * 1.2, Math.floor(i / hTileCount) * tileSize * -1.2).add(new Pair(cs.w / 2, tileSize * -3));
    currentBox = new BlankTile(tileschema.hud, currentTransform, new Pair(tileSize * 1.1, tileSize * 1.1));
    //render inventory tile
    currentBox.render();
    //render item
    scaledIcon = player.effects[i].icon.duplicate();
    scaledIcon.w = tileSize / 2;
    scaledIcon.h = tileSize / 2;
    hrt.renderImage(currentTransform, scaledIcon);
    //check for new selection
    if(tk.detectCollision(tapData.realClick ? tapData.rcObj.transform : et.cursor, new Collider(currentTransform, new Rectangle(0, currentBox.dimensions.x, currentBox.dimensions.y)))) {
      hrt.renderText(new Pair(cs.w / 2, tileSize * -1.5), new TextNode("pixelFont", `${player.effects[i].effectType}: ${player.effects[i].remainingDuration} turn${player.effects[i].remainingDuration > 1 ? "s" : ""} remaining.`, 0, tileSize / 3, "center"), new Fill("#ffffff", 1));
    }
  }
}
//updates the relationship between entity and tile
function updateTERelationship(oldTile, entity, newTile) {
  if(oldTile) {
    oldTile.entity = null;
  }
  entity.tile = newTile;
  if(newTile) {
    newTile.entity = entity;
  }
}
//rotational translate for whole indices
function rotationalTile(index, angle, magnitude) {
  return currentLevel.getIndex((index.duplicate().add(tk.calcRotationalTranslate(angle, magnitude))).round(0));
}
//tile based raycast, blocked by nonwalkables.. 
function raycast(originIndex, targetIndex) {
  let angle = tk.pairMath(originIndex, targetIndex, "angle");
  for(let seg = 0; seg < Math.round(currentPC.heuristic(originIndex, targetIndex)); seg++) {
    let activeTile = rotationalTile(originIndex, angle, seg);
    if(activeTile.type === "wall" || (activeTile.type === "door" && activeTile.entity === null)) {
      return activeTile;
    }
  }
  return false;
}
//drills with random step algorithm
function drill(startTile, steps) {
  let activeIndex = startTile.index.duplicate();
  let activeLevel = startTile.parentLevel;
  for(let step = 0; step < steps; step++) {
    activeLevel.map[activeIndex.x][activeIndex.y] = new Floor(activeLevel.getIndex(activeIndex).transform.duplicate(), activeIndex.duplicate(), images.tilesets.dirt, activeLevel);
    activeIndex.add(new Pair(tk.randomNum(-1, 1), tk.randomNum(-1, 1)));
    if(activeIndex.x > 49 || activeIndex.y > 49 || activeIndex.x < 0 || activeIndex.y < 0) {
      activeIndex = startTile.index.duplicate();
    }
  }
}
//updates zoom on wheel event
function updateZoom(e) {
  if(gameState === "inGame" && freecam) {
    let zoomFactor = e.deltaY / 1000;
    if(zoomFactor > 0) {
      if(rt.zoom < 3) {
        rt.camera.add(new Pair(zoomFactor * (cs.w / -2), zoomFactor * (cs.h / 2)));
        rt.zoom += zoomFactor;
      } 
    } else {
      if(rt.zoom > 1) {
        rt.camera.add(new Pair(zoomFactor * (cs.w / -2), zoomFactor * (cs.h / 2)));
        rt.zoom += zoomFactor;
      }
    }
  }
}
document.addEventListener("wheel", updateZoom);