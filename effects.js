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
    this.renderTool = hudLayer ? hrt : rt;
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
    this.blocked = attackAction.targetEntity.health.shield > 0;
  }
  update() {
    this.remainingDuration--;
    if(this.sourceAttack.actor.tile.visible) {
      if(this.blocked) {
        this.renderTool.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "Shielded!", 0, (landscape ? cs.w / 50 : cs.h / 35), "center"), new Fill("#9b009b", this.remainingDuration / this.duration));
      } else {
        this.renderTool.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "-" + this.sourceAttack.damage, 0, (landscape ? cs.w / 50 : cs.h / 35), "center"), new Fill(this.sourceAttack.surprise ? "#ffff00" : "#ff0202", this.remainingDuration / this.duration));
      }
    }
  }
}
//damage number effect subclass
class HealNumber extends Effect {
  constructor(amount, entity) {
    super(60, entity.transform, false);
    this.amount = amount;
  }
  update() {
    this.remainingDuration--;
    this.renderTool.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "+" + this.amount, 0, (landscape ? cs.w / 50 : cs.h / 35), "center"), new Fill("#00eb00", this.remainingDuration / 60));
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
    this.renderTool.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", "+" + this.xpCount + "xp", 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#c4b921", this.remainingDuration / 60));
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
    this.renderTool.renderText(this.transform.add(new Pair(Math.sin(ec / 10) * 0.1, 0.1)), new TextNode("pixelFont", `+${this.pointCount} Skill Point${this.pointCount > 1 ? "s" : ""}!`, 0, (landscape ? cs.w : cs.h) / 30, "center"), new Fill("#c4b921", this.remainingDuration / 120));
  }
}
class NewLevelEffect extends Effect {
  constructor() {
    super(300, new Pair(cs.w / 2, cs.h / -2), true)
  }
  update() {
    this.remainingDuration--;
    if(this.remainingDuration > 150) {
      if(currentLevel.levelId !== 0) {
        this.renderTool.renderText(this.transform, new TextNode("pixelFont", `-Floor ${currentLevel.levelId}-`, 0, (cs.w / 10) * (this.remainingDuration / 150), "center"), new Fill("#FFFFFF", 1));
      }
      this.renderTool.renderText(this.transform.duplicate().add(new Pair(0, landscape ? cs.w / 10 : cs.h / 10)), new TextNode("pixelFont", currentLevel.zone, 0, (cs.w / 15) * (this.remainingDuration / 150), "center"), new Fill("#FFFFFF", 1));
    } else {
      if(currentLevel.levelId !== 0) {
        this.renderTool.renderText(this.transform, new TextNode("pixelFont", `-Floor ${currentLevel.levelId}-`, 0, cs.w / 10, "center"), new Fill("#FFFFFF", this.remainingDuration / 150));
      }
      this.renderTool.renderText(this.transform.duplicate().add(new Pair(0, landscape ? cs.w / 10 : cs.h / 10)), new TextNode("pixelFont", currentLevel.zone, 0, (cs.w / 15), "center"), new Fill("#FFFFFF", this.remainingDuration / 150));
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
    if(this.entity.eType === "nme") {
      this.entity.sprite.alpha = this.remainingDuration / this.duration;
      this.entity.render();
    } else {
      this.entity.sprite.alpha = this.remainingDuration / this.duration;
      if(this.entity.tile.visible) {
        this.entity.health.current = this.entity.health.max
        this.entity.render();
      }
    }
  }
}
class ParticleEffect extends Effect {
  constructor(transform, effectType, particle, particleCount, force, duration, onHUD) {
    super(duration, transform, onHUD);
    //animation type
    this.effectType = effectType;
    //force multiplier for movement
    this.force = force;
    //particle object container
    this.particles = [];
    //create particle units
    for(let ci = 0; ci < particleCount; ci++) {
      //all particles have a position and sprite
      this.particles.push({p: transform.duplicate(), s: particle.duplicate()});
      //different types have different submodules
      switch(this.effectType) {
        //gravity contains velocity and rotation subtype
        case "gravityBurst":
          this.particles[this.particles.length - 1].v = new Pair((tk.randomNum(-20, 20) / 10) * this.force, (tk.randomNum(30, 60) / 10) * this.force);
          this.particles[this.particles.length - 1].r = this.particles[this.particles.length - 1].v.x * tk.randomNum(1, 4);
          break;
        case "omniDirectional":
          this.particles[this.particles.length - 1].d = tk.randomNum(0, 360);
          this.particles[this.particles.length - 1].r = (tk.randomNum(0, 9) - 4.5) * this.force;
          break;
        case "float":
          this.particles[this.particles.length - 1].v = new Pair((tk.randomNum(-10, 10) / 10) * this.force, (tk.randomNum(10, 20) / 10) * this.force);
          break;
        case "glitter":
          this.particles[this.particles.length - 1].r = this.force * -1;
          this.particles[this.particles.length - 1].p.add(new Pair(tk.randomNum(-5, 5), tk.randomNum(-5, 5)).multiply(this.force));
          break;
      }
    }
  }
  update() {
    this.remainingDuration--;
    //animation control
    switch(this.effectType) {
      case "gravityBurst":
        this.particles.forEach((particle) => {
          //update velocity and gravity
          particle.v.y -= 0.3;
          particle.v.x *= 0.98;
          particle.p.add(particle.v);
          //update sprite and render
          particle.s.r += particle.r;
          particle.s.alpha = this.remainingDuration / this.duration;
          this.renderTool.renderImage(particle.p, particle.s);
        });
        break;
      case "omniDirectional":
        this.particles.forEach((particle) => {
          particle.p.add(tk.calcRotationalTranslate(particle.d, this.force * 2));
          //update sprite and render
          particle.s.r += particle.r;
          particle.s.alpha = this.remainingDuration / this.duration;
          this.renderTool.renderImage(particle.p, particle.s);
        });
        break;
      case "float":
        this.particles.forEach((particle) => {
          //update velocity and gravity
          particle.v.x *= 0.98;
          particle.p.add(particle.v);
          //update sprite and render
          particle.s.alpha = this.remainingDuration / this.duration;
          this.renderTool.renderImage(particle.p, particle.s);
        });
        break;
      case "glitter":
        this.particles.forEach((particle) => {
          //update sprite and render
          particle.s.alpha = this.remainingDuration / this.duration;
          particle.s.r += particle.r;
          this.renderTool.renderImage(particle.p, particle.s);
        });
        break;
    }
  }
}
class PickupAnimation extends Effect {
  constructor(items, entity) {
    super(35, entity.transform.duplicate(), false);
    this.items = [].concat(items);
    this.transforms = [];
    this.sprites = [];
    this.rotation = (360 / items.length);
    this.vel = 10;
    for(let cItem = 0; cItem < this.items.length; cItem++) {
      this.transforms.push(new Pair(0, 0));
      this.sprites.push(this.items[cItem].sprite.duplicate());
    }
  }
  update() {
    this.remainingDuration--;
    this.vel -= 0.6;
    for(let cItem = 0; cItem < this.items.length; cItem++) {
      this.transforms[cItem].rotationalIncrease((cItem * this.rotation) + 90, this.vel);
      [this.sprites[cItem].w, this.sprites[cItem].h] = [tileSize - (this.duration - this.remainingDuration), tileSize - (this.duration - this.remainingDuration)];
      this.sprites[cItem].alpha = this.remainingDuration / this.duration;
      rt.renderImage(tk.pairMath(this.transform, this.transforms[cItem], "add"), this.sprites[cItem]);
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
    if(entity === "Tutorial") {
      this.tileScheme = tileschema.nme;
    } else {
      switch(entity.eType) {
        case "player":
          this.tileScheme = tileschema.player;
          break;
        case "enemy":
          this.tileScheme = tileschema.enemy;
          break;
        case "npc":
          this.tileScheme = tileschema.npc;
          break;
        default:
          this.tileScheme = tileschema.nme;
          break;
      }
    }
    this.dialogBox = new Textbox(this.tileScheme, new Pair(cs.w / 2, cs.h * -0.85), new Pair(cs.w - tileSize, cs.h * 0.2), new TextNode("pixelFont", (this.entity === "Tutorial" ? "Tutorial" : this.entity.name) + ": " + this.text, 0, landscape ? cs.w / 50 : cs.h / 30, "left"));
  }
  render() {
    //render box
    this.dialogBox.render();
    //render speech bubble
    if(this.entity !== "Tutorial") {
      rt.renderImage(tk.pairMath(this.entity.transform, new Pair(tileSize * 0.6, tileSize * 0.7), "add"), images.hud.speechBubble);
    }
  }
}