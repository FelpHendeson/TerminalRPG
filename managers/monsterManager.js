// managers/monsterManager.js
const fs = require('fs');
const path = require('path');
const Monster = require('../entities/monster');

/**
 * Carrega monstros do JSON e filtra por local e horário.
 */
class MonsterManager {
  constructor({ dataFile } = {}) {
    this.dataFile = dataFile || path.resolve(__dirname, '../data/monsters.json');
    this.monsters = [];
    this.load();
  }

  load() {
    if (!fs.existsSync(this.dataFile)) return;
    const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
    this.monsters = Array.isArray(raw?.monsters) ? raw.monsters : [];
  }

  /**
   * Retorna monstros que podem aparecer em um local/horário.
   */
  getMonstersAt(locationId, hour) {
    return this.monsters
      .filter(m => !m.locations || m.locations.includes(locationId))
      .filter(m => {
        const s = m.spawn || {};
        if (s.start === undefined || s.end === undefined) return true;
        if (s.start < s.end) return hour >= s.start && hour < s.end;
        return hour >= s.start || hour < s.end;
      })
      .map(m => Monster.fromJSON({ ...m, maxHp: m.hp }));
  }
}

module.exports = MonsterManager;
