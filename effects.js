//effects.js contains the effects system classes, and the dialog box class

//EFFECT SYSTEM
//effect control class handles effect objects
class EffectController {
  constructor() {
    this.activeEffects = [];
    this.activeHUDEffects = [];
  }
  add(effect) {
    if(effect.hudLayer) {
      this.activeHUDEffects.push(effect);
    } else {
      this.activeEffects.push(effect);
    }
  }
  update(onHUD) {
    //effect temp container
    let effect;
    //updates hud effects
    if(onHUD) {
      for(let ei = 0; ei < this.activeHUDEffects.length; ei++) {
        effect = this.activeHUDEffects[ei];
        //delete expired effects
        if(effect.remainingDuration <= 0) {
          this.activeHUDEffects.splice(ei, 1);
          ei--;
          continue;
        }
        //increment timer and render
        effect.update();
      }
    //updates normal effects
    } else {
      for(let ei = 0; ei < this.activeEffects.length; ei++) {
        effect = this.activeEffects[ei];
        //delete expired effects
        if(effect.remainingDuration <= 0) {
          this.activeEffects.splice(ei, 1);
          ei--;
          continue;
        }
        //increment timer and render
        effect.update();
      }
    }
  }
}
//effect class template
class Effect {
  constructor(duration, transform, hudLayer) {
    this.hudLayer = hudLayer;
    this.duration = duration;
    this.remainingDuration = duration;
    this.transform = transform.duplicate();
  }
}
//damage number effect subclass
class DamageNumber extends Effect {
  constructor(attackAction) {
    super(60, attackAction.targetEntity.transform, false);
    this.sourceAttack = attackAction;
  }
  update() {
    this.remainingDuration--;
    if(this.sourceAttack.actor.tile.visible) {
      rt.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "-" + this.sourceAttack.damage, 0, (landscape ? cs.w / 50 : cs.h / 35), "center"), new Fill(this.sourceAttack.surprise ? "#ffff00" : "#ff0202", this.remainingDuration / 60));
    }
  }
}
//xp gain effect
class XPEffect extends Effect {
  constructor(xpCount) {
    super(60, player.transform.duplicate().add(new Pair(0, tileSize)), false);
    this.xpCount = xpCount;
  }
  update() {
    this.remainingDuration--;
    rt.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "+" + this.xpCount + "xp", 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#c4b921", this.remainingDuration / 60));
  }
}
//skill point gain effect
class SPEffect extends Effect {
  constructor(pointCount) {
    super(200, player.transform, false);
    this.pointCount = pointCount;
  }
  update() {
    this.remainingDuration--;
    rt.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", `+${this.pointCount} Skill Point${this.pointCount > 1 ? "s" : ""}!`, 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#c4b921", this.remainingDuration / 120));
  }
}
class NewLevelEffect extends Effect {
  constructor() {
    super(300, new Pair(cs.w / 2, cs.h / -2).add(rt.camera), false)
  }
  update() {
    this.remainingDuration--;
    if(this.remainingDuration > 150) {
      if(currentLevel.levelId !== 0) {
        rt.renderText(this.transform, new TextNode("pixelFont", `-Floor ${currentLevel.levelId}-`, 0, (cs.w / 10) * (this.remainingDuration / 150), "center"), new Fill("#FFFFFF", 1));
      }
      rt.renderText(this.transform.duplicate().add(new Pair(0, landscape ? cs.w / 10 : cs.h / 10)), new TextNode("pixelFont", currentLevel.zone, 0, (cs.w / 15) * (this.remainingDuration / 150), "center"), new Fill("#FFFFFF", 1));
    } else {
      if(currentLevel.levelId !== 0) {
        rt.renderText(this.transform, new TextNode("pixelFont", `-Level ${currentLevel.levelId}-`, 0, cs.w / 10, "center"), new Fill("#FFFFFF", this.remainingDuration / 150));
      }
      rt.renderText(this.transform.duplicate().add(new Pair(0, landscape ? cs.w / 10 : cs.h / 10)), new TextNode("pixelFont", currentLevel.zone, 0, (cs.w / 15), "center"), new Fill("#FFFFFF", this.remainingDuration / 150));
    }
  }
}
class WaitEffect extends Effect {
  constructor(waitAction) {
    super(100, waitAction.actor.transform.duplicate().add(new Pair(0, tileSize / 3)), false);
    this.actor = waitAction.actor;
  }
  update() {
    this.remainingDuration--;
    if(this.actor.tile.visible) {
      rt.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "...", 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#8500d2", this.remainingDuration / 100));
    }
  }
}
class Death extends Effect {
  constructor(entity) {
    super(20, entity.transform.duplicate(), false);
    this.entity = entity;
  }
  update() {
    this.remainingDuration--;
    //fade out
    this.entity.sprites.body.alpha = this.remainingDuration / this.duration;
    if(this.entity.sprites?.hand) {
      this.entity.sprites.hand.alpha = this.remainingDuration / this.duration;
    }
    if(this.entity.tile.visible) {
      this.entity.health.current = this.entity.health.max
      this.entity.render();
    }
  }
}

class IconBurst extends Effect {
  constructor(transform, burstType, icon, iconCount) {
    super(100, transform, true);
    //animation type
    this.burstType = burstType;
    //icon object container
    this.icons = [];
    //create icon units
    for(let ci = 0; ci < iconCount; ci++) {
      //all icons have a position and sprite
      this.icons.push({p: transform.duplicate(), s: icon.duplicate()});
      //different types have different submodules
      switch(this.burstType) {
        //gravity contains velocity and rotation subtype
        case "gravity":
          this.icons[this.icons.length - 1].v = new Pair(tk.randomNum(-20, 20) / 10, tk.randomNum(30, 60) / 10);
          this.icons[this.icons.length - 1].r = this.icons[this.icons.length - 1].v.x;
          break;
      }
    }
  }
  update() {
    this.remainingDuration--;
    //animation control
    switch(this.burstType) {
      case "gravity":
        this.icons.forEach((icon) => {
          //update velocity and gravity
          icon.v.y -= 0.2;
          icon.v.x *= 0.98;
          icon.p.add(icon.v);
          //update sprite and render
          icon.s.r += icon.r;
          icon.s.alpha = this.remainingDuration / this.duration;
          hrt.renderImage(icon.p, icon.s);
        })
        break;
    }
  }
}

//DIALOG CLASS
//dialog instances go in the dialog controller.
class Dialog {
  constructor(entity, text, isThought) {
    this.entity = entity;
    this.text = text;
    this.isThought = isThought
    //assign tilescheme
    switch(entity.eType) {
      case "player":
        this.tileScheme = entityTS.player;
        break;
      case "enemy":
        this.tileScheme = entityTS.enemy;
        break;
      case "npc":
        this.tileScheme = entityTS.npc;
        break;
      default:
        this.tileScheme = entityTS.nme;
        break;
    }
    this.dialogBox = new Textbox(this.tileScheme, new Pair(cs.w / 2, cs.h * -0.85), new Pair(cs.w - tileSize, cs.h * 0.2), new TextNode("pixelFont", this.entity.name + ": " + this.text, 0, landscape ? cs.w / 50 : cs.h / 30, "left"));
  }
  render() {
    //render box
    this.dialogBox.render();
    //render speech bubble
    rt.renderImage(tk.pairMath(this.entity.transform, new Pair(tileSize * 0.6, tileSize * 0.7), "add"), images.hud.speechBubble);
  }
}