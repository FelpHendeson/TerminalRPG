// game/entity.js

class Entity {
  constructor({
    name = "???",
    level = 1,
    maxHp = 100,
    atk = 10,
    def = 5,
    spd = 5,
    gold = 0,
    skills = [],
  }) {
    this.name = name;
    this.level = level;

    this.maxHp = maxHp;
    this.hp = maxHp;

    this.atk = atk;
    this.def = def;
    this.spd = spd;

    this.gold = gold;
    this.skills = skills;

    this.effectStatus = []; // Ex: ["poisoned", "burning", "blessed"]
  }

  isAlive() {
    return this.hp > 0;
  }

  receiveDamage(damage) {
    const effectiveDmg = Math.max(damage - this.def, 1);
    this.hp = Math.max(this.hp - effectiveDmg, 0);
    return effectiveDmg;
  }

  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  applyEffectStatus(effect) {
    if (!this.effectStatus.includes(effect)) {
      this.effectStatus.push(effect);
    }
  }

  removeEffectStatus(effect) {
    this.effectStatus = this.effectStatus.filter((e) => e !== effect);
  }

  hasEffectStatus(effect) {
    return this.effectStatus.includes(effect);
  }

  getStats() {
    return {
      name: this.name,
      level: this.level,
      hp: this.hp,
      maxHp: this.maxHp,
      atk: this.atk,
      def: this.def,
      spd: this.spd,
      gold: this.gold,
      skills: this.skills,
      effectStatus: this.effectStatus,
    };
  }
}

module.exports = Entity;