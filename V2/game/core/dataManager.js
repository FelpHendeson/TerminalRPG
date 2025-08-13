// game/core/dataManager.js
const fs = require('fs');
const path = require('path');

class DataManager {
  constructor() {
    this.dataPath = path.resolve(__dirname, '..', '..', 'data');
    this.cache = {};
    this.loadAllData();
  }

  loadAllData() {
    try {
      this.cache.locations = this.loadJSON('locations.json');
      this.cache.npcs = this.loadJSON('npcs.json');
      this.cache.quests = this.loadJSON('quests.json');
      this.cache.monsters = this.loadJSON('monsters.json');
      this.cache.items = this.loadJSON('items.json');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  loadJSON(filename) {
    const filePath = path.join(this.dataPath, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Arquivo ${filename} não encontrado`);
      return {};
    }
    
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Erro ao carregar ${filename}:`, error);
      return {};
    }
  }

  getLocations() {
    return this.cache.locations?.locations || {};
  }

  getLocation(name) {
    return this.getLocations()[name];
  }

  getNPCs() {
    return this.cache.npcs?.npcs || {};
  }

  getNPC(name) {
    return this.getNPCs()[name];
  }

  getQuests() {
    return this.cache.quests?.quests || {};
  }

  getQuest(id) {
    return this.getQuests()[id];
  }

  getMonsters() {
    return this.cache.monsters?.monsters || {};
  }

  getMonster(name) {
    return this.getMonsters()[name];
  }

  getItems() {
    return this.cache.items?.items || {};
  }

  getItem(name) {
    return this.getItems()[name];
  }

  getMonstersByLocation(locationName) {
    const location = this.getLocation(locationName);
    if (!location || !location.monsters) return [];
    
    return location.monsters.map(monsterName => this.getMonster(monsterName)).filter(Boolean);
  }

  getNPCsByLocation(locationName) {
    const npcs = this.getNPCs();
    return Object.values(npcs).filter(npc => npc.location === locationName);
  }

  getQuestsByLocation(locationName) {
    const quests = this.getQuests();
    return Object.values(quests).filter(quest => quest.location === locationName);
  }

  reloadData() {
    this.cache = {};
    this.loadAllData();
  }
}

module.exports = DataManager;