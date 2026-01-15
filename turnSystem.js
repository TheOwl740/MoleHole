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
    this.turnOrder.sort((a, b) => {
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
    [this.duration, this.remainingDuration] = [15, 15];
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
      //face right direction
      this.actor.shape.r = this.attackDirection;
      currentEC.add(new DamageNumber(this));
    }
    if(this.remainingDuration > 10) {
      this.actor.transform.rotationalIncrease(this.attackDirection, tileSize / 10);
    } else if(this.remainingDuration === 10) {
      this.targetEntity.damage(this);
    } else if(this.remainingDuration > 4) {
      this.actor.transform.rotationalIncrease(this.attackDirection, tileSize / -10);
    }
  }
  complete() {
    this.actor.shape.r = this.attackDirection;
    this.targetEntity.damage(this);
  }
}
class Wait extends Action {
  constructor(actor) {
    super(actor, 1);
    this.type = "wait";
    [this.duration, this.remainingDuration] = [15, 15];
  }
  update() {
    currentEC.add(new WaitEffect(this));
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