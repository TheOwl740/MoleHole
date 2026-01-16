//entities.js contains all classes related to entities, including the player, npcs, nmes, and enemies.

//PLAYER
//player class controls normal entity things as well as xp.
class Player {
  constructor(transform) {
    //same type and eType
    this.type = "player";
    this.eType = "player"
    //location data
    this.transform = transform;
    this.tile;
    //current path
    this.movePath = null;
    //current target tile/entity's index
    this.targetIndex = null;
    //first turn
    this.nextTurn = 0;
    //time to move one tile
    this.moveTime = 1;
    //current xp
    this.xp = 0;
    //current skill points
    this.skillPoints = 0;
    //last tile position index for targeting
    this.lastPosition;
    //boolean representing if a multi tile force move is enabled
    this.forceMove = false;
    //current weapon slot
    this.weapon = null;
    //sprite data
    this.leftFacing = true;
    this.sprites = {
      body: images.moles.marshall.body.duplicate()
    }
    //animation data
    this.animation = {
      state: "idle",
      deltaTime: 0,
      frame: 0
    }
    //melee data
    this.melee = {
      time: 1,
      damage: 7
    };
    //health and regen data
    this.health = {
      current: 20,
      max: 20,
      regenTime: 10,
      regenMax: 10,
      regenPoints: 0
    }
    //creates a tile entity relationship if placed in the context of a level
    if(currentLevel !== null) {
      updateTERelationship(null, this, currentLevel.getTile(transform));
    }
  }
  render() {
    //animation frame update
    this.animation.deltaTime += gt.deltaTime;
    if(this.animation.state === "idle") {
      if(this.animation.deltaTime > 0.2) {
        this.animation.deltaTime = 0;
        switch(this.animation.frame) {
          case 0:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(0, 0));
            break;
          case 1:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(1, 0));
            break;
          case 2:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(0, 1));
            break;
          case 3:
            this.animation.frame = 0;
            this.sprites.body.setActive(new Pair(1, 0));
            break;
          default:
            this.animation.frame = 0;
            this.sprites.body.setActive(new Pair(2, 1));
        }
      }
    } else if(this.animation.state === "move") {
      if(this.animation.deltaTime > 0.1) {
        this.animation.deltaTime = 0;
        switch(this.animation.frame) {
          case 0:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(0, 2));
            break;
          case 1:
            this.animation.frame = 0;
            this.sprites.body.setActive(new Pair(1, 2));
            break;
          default:
            this.animation.frame = 0;
            this.sprites.body.setActive(new Pair(1, 2));
        }
      }
    } else if(this.animation.state === "jump") {
      this.sprites.body.setActive(new Pair(1, 1));
    } else if(this.animation.state === "attack") {
      if(this.animation.deltaTime > 0.2) {
        this.animation.deltaTime = 0;
        switch(this.animation.frame) {
          case 0:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(0, 0));
            break;
          case 1:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(0, 3));
            break;
          case 2:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(1, 3));
            break;
          case 3:
            this.animation.frame++;
            this.sprites.body.setActive(new Pair(0, 0));
        }
      } 
    }
    //update direction
    this.sprites.body.hf = this.leftFacing;
    //image render
    rt.renderImage(this.transform, this.sprites.body);
  }
  runTurn() {
    //set last position
    this.lastPosition = this.tile.index;
    //wait action
    if(this.targetIndex === null && ((et.getKey("z") || (tk.detectCollision(et.cursor, buttonData.stopWait.collider()) && (landscape ? et.getClick("left") : tapData.realClick))) && bc.ready())) {
      return new Wait(this);
    }
    //check if at target
    if(this.targetIndex?.isEqualTo(this.tile.index)) {
      this.targetIndex = null;
      this.movePath = null;
      this.forceMove = false;
    }
    //check for new enemies in sight
    let visibleEnemies = false;
    currentLevel.enemies.forEach((enemy) => {
      if((!raycast(this.tile.index, enemy.tile.index)) && enemy.tile.visible) {
        if(this.movePath !== null && !this.forceMove) {
          this.targetIndex = this.movePath[0];
        }
        visibleEnemies = true;
      }
    });
    //if there is no target and there is a targeting click
    if(this.targetIndex === null && (landscape ? et.getClick("left") : tapData.realClick) && bc.ready()) {
      //get tile at click
      let clickedTile = currentLevel.getTile(et.dCursor(rt));
      //if valid tile
      if(clickedTile?.type !== "wall" && clickedTile?.revealed) {
        this.targetIndex = clickedTile.index;
        this.forceMove = visibleEnemies;
      }
    //if there is a target
    } else if(this.targetIndex !== null) {
      //update movepath
      this.updatePath();
      if(this.movePath === null) {
        this.targetIndex = null;
        this.forceMove = false;
        return null;
      }
      //check against enemies
      for(let i = 0; i < currentLevel.enemies.length; i++) {
        if(currentLevel.enemies[i].tile.index.isEqualTo(this.movePath[0])) {
          this.targetIndex = null;
          return new Melee(this, currentLevel.enemies[i]);
        }
      }
      //check against npcs
      for(let i = 0; i < currentLevel.npcs.length; i++) {
        if(currentLevel.npcs[i].tile.index.isEqualTo(this.movePath[0])) {
          this.targetIndex = null;
          return new Interaction(this, currentLevel.npcs[i])
        }
      }
      //move if no attacks
      return new Movement(this, currentLevel.getIndex(this.movePath[0]));
    }
    return null;
  }
  //runs once each real turn. deals with regen here
  turnPing() {
    this.health.regenPoints -= this.health.regenPoints > 0 ? 1 : 0;
    this.health.regenTime -= this.health.regenTime > 0 ? 1 : 0;
    if(this.health.regenTime <= 0 && this.health.current < this.health.max && this.health.regenPoints > 0) {
      this.health.current++;
      this.health.regenTime = this.health.regenMax;
    }
  }
  //gets melee damage for an attack
  getMelee() {
    let baseDamage = this.melee.damage + (this.weapon === null ? 0 : this.weapon.damage);
    return tk.randomNum(Math.floor(baseDamage * 0.6), Math.floor(baseDamage * 1.4));
  }
  //takes damage to the player
  damage(attackAction) {
    this.health.current -= attackAction.damage;
    this.targetIndex = null;
    this.movePath = null;
    this.forceMove = false;
    if(this.health.current < 1) {
      gameState = "gameOver";
    }
  }
  //adds xp and deals with skill points as needed
  addXP(count) {
    this.xp += count;
    this.health.regenPoints += count * 10;
    let points = Math.floor(this.xp / 20)
    if(points > 0) {
      currentEC.add(new SPEffect(points));
      this.skillPoints += points;
      this.xp -= points * 20;
    } else {
      currentEC.add(new XPEffect(count));
    }
  }
  //updates movement path
  updatePath() {
    this.movePath = currentPC.pathfind(this.tile.index, this.targetIndex, currentLevel.getNonWalkables(this), 2000);
  }
}

//NPCS
//general NPC class template
class NPC {
  constructor(transform, tile, spriteLocation) {
    this.eType = "npc"
    //location data
    this.transform = transform;
    this.tile = tile;
    this.parentLevel = tile.parentLevel;
    //assign tile
    updateTERelationship(null, this, this.tile);
    //sprite data
    this.sprites = {
      body: spriteLocation.body.duplicate(),
    };
    this.leftFacing = true;
    //animation data
    this.animation = {
      state: "idle",
      deltaTime: 0,
      frame: 0
    };
    //next turn time randomized
    this.nextTurn = tk.randomNum(0, 1000) / 1000;
    //ai state
    this.state = "idle";
    //ai pathing target
    this.targetIndex = null;
    //ai path
    this.path = null;
    //subclass specific
    this.type;
    //time elapsed by one tile movement
    this.moveTime;
    //weapon slot
    this.weapon;
    //health data
    this.health = {
      current: 0,
      max: 0,
      regenTime: 0,
      regenMax: 0,
      regenPoints: 0
    };
    //base melee data
    this.melee = {
      time: 0,
      damage: 0
    };
  }
  //recieves damage from an attack action
  damage(attackAction) {
    this.health.current -= attackAction.damage;
  }
  //returns melee damage based on melee and weapon
  getMelee() {
    let baseDamage = this.melee.damage + (this.weapon === null ? 0 : this.weapon.damage);
    return tk.randomNum(Math.floor(baseDamage * 0.6), Math.floor(baseDamage * 1.4));
  }
  //creates a dialog when an npc is interacted with
  getInteraction() {
  }
  //renders the sprite, healthbar, and hand if applicable
  render() {
    if(this.tile.visible) {
      //animation frame update
      this.animation.deltaTime += gt.deltaTime;
      if(this.animation.state === "idle") {
        if(this.animation.deltaTime > 0.2) {
          this.animation.deltaTime = 0;
          switch(this.animation.frame) {
            case 0:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 0));
              break;
            case 1:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(1, 0));
              break;
            case 2:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 1));
              break;
            case 3:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(1, 0));
              break;
            default:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(2, 1));
          }
        }
      } else if(this.animation.state === "move") {
        if(this.animation.deltaTime > 0.1) {
          this.animation.deltaTime = 0;
          switch(this.animation.frame) {
            case 0:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 2));
              break;
            case 1:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(1, 2));
              break;
            default:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(1, 2));
          }
        }
      } else if(this.animation.state === "jump") {
        this.sprites.body.setActive(new Pair(1, 1));
      } else if(this.animation.state === "attack") {
        if(this.animation.deltaTime > 0.2) {
          this.animation.deltaTime = 0;
          switch(this.animation.frame) {
            case 0:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 0));
              break;
            case 1:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 3));
              break;
            case 2:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(1, 3));
              break;
            case 3:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 0));
          }
        } 
      }
      //renders health bar
      if(this.health.current < this.health.max) {
        renderHealthbar(this, tileSize);
      }
      //body facing update and render
      this.sprites.body.hf = this.leftFacing;
      rt.renderImage(this.transform, this.sprites.body);
      //hand facing update and render if applicabb;e
      if(this.sprites.hand) {
        this.sprites.hand.hf = this.leftFacing;
        rt.renderImage(this.transform, this.sprite.hand)
      }
    }
  }
  //fires each real turn
  turnPing() {

  }
  //ai logic
  runTurn() {

  }
  //updates the path to the current target
  updatePath() {
    this.path = currentPC.pathfind(this.tile.index, this.targetIndex, this.parentLevel.getNonWalkables(this), 2000);
  }
}
class Michael extends NPC {
  constructor(transform, tile) {
    super(transform, tile, images.moles.michael);
    this.type = "michael mole";
    //time elapsed by one tile movement
    this.moveTime = 1;
    //weapon slot
    this.weapon = null;
    //run turn before marshall
    this.nextTurn = 0.1;
    //health data
    this.health = {
      current: 10,
      max: 10,
      regenTime: 0,
      regenMax: 0,
      regenPoints: 0
    };
    //base melee data
    this.melee = {
      time: 1,
      damage: 1
    };
  }
  //custom interactions
  getInteraction() {
    
  }
  runTurn() {
    switch(this.parentLevel.tutorialStage) {
      case 3:
        if(tk.pairMath(this.tile.index, player.tile.index, "distance") < 3) {
          dialogController.queued.push(new Dialog(this, "Hello Marshall! I'm happy to see that you are finally up."));
          dialogController.queued.push(new Dialog(this, "I am sure you certainly had quite the adventure last night."));
          dialogController.queued.push(new Dialog(player, "*What does he mean? Last night I was up trying to beat my personal record on Molesweeper.*"));
          dialogController.queued.push(new Dialog(player, "What I was doing last night?"));
          dialogController.queued.push(new Dialog(this, "Yes, what were you doing last night Marshall?"));
          dialogController.queued.push(new Dialog(this, "I certainly hope it doesn't involve stealing rations from the family..."));
          dialogController.queued.push(new Dialog(player, "Stealing? Why would I steal the rations?"));
          dialogController.queued.push(new Dialog(this, "We all know you are a growing boy Marshall!"));
          dialogController.queued.push(new Dialog(this, "Are you sure you weren't a little hungry after dinner and decided to take a little more?"));
          dialogController.queued.push(new Dialog(player, "Of course not, I would never."));
          dialogController.queued.push(new Dialog(this, "I certainly hope not. You know what happens to those who steal rations..."));
          this.parentLevel.tutorialStage++;
        }
        return new Wait(this);
      default:
        return new Wait(this);
    }
  }
}
class Minnie extends NPC {
  constructor(transform, tile) {
    super(transform, tile, images.moles.minnie);
    this.type = "minnie mole";
    //time elapsed by one tile movement
    this.moveTime = 1;
    //weapon slot
    this.weapon = null;
    //run turn before marshall
    this.nextTurn = -0.1;
    //health data
    this.health = {
      current: 10,
      max: 10,
      regenTime: 0,
      regenMax: 0,
      regenPoints: 0
    };
    //base melee data
    this.melee = {
      time: 1,
      damage: 1
    };
    //pit room index for nav
    for(let i = 0; i < 50; i++) {
      for(let ii = 0; ii < 50; ii++) {
        if(this.parentLevel.getIndex(new Pair(i, ii)).overlay?.overlayType === "couchLeft") {
          this.pitRoomIndex = new Pair(i, ii);
        }
      }
    }
  }
  //custom interactions
  getInteraction() {
    switch(this.parentLevel.tutorialStage) {
      case 1:
        dialogController.queued.push(new Dialog(this, "Dad has asked me to wake you for an emergency family meeting."));
        dialogController.queued.push(new Dialog(this, "Get ready and meet us in the family mole room. QUICK!"));
        dialogController.queued.push(new Dialog(player, "*Click on tiles to explore. Try to find the family room!*"));
        this.parentLevel.tutorialStage++;
    }
  }
  runTurn() {
    switch(this.parentLevel.tutorialStage) {
      case 0:
        dialogController.queued.push(new Dialog(this, "... marshall... MARSHALL!"));
        dialogController.queued.push(new Dialog(player, "... Nnnggh... Huh?"));
        dialogController.queued.push(new Dialog(this, "Marshall, you need to get out of bed quickly!"));
        dialogController.queued.push(new Dialog(player, "*Click on Minnie to go talk to her*"));
        this.parentLevel.tutorialStage++;
        return new Wait(this);
      case 2:
        this.targetIndex = this.pitRoomIndex;
        this.updatePath();
        if(this.tile.index.isEqualTo(this.targetIndex)) {
          this.parentLevel.tutorialStage++;
        } else if(this.path) {
          return new Movement(this, this.parentLevel.getIndex(this.path[0]));        
        }
      default:
        return new Wait(this);
    }
  }
}
class Maxwell extends NPC {
  constructor(transform, tile) {
    super(transform, tile, images.moles.maxwell);
    this.type = "maxwell mole";
    //time elapsed by one tile movement
    this.moveTime = 1;
    //weapon slot
    this.weapon = null;
    //run turn before marshall
    this.nextTurn = 0.2;
    //health data
    this.health = {
      current: 10,
      max: 10,
      regenTime: 0,
      regenMax: 0,
      regenPoints: 0
    };
    //base melee data
    this.melee = {
      time: 1,
      damage: 1
    };
  }
  runTurn() {
    return new Wait(this);
  }
}
class Magnolia extends NPC {
  constructor(transform, tile) {
    super(transform, tile, images.moles.magnolia);
    this.type = "magnolia mole";
    //time elapsed by one tile movement
    this.moveTime = 1;
    //weapon slot
    this.weapon = null;
    //run turn before marshall
    this.nextTurn = 0.3;
    //faces her husband
    this.leftFacing = false;
    //health data
    this.health = {
      current: 10,
      max: 10,
      regenTime: 0,
      regenMax: 0,
      regenPoints: 0
    };
    //base melee data
    this.melee = {
      time: 1,
      damage: 1
    };
  }
  runTurn() {
    return new Wait(this);
  }
}

//NMES
//general non moving entity class template

//ENEMIES
//general enemy class template
class Enemy {
  constructor(transform, tile, spriteLocation) {
    //entity type
    this.eType = "enemy"
    //location data
    this.transform = transform;
    this.tile = tile;
    this.parentLevel = tile.parentLevel;
    //assign tile
    updateTERelationship(null, this, this.tile);
    //sprite data
    this.sprites = {
      body: spriteLocation.body.duplicate(),
    };
    //animation data
    this.animation = {
      state: "idle",
      deltaTime: 0,
      frame: 0
    }
    this.leftFacing = true;
    //next turn time randomized
    this.nextTurn = tk.randomNum(0, 1000) / 1000;
    //ai state
    this.state = "sleeping";
    //ai pathing target
    this.targetIndex = null;
    //ai path
    this.path = null;
    //total turns spent chasing player after out of sight
    this.chaseTime = 0;
    //subclass specific
    this.type;
    //time elapsed by one tile movement
    this.moveTime;
    //kill value
    this.xpValue;
    //weapon slot
    this.weapon;
    //health data
    this.health = {
      current: 0,
      max: 0,
      regenTime: 0,
      regenMax: 0,
      regenPoints: 0
    };
    //base melee data
    this.melee = {
      time: 0,
      damage: 0
    };
  }
  //recieves damage from an attack action
  damage(attackAction) {
    this.health.current -= attackAction.damage;
  }
  //returns melee damage based on melee and weapon
  getMelee() {
    let baseDamage = this.melee.damage + (this.weapon === null ? 0 : this.weapon.damage);
    return tk.randomNum(Math.floor(baseDamage * 0.6), Math.floor(baseDamage * 1.4));
  }
  //renders the sprite, healthbar, and hand if applicable
  render() {
    if(this.tile.visible) {
      //animation frame update
      this.animation.deltaTime += gt.deltaTime;
      if(this.animation.state === "idle") {
        if(this.animation.deltaTime > 0.2) {
          this.animation.deltaTime = 0;
          switch(this.animation.frame) {
            case 0:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 0));
              break;
            case 1:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(1, 0));
              break;
            case 2:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 1));
              break;
            case 3:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(1, 0));
              break;
            default:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(2, 1));
          }
        }
      } else if(this.animation.state === "move") {
        if(this.animation.deltaTime > 0.1) {
          this.animation.deltaTime = 0;
          switch(this.animation.frame) {
            case 0:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 2));
              break;
            case 1:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(1, 2));
              break;
            default:
              this.animation.frame = 0;
              this.sprites.body.setActive(new Pair(1, 2));
          }
        }
      } else if(this.animation.state === "jump") {
        this.sprites.body.setActive(new Pair(1, 1));
      } else if(this.animation.state === "attack") {
        if(this.animation.deltaTime > 0.2) {
          this.animation.deltaTime = 0;
          switch(this.animation.frame) {
            case 0:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 0));
              break;
            case 1:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 3));
              break;
            case 2:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(1, 3));
              break;
            case 3:
              this.animation.frame++;
              this.sprites.body.setActive(new Pair(0, 0));
          }
        } 
      }
      //renders health bar
      if(this.health.current < this.health.max) {
        renderHealthbar(this, tileSize);
      }
      //body facing update and render
      this.sprites.body.hf = this.leftFacing;
      rt.renderImage(this.transform, this.sprite.body);
      //hand facing update and render if applicabb;e
      if(this.sprite.hand) {
        this.sprites.hand.hf = this.leftFacing;
        rt.renderImage(this.transform, this.sprite.hand)
      }
    }
  }
  //fires each real turn
  turnPing() {

  }
  //basic ai logic
  runTurn() {
    this.playerLock = !raycast(this.tile.index, player.tile.index);
    let heuristicToPlayer = currentPC.heuristic(player.tile.index, this.tile.index);
    switch(this.state) {
      case "sleeping":
        //if sleeping, attempt to break out
        if(tk.randomNum(0, heuristicToPlayer) < 2) {
          this.state = "wandering";
        }
        //send wait
        return new Wait(this);
      case "wandering":
        //open attack if close; will run to next switch
        if(heuristicToPlayer <= this.parentLevel.visionRange && this.playerLock) {
          this.state = "attacking";
          this.targetIndex = null;
          this.path = null;
        } else {          
          //attempt to choose new location if no target
          if(this.targetIndex === null) {
            let newTarget = this.parentLevel.getIndex(new Pair(this.tile.index.x + tk.randomNum(-10, 10), this.tile.index.y + tk.randomNum(-10, 10)));
            //if valid target selected, assign
            if(newTarget !== null && newTarget.type === "floor") {
              this.targetIndex = newTarget.index;
            //if no valid target, wait
            } else {
              return new Wait(this);
            }
          } else {
            //if target reached, wait and reset
            if(this.tile.index.isEqualTo(this.targetIndex)) {
              this.targetIndex = null;
              this.path = null;
              return new Wait(this);
            }
            //update pathing before move
            this.updatePath();
            if(this.path === null) {
              this.targetIndex = null;
              return null;
            }         
            //move if target and path valid
            return new Movement(this, this.parentLevel.getIndex(this.path[0]));
          }
        }
        //return null if state change to attack and as backup
        return null;
      case "attacking":
        //wait and reset if target out of range
        if(heuristicToPlayer > this.parentLevel.visionRange || !this.playerLock) {
          this.state = "chasing";
          this.targetIndex = player.lastPosition;
          this.updatePath();
          this.chaseTime = 0;
          return new Wait(this);
        } else {
          //retarget
          this.targetIndex = player.lastPosition;
          this.updatePath();
          if(this.path === null) {
            this.targetIndex = null;
            return null;
          }          
          //attack if close
          if(heuristicToPlayer < 2) {
            return new Melee(this, player);
          //move closer otherwise
          } else {
            return new Movement(this, this.parentLevel.getIndex(this.path[0]));
          }
        }
      case "chasing":
        if(this.chaseTime > 5) {
          this.state = "wandering";
          this.targetIndex = null;
          this.path = null;
          return new Wait(this);
        } else if(heuristicToPlayer <= this.parentLevel.visionRange && this.playerLock) {
          this.state = "attacking";
          this.targetIndex = null;
          this.path = null;
          return null;
        } else {
          this.chaseTime++;
          this.targetIndex = player.lastPosition;
          this.updatePath();
          if(this.path === null) {
            this.targetIndex = player.tile.index;
            this.updatePath();
          }
          if(this.path === null) {
            this.targetIndex = null;
            return new Wait(this);
          } 
          return new Movement(this, this.parentLevel.getIndex(this.path[0]));
        }
    }
    //backup return
    return null;
  }
  //updates the path to the current target
  updatePath() {
    this.path = currentPC.pathfind(this.tile.index, this.targetIndex, this.parentLevel.getNonWalkables(this), 2000);
  }
}
//wiggly worm
class WigglyWorm extends Enemy {
  constructor(transform, tile) {
    super(transform, tile, images.enemies.wigglyWorm);
    this.type = "wiggly worm";
    this.moveTime = 1;
    this.xpValue = tk.randomNum(3, 6);
    this.weapon = null;
    this.melee = {
      time: 1,
      damage: 3,
    };
    this.health = {
      current: 10,
      max: 10
    };
  }
}