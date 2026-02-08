//turnSystem.js contains all the action type classes and turn controller

//CONTROLLER
//turn controller class
class TurnController {
  constructor() {
    this.turnOrder = [];
    this.currentAction = null;
    this.turn = 0;
    this.highestTurn = 0;
  }
  //adds a new entity to the turn order
  add(entity) {
    this.turnOrder.push(entity)
    this.turnOrder.sort((a, b) => {targetEntity
      return a.nextTurn - b.nextTurn;
    });
  }
  remove(entity) {
    for(let turnEnt = 0; turnEnt < this.turnOrder.length; turnEnt++) {
      if(entity === this.turnOrder[turnEnt]) {
        this.turnOrder.splice(turnEnt, 1);
        break;
      }
    }
  }
  //initialises starting enemies and player on new level
  initialize() {
    player.nextTurn = 0;
    this.turnOrder.push(player);
    currentLevel.enemies.forEach((enemy) => {
      this.turnOrder.push(enemy);
    });
    currentLevel.npcs.forEach((npc) => {
      this.turnOrder.push(npc);
    });
    this.turnOrder.sort((a, b) => {
      return a.nextTurn - b.nextTurn;
    });
  }
  //updates the turn order and runs actions
  update() {
    if(dialogController.queued.length === 0) {
      //if no actions to be done
      if(this.currentAction === null) {
        //hold an action object or null placeholder
        let returnAction = this.turnOrder[0].runTurn();
        //if action object is ready
        if(returnAction !== null) {
          //set as current action
          this.currentAction = returnAction;
          //increase next turn of entity by action turn increase
          this.turnOrder[0].nextTurn += returnAction.turnIncrease;
          //set current turn to nextTurn of entity
          this.turn = this.turnOrder[0].nextTurn;
          //check for new highest turn
          if(this.turn > this.highestTurn) {
            //find absolute increase in turns
            let absoluteIncrease = Math.floor(this.turn) - Math.floor(this.highestTurn);
            //for each entity in the turn order
            this.turnOrder.forEach((turnEnt) => {
              //run a number of turn pings
              for(let ping = 0; ping < absoluteIncrease; ping++) {
                turnEnt.turnPing();
              }
            });
            //ping the level
            for(let ping = 0; ping < absoluteIncrease; ping++) {
              currentLevel.turnPing();
            }
            //set highest to new highest
            this.highestTurn = this.turn;
          }
          //re-sort
          this.turnOrder.sort((a, b) => {
            return a.nextTurn - b.nextTurn;
          });
        }
      //if action needs completed
      } else {
        if(this.currentAction.actor.tile.visible) {
          this.currentAction.update();
          this.currentAction.remainingDuration--;
          if(this.currentAction.remainingDuration <= 0) {
            this.currentAction = null;
          }
        } else {
          this.currentAction.complete();
          this.currentAction = null;
        }
      }
    }
  }
}

//ACTIONS
//action class for player and entity actions sent to turn manager
class Action {
  constructor(actor, turnIncrease) {
    //entity who sent in action
    this.actor = actor;
    //how many turns the action will add to the entity's nextTurn timer
    this.turnIncrease = turnIncrease;
    //subclass specific
    this.type;
    //total duration of the action in frames
    this.duration;
    //remaining duration
    this.remainingDuration;
  }
  //updates a visible animation for the duration in frames
  update() {
  }
  //when the animation doesn't have to play, does the action instantly
  complete() {
  }
}
class Movement extends Action {
  constructor(actor, targetTile) {
    super(actor, actor.moveTime);
    this.type = "movement";
    [this.duration, this.remainingDuration] = [10, 10];
    //tile being moved to
    this.targetTile = targetTile;
    //distance to move each frame
    this.stepLength = tk.pairMath(this.actor.transform, this.targetTile.transform, "distance") / this.duration;
    //direction to move
    this.moveDirection = tk.pairMath(this.actor.transform, this.targetTile.transform, "angle");
  }
  update() {
    //on start
    if(this.remainingDuration === this.duration) {
      //update tile relationship
      updateTERelationship(this.actor.tile, this.actor, this.targetTile);
      //face right direction
      if(this.actor.transform.x !== this.targetTile.transform.x) {
        this.actor.leftFacing = this.actor.transform.x > this.targetTile.transform.x;
      }
      //start move animation
      this.actor.animation.state = "move";
    }
    //while running
    if(this.remainingDuration > 1) {
      this.actor.transform.rotationalIncrease(this.moveDirection, this.stepLength);
    //last frame
    } else {
      if(this.actor.type === "player") {
        currentLevel.reshade();
      }
      this.actor.transform = this.targetTile.transform.duplicate();
      //set back to idle
      this.actor.animation.state = "idle";
    }
  }
  complete() {
    //update tile relationship
    updateTERelationship(this.actor.tile, this.actor, this.targetTile);
    //physically move
    this.actor.transform = this.targetTile.transform.duplicate();
  }
}
class Melee extends Action {
  constructor(actor, targetEntity) {
    super(actor, actor.melee.time);
    this.type = "attack";
    [this.duration, this.remainingDuration] = [15, 15];
    //target being attacked
    this.targetEntity = targetEntity;
    //damage dealt based on melee from actor
    this.damage = actor.getMelee();
    //rotational direction of the attack
    this.attackDirection = tk.pairMath(this.actor.transform, this.targetEntity.transform, "angle");
    //if targeting enemy, check their player lock on
    if(targetEntity.eType === "enemy") {
      this.surprise = !targetEntity.playerLock
    //if targeting player, check to see if on visible tile
    } else {
      this.surprise = !targetEntity.tile.visible;
    }
    //multiply damage if surprised
    if(this.surprise) {
      this.damage = Math.floor(this.damage * 1.5);
    }
  }
  update() {
    //on start
    if(this.remainingDuration === this.duration) {
      //trigger damage effect
      currentEC.add(new DamageNumber(this));
      //set animaiton
      this.actor.animation.state = "attack";
      this.actor.animation.frame = 0;
      //face right direction
      if(this.actor.transform.x !== this.targetEntity.transform.x) {
        this.actor.leftFacing = this.actor.transform.x > this.targetEntity.transform.x;
      }
    }
    if(this.remainingDuration > 10) {
      //move forward
      this.actor.transform.rotationalIncrease(this.attackDirection, tileSize / 10);
    } else if(this.remainingDuration === 10) {
      //enact damage
      this.targetEntity.damage(this);
    } else if(this.remainingDuration > 4) {
      //move back
      this.actor.transform.rotationalIncrease(this.attackDirection, tileSize / -10);
    } else if(this.remainingDuration === 1) {
      //reset animation
      this.actor.animation.state = "idle";
    }
  }
  complete() {
    //face right direction
    if(this.actor.transform.x !== this.targetEntity.transform.x) {
      this.actor.leftFacing = this.actor.transform.x > this.targetEntity.transform.x;
    }
    //apply damage
    this.targetEntity.damage(this);
  }
}
class Shove extends Action {
  constructor(actor, targetEntity) {
    super(actor, actor.melee.time);
    this.type = "shove";
    [this.duration, this.remainingDuration] = [20, 20];
    //target being shoved
    this.targetEntity = targetEntity;
    //rotational direction of the attack
    this.attackDirection = tk.pairMath(this.actor.transform, this.targetEntity.transform, "angle");
    //tile being moved to
    this.targetTile = currentLevel.getIndex(tk.pairMath(this.targetEntity.tile.index, this.actor.tile.index, "subtract").add(this.targetEntity.tile.index))
    //distance to move each frame
    this.stepLength = tk.pairMath(this.actor.transform, this.targetEntity.transform, "distance") / this.duration;
  }
  update() {
    //on start
    if(this.remainingDuration === this.duration) {
      this.targetEntity.targetIndex = null;
      this.targetEntity.path = null;
      this.actor.animation.state = "attack";
      this.actor.animation.frame = 0;
      if(this.actor.transform.x !== this.targetTile.transform.x) {
        this.actor.leftFacing = this.actor.transform.x > this.targetTile.transform.x;
      }
    }
    //during animation
    if(this.remainingDuration > this.duration / 2 || (this.targetTile.type === "floor" && this.targetTile.walkable && this.targetTile.entity === null) || this.targetTile.type === "pit") {
      this.targetEntity.transform.add(tk.calcRotationalTranslate(this.attackDirection, this.stepLength));
    } else {
      this.targetEntity.transform.subtract(tk.calcRotationalTranslate(this.attackDirection, this.stepLength));
    }
    //at end
    if(this.remainingDuration === 1) {
      //reset animation
      this.actor.animation.state = "idle";
      //set new position
      if((this.targetTile.type === "floor" && this.targetTile.walkable && this.targetTile.entity === null) || this.targetTile.type === "pit") {
        this.targetEntity.transform = this.targetTile.transform.duplicate();
        updateTERelationship(this.targetEntity.tile, this.targetEntity, this.targetTile);
      }
      //do fall animation if applicable
      if(this.targetTile.type === "pit" && !this.targetEntity.flying) {
        currentTC.currentAction = new Fall(this.targetEntity);
      }
    }
  }
  complete() {
    if(this.actor.transform.x !== this.targetTile.transform.x) {
      this.actor.leftFacing = this.actor.transform.x > this.targetTile.transform.x;
    }
    if(this.targetTile.type === "floor" && this.targetTile.walkable && this.targetTile.entity === null) {
      this.targetEntity.transform = this.targetTile.transform.duplicate();
      updateTERelationship(this.targetEntity.tile, this.targetEntity, this.targetTile);
    }
    if(this.targetTile.type === "pit") {
      currentTC.currentAction = new Fall(this.targetEntity);
    }
  }
}
class Wait extends Action {
  constructor(actor) {
    super(actor, 1);
    this.type = "wait";
    [this.duration, this.remainingDuration] = [1, 1];
  }
  update() {
    currentEC.add(new ParticleEffect(tk.pairMath(this.actor.transform, new Pair(tileSize / 3, tileSize / 3), "add"), "float", images.hud.miniIcons.duplicate().setActive(new Pair(0, 1)), 1, 0.25, 100, false));
    this.actor.animation.state = "idle";
  }
}
class Interaction extends Action {
  constructor(actor, npc) {
    super(actor, 0);
    this.type = "interaction";
    [this.duration, this.remainingDuration] = [1, 1];
    //npc being interacted with
    this.npc = npc;
  }
  update() {
    this.npc.getInteraction();
    this.actor.animation.state = "idle";
  }
}
class ChestOpen extends Action {
  constructor(actor, chest) {
    super(actor, 1);
    this.type = "chestOpen";
    [this.duration, this.remainingDuration] = [1, 1];
    this.chest = chest;
    currentEC.add(new Death(chest));
  }
  update() {
    this.chest.open();
    this.actor.animation.state = "idle";
  }
  complete() {
    this.chest.open();
  }
}
class ItemUse extends Action {
  constructor(actor, item) {
    super(actor, 1);
    this.type = "itemUse";
    [this.duration, this.remainingDuration] = [10, 10];
    this.item = item;
  }
  update() {
    this.actor.animation.state = "idle";
    if(this.remainingDuration === 1) {
      this.item.activate();
    }
  }
  complete() {
    this.item.activate();
  }
}
class ItemCollect extends Action {
  constructor(actor, items) {
    super(actor, actor.moveTime + 0.5);
    this.type = "itemCollect";
    [this.duration, this.remainingDuration] = [10, 10];
    //tile being moved to
    this.targetTile = items[0].tile;
    //item being collected
    this.items = items;
    //distance to move each frame
    this.stepLength = tk.pairMath(this.actor.transform, this.targetTile.transform, "distance") / this.duration;
    //direction to move
    this.moveDirection = tk.pairMath(this.actor.transform, this.targetTile.transform, "angle");
  }
  update() {
    //on start
    if(this.remainingDuration === this.duration) {
      //update tile relationship
      updateTERelationship(this.actor.tile, this.actor, this.targetTile);
      //face right direction
      if(this.actor.transform.x !== this.targetTile.transform.x) {
        this.actor.leftFacing = this.actor.transform.x > this.targetTile.transform.x;
      }
      //start move animation
      this.actor.animation.state = "move";
    }
    //while running
    if(this.remainingDuration > 1) {
      this.actor.transform.rotationalIncrease(this.moveDirection, this.stepLength);
      //last frame
    } else {
      if(this.actor.type === "player") {
        currentLevel.reshade();
      }
      this.actor.transform = this.targetTile.transform.duplicate();
      //set back to idle
      this.actor.animation.state = "idle";
      //update item relationship
      this.items.forEach((item) => {
        item.convert(this.actor);
      });
      //play pickup animation
      currentEC.add(new PickupAnimation(this.items, this.actor))
    }
  }
  complete() {
    //update item relationship
    this.item.convert(this.actor);
    //update tile relationship
    updateTERelationship(this.actor.tile, this.actor, this.targetTile);
    //physically move
    this.actor.transform = this.targetTile.transform.duplicate();
  }
}
class Fall extends Action {
  constructor(actor) {
    super(actor, 0);
    this.type = "fall";
    [this.duration, this.remainingDuration] = [50, 51];
    //saves the sprite of an actor before modding it
    this.savedSprite;
  }
  update() {
    //on start
    if(this.remainingDuration === this.duration) {
      this.actor.animation.state = "jump";
      this.actor.sprite.y = tileSize / 12;
    }
    //during animation
    this.actor.sprite.w *= 0.9;
    this.actor.sprite.h *= 0.9;
    this.actor.sprite.r += 12;
    this.actor.sprite.alpha = this.remainingDuration / this.duration;
    //at end
    if(this.remainingDuration === 1) {
      //reset sprite and animation
      this.actor.animation.state = "idle";
      this.actor.sprite = this.savedSprite;
      //set new position or kill (pits are disabled f1)
      if(this.actor.type === "player") {
        this.actor.health.current /= 2;
        if(currentLevel.levelId === 0) {
          loadLevel(1);
        } else {
          loadLevel(currentLevel.levelId - 1);
        }
      } else {
        this.actor.health.current = -1;
      }
    }
  }
  complete() {
    //set new position or kill (pits are disabled f1)
    if(this.actor.type === "player") {
      this.actor.health.current /= 2;
      if(currentLevel.levelId === 0) {
        loadLevel(1);
      } else {
        loadLevel(currentLevel.levelId - 1);
      }
    } else {
      this.actor.health.current = -1;
    }
  }
}