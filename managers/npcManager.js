// managers/npcManager.js
const fs = require('fs');
const path = require('path');
const NPC = require('../entities/npc');

class NPCManager {
  constructor({ dataFile } = {}) {
    this.dataFile = dataFile || path.resolve(__dirname, '../data/npcs.json');
    this.npcs = [];
    this.load();
  }

  load() {
    if (!fs.existsSync(this.dataFile)) return;
    const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
    this.npcs = Array.isArray(raw?.npcs)
      ? raw.npcs.map((n) => NPC.fromJSON(n))
      : [];
  }

  getNPCById(id) {
    return this.npcs.find((n) => n.id === id) || null;
  }

  /**
   * Lista NPCs presentes numa localidade em determinado horário.
   * @param {string} locationId
   * @param {number} hour
   * @returns {NPC[]}
   */
  getNPCsAt(locationId, hour) {
    return this.npcs.filter((npc) =>
      npc.schedules?.some(
        (s) => s.location === locationId && hour >= s.start && hour < s.end
      )
    );
  }
}

module.exports = NPCManager;
