// entities/monster.js
const Entity = require('./entity');

/**
 * Representa um monstro enfrentado em combate.
 */
class Monster extends Entity {
  constructor({
    id = null,
    name = 'Monstro',
    level = 1,
    maxHp = 20,
    maxMp = 0,
    atk = 5,
    def = 2,
    spd = 3,
    gold = 0,
    xp = 0,
  } = {}) {
    super({ id, name, level, maxHp, maxMp, atk, def, spd, gold });
    this.xp = xp;
  }

  getStats() {
    return { ...super.getStats(), xp: this.xp, type: 'Monster' };
  }

  toJSON() {
    return { __type: 'Monster', ...this.getStats() };
  }

  static fromJSON(json) {
    return new Monster({
      id: json.id,
      name: json.name,
      level: json.level,
      maxHp: json.maxHp,
      atk: json.atk,
      def: json.def,
      spd: json.spd,
      gold: json.gold,
      xp: json.xp,
    });
  }
}

module.exports = Monster;
