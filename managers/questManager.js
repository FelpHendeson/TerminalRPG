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
 * @property {{start:number,end:number}} [time] - janela de horas em que a missão fica disponível (pode cruzar meia-noite)
 * @property {'normal'|'secret'} [visibility] - visibilidade da missão
 * @property {string} [hint] - dica exibida em missões normais
 * @property {{ minLevel?: number, fame?: number, relations?: Object<string, number> }} [conditions]
 * @property {Array<{type:'talk'|'kill'|string,target:string,required:number,description:string}>} [objectives]
 * @property {{gold?:number,fame?:number,xp?:number,items?:string[]}} [rewards]
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
    const hour = game.flags?.time?.hour ?? 0;

    return this.quests.filter(q => {
      // já aceita/concluída?
      const status = game.flags?.quests?.[q.id];
      if (status) return false;

      // localização
      if (q.location && q.location !== currentLoc) return false;

      // visibilidade/segredo (apenas se já foi desbloqueada por algum evento)
      if (q.visibility === 'secret' && !(game.flags?.unlockedQuests?.includes(q.id))) return false;

      // janela de tempo (suporta cruzar meia-noite)
      if (q.time) {
        const { start, end } = q.time;
        if (start < end) {
          if (!(hour >= start && hour < end)) return false;
        } else {
          // ex.: 22 -> 5
          if (!(hour >= start || hour < end)) return false;
        }
      }

      // condições de nível/fama/relações
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
    game.flags.questProgress = game.flags.questProgress || {};
    game.flags.questProgress[questId] = 0;
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

  /** Retorna progresso numérico de uma missão. */
  getProgress(game, questId) {
    return game.flags?.questProgress?.[questId] || 0;
  }

  /**
   * Marca uma missão como concluída e aplica recompensas.
   * @param {import('./gameManager')} game
   * @param {string} questId
   * @returns {{gold?:number,fame?:number,xp?:number,items?:string[]}|null}
   */
  completeQuest(game, questId) {
    const quest = this.getQuestById(questId);
    if (!quest) return null;
    game.flags.quests = game.flags.quests || {};
    if (game.flags.quests[questId] !== 'accepted') return null;

    game.flags.quests[questId] = 'completed';

    const rewards = quest.rewards || {};
    if (rewards.gold) game.player.gold += rewards.gold;
    if (rewards.fame) game.player.fame += rewards.fame;
    if (rewards.xp) game.player.gainXP(rewards.xp);
    if (Array.isArray(rewards.items)) {
      rewards.items.forEach(it => {
        if (typeof game.player.addItem === 'function') {
          game.player.addItem(it);
        }
      });
    }
    return rewards;
  }

  /** Registra progresso de objetivos de matar monstros. */
  recordKill(game, monsterId) {
    const completed = [];
    const active = this.getActiveQuests(game);
    active.forEach(q => {
      const obj = q.objectives?.[0];
      if (!obj || obj.type !== 'kill' || obj.target !== monsterId) return;
      game.flags.questProgress[q.id] = (game.flags.questProgress[q.id] || 0) + 1;
      if (game.flags.questProgress[q.id] >= obj.required) {
        const rewards = this.completeQuest(game, q.id);
        if (rewards) completed.push({ quest: q, rewards });
      }
    });
    return completed;
  }

  /** Registra progresso ao conversar com NPCs. */
  recordTalk(game, npcId) {
    const completed = [];
    const active = this.getActiveQuests(game);
    active.forEach(q => {
      const obj = q.objectives?.[0];
      if (!obj || obj.type !== 'talk' || obj.target !== npcId) return;
      game.flags.questProgress[q.id] = (game.flags.questProgress[q.id] || 0) + 1;
      if (game.flags.questProgress[q.id] >= obj.required) {
        const rewards = this.completeQuest(game, q.id);
        if (rewards) completed.push({ quest: q, rewards });
      }
    });
    return completed;
  }
}

module.exports = QuestManager;
