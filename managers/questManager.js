// managers/questManager.js
const fs = require('fs');
const path = require('path');

/**
 * @typedef {'primary'|'secondary'} QuestType
 *
 * @typedef {Object} Quest
 * @property {string} id
 * @property {string} name
 * @property {QuestType} type
 * @property {string} description
 * @property {string} [location] - ID da localidade onde a missão está disponível
 * @property {{ minLevel?: number, fame?: number, relations?: Object<string, number> }} [conditions]
 * @property {Array<string>} [objectives]
 * @property {Object<string, number>} [rewards]
 * @property {{ minLevel?: number }} [conditions]
 */

/**
 * Gerencia o carregamento e estado das missões do jogo.
 */
class QuestManager {
  /**
   * @param {{ dataFile?: string }=} opts
   */
  constructor({ dataFile } = {}) {
    this.dataFile = dataFile || path.resolve(__dirname, '../data/quests.json');
    this.quests = [];
    this.load();
  }

  /** Carrega o arquivo de missões. */
  load() {
    if (!fs.existsSync(this.dataFile)) return;
    const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
    this.quests = Array.isArray(raw?.quests) ? raw.quests : [];
  }

  /**
   * Obtém uma missão pelo ID.
   * @param {string} id
   * @returns {Quest|null}
   */
  getQuestById(id) {
    return this.quests.find(q => q.id === id) || null;
  }

  /**
   * Lista missões disponíveis considerando localização e condições.
   * @param {import('./gameManager')} game
   * @returns {Quest[]}
   */
  getAvailableQuests(game) {
    const loc = game?.flags?.location || {};
    const currentLoc = loc.localId || loc.villageId || loc.cityId;

    return this.quests.filter(q => {
      const status = game.flags?.quests?.[q.id];
      if (status) return false;
      if (q.location && q.location !== currentLoc) return false;
      if (q.conditions?.minLevel && game.player.level < q.conditions.minLevel) return false;
      if (q.conditions?.fame && game.player.fame < q.conditions.fame) return false;
      if (q.conditions?.relations) {
        for (const [npcId, min] of Object.entries(q.conditions.relations)) {
          const rel = game.flags?.npcRelations?.[npcId] || 0;
          if (rel < min) return false;
        }
      }
      return true;
    });
  }

  /**
   * Marca uma missão como aceita.
   * @param {import('./gameManager')} game
   * @param {string} questId
   */
  acceptQuest(game, questId) {
    game.flags.quests = game.flags.quests || {};
    game.flags.quests[questId] = 'accepted';
  }

  /**
   * Lista missões já aceitas pelo jogador.
   * @param {import('./gameManager')} game
   * @returns {Quest[]}
   */
  getActiveQuests(game) {
    const qFlags = game.flags?.quests || {};
    return this.quests.filter(q => qFlags[q.id] === 'accepted');
  }

  /**
   * Marca uma missão como concluída e aplica recompensas.
   * @param {import('./gameManager')} game
   * @param {string} questId
   */
  completeQuest(game, questId) {
    const quest = this.getQuestById(questId);
    if (!quest) return;
    game.flags.quests = game.flags.quests || {};
    if (game.flags.quests[questId] !== 'accepted') return;
    game.flags.quests[questId] = 'completed';
    const rewards = quest.rewards || {};
    if (rewards.gold) game.player.gold += rewards.gold;
    if (rewards.fame) game.player.fame += rewards.fame;
    if (rewards.xp) game.player.gainXP(rewards.xp);
  }
}

module.exports = QuestManager;
