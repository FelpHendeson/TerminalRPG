// game/entities/player.js
const Entity = require('./entity');

class Player extends Entity {
  constructor({
    id = null,
    name = 'Herói',
    level = 1,
    maxHp = 100,
    atk = 10,
    def = 5,
    spd = 5,
    gold = 0,
    skills = [],
    xp = 0,
    xpToLevelUp = 100,
    inventory = []
  } = {}) {
    super({ id, name, level, maxHp, atk, def, spd, gold, skills });
    this.xp = xp;
    this.xpToLevelUp = xpToLevelUp;
    this.inventory = inventory;
  }

  gainXP(amount) {
    this.xp += amount;
    const leveled = [];
    while (this.xp >= this.xpToLevelUp) {
      this.levelUp();
      leveled.push(this.level);
    }
    return leveled;
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpToLevelUp;
    this.xpToLevelUp = Math.floor(this.xpToLevelUp * 1.2);
    this.maxHp += 20;
    this.atk += 5;
    this.def += 3;
    this.spd += 1;
    this.hp = this.maxHp;
  }

  addItem(item) {
    this.inventory.push(item);
  }

  removeItem(item) {
    this.inventory = this.inventory.filter(i => i !== item);
  }

  getStats() {
    return {
      ...super.getStats(),
      xp: this.xp,
      xpToLevelUp: this.xpToLevelUp,
      inventory: this.inventory,
      type: 'Player'
    };
  }

  toJSON() {
    return {
      __type: 'Player',
      ...this.getStats()
    };
  }

  static fromJSON(json) {
    return new Player({
      id: json.id,
      name: json.name,
      level: json.level,
      maxHp: json.maxHp,
      atk: json.atk,
      def: json.def,
      spd: json.spd,
      gold: json.gold,
      skills: json.skills,
      xp: json.xp,
      xpToLevelUp: json.xpToLevelUp,
      inventory: json.inventory
    });
  }
}

module.exports = Player;
