// managers/gameManager.js
const Player = require('../entities/player');
const SaveManager = require('./saveManager');

/**
 * Estados possíveis do jogo.
 * @readonly
 * @enum {string}
 */
const STATES = { 
  TITLE: 'TITLE', 
  EXPLORATION: 'EXPLORATION', 
  MENU: 'MENU', 
  EXIT: 'EXIT' 
};

/**
 * Classe principal que gerencia o estado e lógica do jogo.
 * Responsável por coordenar o jogador, saves, flags e transições de estado.
 */
class GameManager {
  /**
   * Construtor da classe GameManager.
   * Inicializa o estado do jogo, jogador, flags e sistema de saves.
   */
  constructor() {
    this.version = 1;
    this.gameState = STATES.TITLE;
    this.player = null;
    this.flags = {};
    this.currentSlot = null;
    this.saves = new SaveManager({ saveDir: undefined }); // "./saves"
  }

  // ===== Persistência (slots) =====
  
  /**
   * Lista todos os slots de save disponíveis com suas informações.
   * 
   * @returns {Array<Object>} Array de objetos contendo informações dos slots.
   * @returns {number} returns[].slot - Número do slot.
   * @returns {boolean} returns[].exists - Se o slot possui um save.
   * @returns {string} [returns[].name] - Nome do personagem no save.
   * @returns {number} [returns[].level] - Nível do personagem no save.
   * @returns {string} [returns[].lastSaved] - Data do último save.
   */
  listSaves() { 
    return this.saves.listSlots(); 
  }

  /**
   * Verifica se existe pelo menos um save em qualquer slot.
   * 
   * @returns {boolean} True se existe pelo menos um save.
   */
  hasAnySave() { 
    return this.saves.hasAnySave(); 
  }

  /**
   * Carrega um save de um slot específico.
   * 
   * @param {number} slot - Número do slot a ser carregado.
   * @returns {boolean} True se o save foi carregado com sucesso.
   */
  loadFromSlot(slot) {
    const raw = this.saves.load(slot);
    if (!raw || !raw.player) return false;
    this.currentSlot = slot;
    this.player = Player.fromJSON(raw.player);
    this.flags = raw.flags || {};
    this.gameState = STATES.EXPLORATION;
    return true;
  }

  /**
   * Salva o estado atual do jogo no slot atual.
   * 
   * @returns {boolean} True se o save foi realizado com sucesso.
   */
  save() {
    if (!this.currentSlot) return false;
    return this.saves.save(this.currentSlot, {
      version: this.version,
      player: this.player ? this.player.toJSON() : null,
      flags: this.flags,
    });
  }

  // ===== Ciclo de vida =====
  
  /**
   * Inicia um novo jogo com um jogador e slot específicos.
   * 
   * @param {Player} player - Instância do jogador a ser usado no novo jogo.
   * @param {number} slot - Número do slot onde o jogo será salvo.
   */
  startNewGame(player, slot) {
    this.player = player;
    this.currentSlot = slot;
    this.gameState = STATES.EXPLORATION;
    this.save(); // salva imediatamente no slot

    this.flags.location = this.flags.location || {
      worldId: 'aetherion',
      continentId: 'eldoria',
      empireId: 'imperium_solaria',
      kingdomId: 'reino_aurora',
      domainId: 'ducado_valemer',
      cityId: 'cidade_luminara',
      villageId: 'vila_inicial'
    };
  }

  /**
   * Encerra o jogo, salvando o progresso atual.
   */
  exit() {
    this.save();
    this.gameState = STATES.EXIT;
  }

  // ===== Utilidades UI =====
  
  /**
   * Obtém linhas de status formatadas para exibição na interface.
   * 
   * @returns {Array<string>} Array de strings com informações do jogador formatadas.
   */
  getStatusLines() {
    if (!this.player) return ['Nenhum personagem carregado.'];
    const p = this.player;
    return [
      `Nome: ${p.name}  |  Nível: ${p.level}`,
      `HP: ${p.hp}/${p.maxHp}  |  ATK: ${p.atk}  DEF: ${p.def}  SPD: ${p.spd}`,
      `Ouro: ${p.gold}  |  XP: ${p.xp}/${p.xpToLevelUp}`,
      `Slot atual: ${this.currentSlot ?? '—'}`,
    ];
  }

  // (opcional) compat com CharacterCreator antigo
  
  /**
   * Define o jogador atual (método de compatibilidade).
   * 
   * @param {Player} player - Instância do jogador a ser definida.
   */
  setPlayer(player) { 
    this.player = player; 
  }

  /**
   * Salva o jogo (método de compatibilidade).
   * 
   * @returns {boolean} True se o save foi realizado com sucesso.
   */
  saveGame() { 
    return this.save(); 
  }

  /**
   * Obtém os estados possíveis do jogo.
   * 
   * @returns {Object} Objeto contendo todos os estados possíveis.
   */
  static get STATES() { 
    return STATES; 
  }
}

module.exports = GameManager;
