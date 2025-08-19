// game/entities/player.js
const Entity = require("./entity");

/**
 * Classe que representa o jogador no jogo.
 * Estende Entity com funcionalidades específicas do jogador como experiência, inventário e level up.
 */
class Player extends Entity {
  /**
   * Construtor da classe Player.
   * 
   * @param {Object} options - Opções de configuração do jogador.
   * @param {string} [options.id=null] - ID único do jogador.
   * @param {string} [options.name="Herói"] - Nome do jogador.
   * @param {number} [options.level=1] - Nível do jogador.
   * @param {number} [options.maxHp=100] - Pontos de vida máximos.
   * @param {number} [options.maxMp=50] - Pontos de mana máximos.
   * @param {number} [options.atk=10] - Pontos de ataque.
   * @param {number} [options.def=5] - Pontos de defesa.
   * @param {number} [options.spd=5] - Pontos de velocidade.
   * @param {number} [options.gold=0] - Quantidade de ouro.
   * @param {Array} [options.skills=[]] - Lista de habilidades.
   * @param {number} [options.xp=0] - Experiência atual.
   * @param {number} [options.xpToLevelUp=100] - Experiência necessária para o próximo nível.
   * @param {Array} [options.inventory=[]] - Inventário do jogador.
   * @param {number} [options.fame=0] - Fama do jogador.
  */
  constructor({
    id = null,
    name = "Herói",
    level = 1,
    maxHp = 100,
    maxMp = 50,
    atk = 10,
    def = 5,
    spd = 5,
    gold = 0,
    skills = [],
    xp = 0,
    xpToLevelUp = 100,
    inventory = [],
    fame = 0,
  } = {}) {
    super({ id, name, level, maxHp, maxMp, atk, def, spd, gold, skills });
    this.xp = xp;
    this.xpToLevelUp = xpToLevelUp;
    this.inventory = inventory;
    this.fame = fame;
  }

  /**
   * Adiciona experiência ao jogador e verifica level up.
   * 
   * @param {number} amount - Quantidade de experiência a ser adicionada.
   * @returns {Array<number>} Array com os níveis alcançados (pode ser múltiplo level up).
   */
  gainXP(amount) {
    this.xp += amount;
    const leveled = [];
    while (this.xp >= this.xpToLevelUp) {
      this.levelUp();
      leveled.push(this.level);
    }
    return leveled;
  }

  /**
   * Aumenta o nível do jogador e melhora suas estatísticas.
   * Restaura HP ao máximo e aumenta XP necessário para o próximo nível.
   */
  levelUp() {
    this.level++;
    this.xp -= this.xpToLevelUp;
    this.xpToLevelUp = Math.floor(this.xpToLevelUp * 1.2);
    this.maxHp += 20;
    this.atk += 5;
    this.def += 3;
    this.spd += 1;
    this.hp = this.maxHp;
  }

  /**
   * Adiciona um item ao inventário do jogador.
   * 
   * @param {Object} item - Item a ser adicionado ao inventário.
   */
  addItem(item) {
    this.inventory.push(item);
  }

  /**
   * Remove um item do inventário do jogador.
   * 
   * @param {Object} item - Item a ser removido do inventário.
   */
  removeItem(item) {
    this.inventory = this.inventory.filter((i) => i !== item);
  }

  /**
   * Obtém todas as estatísticas do jogador, incluindo XP e inventário.
   * 
   * @returns {Object} Objeto contendo todas as estatísticas do jogador.
   */
  getStats() {
    return {
      ...super.getStats(),
      xp: this.xp,
      xpToLevelUp: this.xpToLevelUp,
      inventory: this.inventory,
      fame: this.fame,
      type: "Player",
    };
  }

  /**
   * Converte o jogador para formato JSON.
   * 
   * @returns {Object} Objeto JSON representando o jogador.
   */
  toJSON() {
    return {
      __type: "Player",
      ...this.getStats(),
    };
  }

  /**
   * Cria uma instância de Player a partir de um objeto JSON.
   * 
   * @param {Object} json - Objeto JSON contendo os dados do jogador.
   * @returns {Player} Nova instância de Player.
   */
  static fromJSON(json) {
    return new Player({
      id: json.id,
      name: json.name,
      level: json.level,
      maxHp: json.maxHp,
      atk: json.atk,
      def: json.def,
      spd: json.spd,
      gold: json.gold,
      skills: json.skills,
      xp: json.xp,
      xpToLevelUp: json.xpToLevelUp,
      inventory: json.inventory,
      fame: json.fame,
    });
  }
}

module.exports = Player;
