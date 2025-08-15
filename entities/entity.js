// game/entities/entity.js
/**
 * Classe base para todas as entidades do jogo (Player, Monster, NPC).
 * Define atributos e comportamentos comuns a todas as entidades.
 */
class Entity {
  /**
   * Construtor da classe Entity.
   * 
   * @param {Object} options - Opções de configuração da entidade.
   * @param {string} [options.id=null] - ID único da entidade. Se null, será gerado automaticamente.
   * @param {string} [options.name="???"] - Nome da entidade.
   * @param {number} [options.level=1] - Nível da entidade.
   * @param {number} [options.maxHp=100] - Pontos de vida máximos.
   * @param {number} [options.atk=10] - Pontos de ataque.
   * @param {number} [options.def=5] - Pontos de defesa.
   * @param {number} [options.spd=5] - Pontos de velocidade.
   * @param {number} [options.gold=0] - Quantidade de ouro.
   * @param {Array} [options.skills=[]] - Lista de habilidades da entidade.
   */
  constructor({
    id = null,
    name = "???",
    level = 1,
    maxHp = 100,
    atk = 10,
    def = 5,
    spd = 5,
    gold = 0,
    skills = [],
  } = {}) {
    this.id = id || Entity.generateId();
    this.name = name;
    this.level = level;

    this.maxHp = maxHp;
    this.hp = maxHp;

    this.atk = atk;
    this.def = def;
    this.spd = spd;

    this.gold = gold;
    this.skills = skills;

    this.effectStatus = []; // ["poisoned", ...]
  }

  /**
   * Gera um ID único para a entidade.
   * 
   * @returns {string} ID único baseado em timestamp e número aleatório.
   */
  static generateId() {
    return `${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Verifica se a entidade está viva.
   * 
   * @returns {boolean} True se a entidade tem HP maior que 0.
   */
  isAlive() {
    return this.hp > 0;
  }

  /**
   * Aplica dano à entidade, considerando a defesa.
   * 
   * @param {number} damage - Quantidade de dano a ser aplicada.
   * @returns {number} Dano efetivo aplicado (mínimo 1).
   */
  receiveDamage(damage) {
    const effectiveDmg = Math.max(damage - this.def, 1);
    this.hp = Math.max(this.hp - effectiveDmg, 0);
    return effectiveDmg;
  }

  /**
   * Restaura pontos de vida da entidade.
   * 
   * @param {number} amount - Quantidade de HP a ser restaurada.
   */
  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  /**
   * Aplica um efeito de status à entidade.
   * 
   * @param {string} effect - Nome do efeito a ser aplicado.
   */
  applyEffectStatus(effect) {
    if (!this.effectStatus.includes(effect)) this.effectStatus.push(effect);
  }

  /**
   * Remove um efeito de status da entidade.
   * 
   * @param {string} effect - Nome do efeito a ser removido.
   */
  removeEffectStatus(effect) {
    this.effectStatus = this.effectStatus.filter((e) => e !== effect);
  }

  /**
   * Verifica se a entidade possui um efeito de status específico.
   * 
   * @param {string} effect - Nome do efeito a ser verificado.
   * @returns {boolean} True se a entidade possui o efeito.
   */
  hasEffectStatus(effect) {
    return this.effectStatus.includes(effect);
  }

  /**
   * Obtém todas as estatísticas da entidade.
   * 
   * @returns {Object} Objeto contendo todas as estatísticas da entidade.
   */
  getStats() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      hp: this.hp,
      maxHp: this.maxHp,
      atk: this.atk,
      def: this.def,
      spd: this.spd,
      gold: this.gold,
      skills: this.skills,
      effectStatus: this.effectStatus,
      type: "Entity",
    };
  }

  /**
   * Converte a entidade para formato JSON.
   * 
   * @returns {Object} Objeto JSON representando a entidade.
   */
  toJSON() {
    return {
      __type: "Entity",
      ...this.getStats(),
    };
  }

  // fromJSON será implementado nas subclasses quando necessário
}

module.exports = Entity;
