// game/monster.js
const Entity = require("./entity");

class Monster extends Entity {
  constructor({
    name,
    level = 1,
    maxHp = 50,
    atk = 8,
    def = 3,
    spd = 4,
    goldDrop = 10,
    xpDrop = 20,
    type = "Beast",
    skills = [],
  }) {
    super({ name, level, maxHp, atk, def, spd, skills });
    this.goldDrop = goldDrop;
    this.xpDrop = xpDrop;
    this.type = type;
  }

  // Retorna a recompensa do monstro
  getRewards() {
    return {
      gold: this.goldDrop,
      xp: this.xpDrop
    };
  }
}

module.exports = Monster;
