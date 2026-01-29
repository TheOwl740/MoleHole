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
  switch(gameState) {
    case "homescreen":
      updateHomescreen()
      break;
    case "inGame":
      cs.fillAll(new Fill("#000000", 1));
      updateCamera();
      currentTC.update();
      currentLevel.update();
      currentLevel.render();
      player.render();
      currentEC.update(false);
      updateHUD();
      currentEC.update(true);
      break;
    case "skillTree":
      updateSkillTree();
      break;
    case "gameOver":
      updateFailscreen();
      break;
  }
}

//TIMER START
gt = new GameTimer(update, 16);
gt.start();