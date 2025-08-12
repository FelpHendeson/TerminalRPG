class Entity {
  constructor({
    name = "???",  // Nome do ser (desconhecido por padrão)
    level = 1,     // Nível
    maxHp = 100,   // Vida máxima
    atk = 10,      // Ataque
    def = 5,       // Defesa
    spd = 5,       // Velocidade
    gold = 0,      // Ouro
    skills = [],   // Lista de habilidades
  }) {
    this.name = name;
    this.level = level;

    this.maxHp = maxHp;
    this.hp = maxHp;

    this.atk = atk;
    this.def = def;
    this.spd = spd;

    this.gold = gold;
    this.skills = skills;

    this.effectStatus = []; // Lista de efeitos temporários
  }

  // Checa se está vivo
  isAlive() {
    return this.hp > 0;
  }

  // Receber dano
  receiveDamage(damage) {
    const effectiveDmg = Math.max(damage - this.def, 1); // mínimo de 1
    this.hp = Math.max(this.hp - effectiveDmg, 0);
    return effectiveDmg;
  }

  // Curar vida
  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  // Aplicar efeito temporário
  applyEffectStatus(effect) {
    if (!this.effectStatus.includes(effect)) {
      this.effectStatus.push(effect);
    }
  }

  // Remover efeito
  removeEffectStatus(effect) {
    this.effectStatus = this.effectStatus.filter(e => e !== effect);
  }

  // Verificar se tem efeito
  hasEffectStatus(effect) {
    return this.effectStatus.includes(effect);
  }

  // Retorna dados do ser
  getStats() {
    return {
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
    };
  }
}

module.exports = Entity;