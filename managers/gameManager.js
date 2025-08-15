// managers/gameManager.js
const fs = require('fs');
const path = require('path');
const Player = require('../entities/player');

/**
 * @typedef {Object} SaveData
 * @property {number} version
 * @property {Object|null} player
 * @property {Object} flags
 * @property {number} savedAt
 */

/** Estados de alto nível do jogo */
const STATES = /** @type {const} */ ({
  TITLE: 'TITLE',
  EXPLORATION: 'EXPLORATION',
  MENU: 'MENU',
  EXIT: 'EXIT',
});

/**
 * Gerencia estado global, persistência e orquestra fluxos de jogo.
 */
class GameManager {
  /**
   * @param {{ saveDir?: string }=} opts
   */
  constructor({ saveDir = '.data' } = {}) {
    this.saveDir = saveDir;
    this.saveFile = path.join(saveDir, 'save.json');
    this.version = 1;

    /** @type {keyof typeof STATES} */
    this.gameState = STATES.TITLE;

    /** @type {Player|null} */
    this.player = null;

    /** flags globais (ex.: tutoriais vistos, chaves de portas, etc.) */
    this.flags = {};
  }

  // ========= Persistência =========

  ensureSaveDir() {
    if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
  }

  /**
   * @returns {boolean}
   */
  hasSave() {
    try {
      return fs.existsSync(this.saveFile) && fs.statSync(this.saveFile).size > 0;
    } catch {
      return false;
    }
  }

  /**
   * @returns {boolean}
   */
  load() {
    if (!this.hasSave()) return false;
    try {
      const raw = /** @type {SaveData} */ (JSON.parse(fs.readFileSync(this.saveFile, 'utf-8')));

      // migração por versão (hook futuro)
      if (typeof raw.version !== 'number') raw.version = 1;
      // if (raw.version < this.version) { /* aplicar migrações aqui */ }

      this.player = raw.player ? Player.fromJSON(raw.player) : null;
      this.flags = raw.flags ?? {};
      this.gameState = this.player ? STATES.EXPLORATION : STATES.TITLE;
      return true;
    } catch (err) {
      // se o save estiver corrompido, não derruba o jogo
      this.player = null;
      this.flags = {};
      this.gameState = STATES.TITLE;
      return false;
    }
  }

  /**
   * Salva snapshot do estado do jogo.
   */
  save() {
    this.ensureSaveDir();
    /** @type {SaveData} */
    const payload = {
      version: this.version,
      player: this.player ? this.player.toJSON() : null,
      flags: this.flags,
      savedAt: Date.now(),
    };
    fs.writeFileSync(this.saveFile, JSON.stringify(payload, null, 2), 'utf-8');
  }

  // ========= Ciclo de vida =========

  /**
   * Inicia um novo jogo com um jogador.
   * @param {Player} player
   */
  startNewGame(player) {
    this.player = player;
    this.gameState = STATES.EXPLORATION;
    this.save(); // opcional: já salva o início
  }

  /**
   * Sair do jogo (mantém responsabilidade de salvar aqui).
   */
  exit() {
    this.save();
    this.gameState = STATES.EXIT;
  }

  // ========= Utilidades de alto nível =========

  /**
   * Resumo de status formatado para tela.
   * @returns {string[]}
   */
  getStatusLines() {
    if (!this.player) return ['Nenhum personagem carregado.'];
    const p = this.player;
    return [
      `Nome: ${p.name}  |  Nível: ${p.level}`,
      `HP: ${p.hp}/${p.maxHp}  |  ATK: ${p.atk}  DEF: ${p.def}  SPD: ${p.spd}`,
      `Ouro: ${p.gold}  |  XP: ${p.xp}/${p.xpToLevelUp}`,
    ];
  }

  /**
   * Adiciona recompensas ao jogador.
   * @param {{ gold?: number, xp?: number }} reward
   */
  grant(reward = {}) {
    if (!this.player) return;
    if (reward.gold) this.player.gold += reward.gold;
    if (reward.xp) this.player.gainXp(reward.xp);
  }
}

GameManager.STATES = STATES;
module.exports = GameManager;
