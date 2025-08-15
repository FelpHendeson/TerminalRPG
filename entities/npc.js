// game/entities/npc.js
const Entity = require('./entity');

/**
 * Classe que representa NPCs (Personagens Não-Jogáveis) no jogo.
 * Estende Entity com funcionalidades específicas de NPCs como relacionamento e diálogos.
 */
class NPC extends Entity {
  /**
   * Construtor da classe NPC.
   * 
   * @param {Object} options - Opções de configuração do NPC.
   * @param {string} [options.id=null] - ID único do NPC.
   * @param {string} [options.name='Pessoa'] - Nome do NPC.
   * @param {number} [options.level=1] - Nível do NPC.
   * @param {number} [options.maxHp=50] - Pontos de vida máximos.
   * @param {number} [options.atk=5] - Pontos de ataque.
   * @param {number} [options.def=2] - Pontos de defesa.
   * @param {number} [options.spd=3] - Pontos de velocidade.
   * @param {number} [options.gold=0] - Quantidade de ouro.
   * @param {Array} [options.skills=[]] - Lista de habilidades.
   * @param {number} [options.relationship=0] - Relacionamento com o jogador (-100 a 100).
   * @param {string} [options.role='villager'] - Papel do NPC (merchant, quest_giver, guard, etc.).
   * @param {Array} [options.dialogue=[]] - Lista de diálogos disponíveis.
   */
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

  /**
   * Altera o relacionamento do NPC com o jogador.
   * 
   * @param {number} delta - Mudança no relacionamento (pode ser positivo ou negativo).
   */
  changeRelationship(delta) {
    this.relationship = Math.max(-100, Math.min(100, this.relationship + delta));
  }

  /**
   * Obtém todas as estatísticas do NPC, incluindo relacionamento e papel.
   * 
   * @returns {Object} Objeto contendo todas as estatísticas do NPC.
   */
  getStats() {
    return {
      ...super.getStats(),
      relationship: this.relationship,
      role: this.role,
      dialogue: this.dialogue,
      type: 'NPC'
    };
  }

  /**
   * Converte o NPC para formato JSON.
   * 
   * @returns {Object} Objeto JSON representando o NPC.
   */
  toJSON() {
    return {
      __type: 'NPC',
      ...this.getStats()
    };
  }

  /**
   * Cria uma instância de NPC a partir de um objeto JSON.
   * 
   * @param {Object} json - Objeto JSON contendo os dados do NPC.
   * @returns {NPC} Nova instância de NPC.
   */
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
