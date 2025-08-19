const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Skill
 * @property {string} id
 * @property {string} name
 * @property {'active'|'passive'} type
 * @property {string} [element]
 * @property {string} [category]
 * @property {string} [description]
 */

class SkillManager {
  constructor({ dataFile } = {}) {
    this.dataFile = dataFile || path.resolve(__dirname, '../data/skills.json');
    this.skills = [];
    this.load();
  }

  load() {
    if (!fs.existsSync(this.dataFile)) return;
    const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
    this.skills = Array.isArray(raw?.skills) ? raw.skills : [];
  }

  /**
   * @param {string} id
   * @returns {Skill|null}
   */
  getSkill(id) {
    return this.skills.find(s => s.id === id) || null;
  }

  /** Adiciona uma habilidade ao jogador. */
  learnSkill(player, skillId) {
    if (!player.skills.includes(skillId)) {
      player.skills.push(skillId);
    }
  }

  /** Equipa uma habilidade respeitando limites. */
  equipSkill(player, skillId) {
    const skill = this.getSkill(skillId);
    if (!skill || !player.skills.includes(skillId)) return false;
    if (skill.type === 'active') {
      if (player.equippedActives.length >= 4) return false;
      if (!player.equippedActives.includes(skillId)) {
        player.equippedActives.push(skillId);
      }
    } else {
      if (player.equippedPassives.length >= 2) return false;
      if (!player.equippedPassives.includes(skillId)) {
        player.equippedPassives.push(skillId);
      }
    }
    return true;
  }
}

module.exports = SkillManager;
