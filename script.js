//script.js controls the high level flow of the game through function calls.

//MAIN LOOP
function update() {
  //increment epoch counter
  ec++;
  //update button count
  bc.update();
  //update tap control
  if(!landscape) {
    tapData.update();
  }
  //update game based on state
  //update clicking
  clicking = (tapData.realClick || et.getClick("left"));
  //update tutorial
  //state based function timeline
  switch(gameState) {
    case "homescreen":
      updateHomescreen();
      break;
    case "inGame":
      cs.fillAll(new Fill("#000000", 1));
      tutorial.update(player);
      updateCamera();
      currentTC.update();
      currentLevel.update();
      currentLevel.render();
      player.render();
      currentEC.update(false);
      updateHUD();
      currentEC.update(true);
      debug.revealAll()
      break;
    case "skillTree":
      updateSkillTree();
      break;
    case "inventory":
      updateInventory();
      break;
    case "effects":
      updateEffectsScreen();
      break;
    case "gameOver":
      updateFailscreen();
      break;
  }
}

//TIMER START
gt = new GameTimer(update, 16);
gt.start();

//EXTRA LISTENERS
document.addEventListener("wheel", updateZoom);