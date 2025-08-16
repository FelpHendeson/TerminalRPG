// saveManager.js
const fs = require('fs');
const path = require('path');

/**
 * Classe responsável por gerenciar o sistema de salvamento e carregamento do jogo.
 * Fornece métodos para salvar, carregar, deletar e verificar arquivos de save em slots.
 */
class SaveManager {
  /**
   * Construtor da classe SaveManager.
   * 
   * @param {Object} options - Opções de configuração do SaveManager.
   * @param {string} [options.saveDir] - Diretório onde os saves serão armazenados.
   */
  constructor(options = {}) {
    this.saveDir = options.saveDir || path.resolve(__dirname, 'saves'); // <== pasta "saves" na raiz do projeto
    this.maxSlots = 3;
    this.ensureDir();
  }

  /**
   * Garante que o diretório de saves existe, criando-o se necessário.
   * 
   * @returns {boolean} True se o diretório existe ou foi criado com sucesso.
   */
  ensureDir() {
    if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
  }

  /**
   * Obtém o caminho completo para um slot específico.
   * 
   * @param {number} slot - Número do slot.
   * @returns {string} Caminho completo do arquivo de save do slot.
   */
  slotPath(slot) {
    return path.join(this.saveDir, `slot${slot}.json`);
  }

  /**
   * Lista todos os slots disponíveis com suas informações.
   * 
   * @returns {Array<Object>} Array de objetos contendo informações dos slots.
   * @returns {number} returns[].slot - Número do slot.
   * @returns {boolean} returns[].exists - Se o slot possui um save.
   * @returns {string} [returns[].name] - Nome do personagem no save.
   * @returns {number} [returns[].level] - Nível do personagem no save.
   * @returns {string} [returns[].lastSaved] - Data do último save.
   */
  listSlots() {
    const slots = [];
    for (let s = 1; s <= this.maxSlots; s++) {
      const p = this.slotPath(s);
      if (fs.existsSync(p)) {
        try {
          const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
          slots.push({
            slot: s,
            exists: true,
            name: raw?.player?.name || `Slot ${s}`,
            level: raw?.player?.level || 1,
            lastSaved: raw?.savedAt || null,
          });
        } catch {
          slots.push({ slot: s, exists: false });
        }
      } else {
        slots.push({ slot: s, exists: false });
      }
    }
    return slots;
  }

  /**
   * Verifica se existe pelo menos um save em qualquer slot.
   * 
   * @returns {boolean} True se existe pelo menos um save.
   */
  hasAnySave() {
    return this.listSlots().some(s => s.exists);
  }

  /**
   * Carrega os dados de um slot específico.
   * 
   * @param {number} slot - Número do slot a ser carregado.
   * @returns {Object|null} Dados do save ou null se não existir ou houver erro.
   */
  load(slot) {
    const p = this.slotPath(slot);
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Salva dados em um slot específico.
   * 
   * @param {number} slot - Número do slot onde salvar.
   * @param {Object} data - Dados a serem salvos.
   * @returns {boolean} True se o save foi realizado com sucesso.
   */
  save(slot, data) {
    this.ensureDir();
    const p = this.slotPath(slot);
    const payload = { ...data, savedAt: Date.now(), version: (data?.version ?? 1) };
    fs.writeFileSync(p, JSON.stringify(payload, null, 2), 'utf-8');
    return true;
  }

  /**
   * Deleta um save de um slot específico.
   * 
   * @param {number} slot - Número do slot a ser deletado.
   * @returns {boolean} True se o arquivo foi deletado com sucesso.
   */
  delete(slot) {
    const p = this.slotPath(slot);
    if (fs.existsSync(p)) { fs.unlinkSync(p); return true; }
    return false;
  }
}

module.exports = SaveManager;
