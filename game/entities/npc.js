// game/entities/npc.js
const Entity = require('./entity');

class NPC extends Entity {
  constructor({
    id = null,
    name = 'Pessoa',
    level = 1,
    maxHp = 50,
    atk = 5,
    def = 2,
    spd = 3,
    gold = 0,
    skills = [],
    relationship = 0, // -100..100
    role = 'villager', // merchant, quest_giver, guard...
    dialogue = []
  } = {}) {
    super({ id, name, level, maxHp, atk, def, spd, gold, skills });
    this.relationship = relationship;
    this.role = role;
    this.dialogue = dialogue;
  }

  changeRelationship(delta) {
    this.relationship = Math.max(-100, Math.min(100, this.relationship + delta));
  }

  getStats() {
    return {
      ...super.getStats(),
      relationship: this.relationship,
      role: this.role,
      dialogue: this.dialogue,
      type: 'NPC'
    };
  }

  toJSON() {
    return {
      __type: 'NPC',
      ...this.getStats()
    };
  }

  static fromJSON(json) {
    return new NPC({
      id: json.id,
      name: json.name,
      level: json.level,
      maxHp: json.maxHp,
      atk: json.atk,
      def: json.def,
      spd: json.spd,
      gold: json.gold,
      skills: json.skills,
      relationship: json.relationship,
      role: json.role,
      dialogue: json.dialogue
    });
  }
}

module.exports = NPC;
