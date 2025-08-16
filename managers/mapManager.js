// managers/mapManager.js
const fs = require('fs');
const path = require('path');

/**
 * Tipos possíveis de nós na hierarquia
 * @typedef {'world'|'continent'|'empire'|'kingdom'|'domain'|'city'|'village'|'local'} NodeType
 *
 * @typedef {Object} NodeBase
 * @property {string} id
 * @property {NodeType} type
 * @property {string} name
 * @property {string} [description]
 *
 * @typedef {NodeBase & { parentPath: string[] }} IndexedNode
 *
 * @typedef {Object} LocationPath
 * @property {string} worldId
 * @property {string} continentId
 * @property {string} [empireId]
 * @property {string} [kingdomId]
 * @property {string} [domainId]
 * @property {string} [cityId]
 * @property {string} [villageId]
 * @property {string} [localId]
 */

class MapManager {
  /**
   * @param {{ dataFile?: string }=} opts
   */
  constructor({ dataFile } = {}) {
    this.dataFile = dataFile || path.resolve(__dirname, '../data/worldMap.json');
    this.data = null;         // json raw
    this.index = new Map();   // key: composite id path string -> IndexedNode
    this.idIndex = new Map(); // key: id -> IndexedNode (último id visto; para getLocation por id simples)
    this.breadcrumbs = new Map(); // key: pathKey -> array<IndexedNode>
    this.load();
  }

  // ===== leitura e indexação =====
  load() {
    if (!fs.existsSync(this.dataFile)) {
      throw new Error(`[MapManager] Arquivo não encontrado: ${this.dataFile}`);
    }
    this.data = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
    this._buildIndex();
  }

  ensureDefaultLocation(gameManager) {
    const hasLoc = gameManager?.flags?.location;
    if (hasLoc) return;
  
    // pega o 1º mundo/continente/… disponível e fixa na 1ª vila (ou local) encontrada
    const worlds = this.getAllLocations('world');
    if (!worlds.length) return;
  
    // sobe/ desce até um nível “jogável”
    const w = worlds[0];
    const continents = this.listChildren(w, ['continent']);
    const c = continents[0];
    const empires = this.listChildren(c, ['empire']);
    const e = empires[0];
    const kingdoms = this.listChildren(e, ['kingdom']);
    const k = kingdoms[0];
    const domains = this.listChildren(k, ['domain']);
    const d = domains[0];
    const cities = this.listChildren(d, ['city']);
    const ci = cities[0];
    const villages = this.listChildren(ci, ['village']);
    const v = villages[0] || ci || d || k || e || c || w;
  
    this.setCurrentLocation(gameManager, v);
  }

  _buildIndex() {
    this.index.clear();
    this.idIndex.clear();
    this.breadcrumbs.clear();

    const worlds = Array.isArray(this.data?.worlds) ? this.data.worlds : [];
    for (const w of worlds) {
      const wNode = this._mkNode('world', w, []);
      this._addToIndexes(wNode);

      for (const c of w.continents ?? []) {
        const cNode = this._mkNode('continent', c, [w.id]);
        this._addToIndexes(cNode);

        for (const e of c.empires ?? []) {
          const eNode = this._mkNode('empire', e, [w.id, c.id]);
          this._addToIndexes(eNode);

          for (const k of e.kingdoms ?? []) {
            const kNode = this._mkNode('kingdom', k, [w.id, c.id, e.id]);
            this._addToIndexes(kNode);

            for (const d of k.domains ?? []) {
              const dNode = this._mkNode('domain', d, [w.id, c.id, e.id, k.id]);
              this._addToIndexes(dNode);

              for (const ci of d.cities ?? []) {
                const ciNode = this._mkNode('city', ci, [w.id, c.id, e.id, k.id, d.id]);
                this._addToIndexes(ciNode);

                for (const v of ci.villages ?? []) {
                  const vNode = this._mkNode('village', v, [w.id, c.id, e.id, k.id, d.id, ci.id]);
                  this._addToIndexes(vNode);

                  for (const l of v.locals ?? []) {
                    const lNode = this._mkNode('local', l, [w.id, c.id, e.id, k.id, d.id, ci.id, v.id]);
                    this._addToIndexes(lNode);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  _mkNode(type, raw, parentPath) {
    /** @type {IndexedNode} */
    return {
      id: raw.id,
      type,
      name: raw.name,
      description: raw.description ?? '',
      parentPath: parentPath.slice()
    };
  }

  _keyFromPathList(list) {
    return list.join('>');
  }

  _keyFromNode(node) {
    return this._keyFromPathList([...node.parentPath, node.id]);
  }

  _addToIndexes(node) {
    const key = this._keyFromNode(node);
    this.index.set(key, node);
    this.idIndex.set(node.id, node);

    // build breadcrumbs for this path
    const pathList = [...node.parentPath, node.id];
    const crumbs = [];
    for (let i = 0; i < pathList.length; i++) {
      const subKey = this._keyFromPathList(pathList.slice(0, i + 1));
      const subNode = this.index.get(subKey) || this.idIndex.get(pathList[i]); // in case of order issues
      if (subNode) crumbs.push(subNode);
    }
    this.breadcrumbs.set(key, crumbs);
  }

  // ===== API requerida =====

  /**
   * Define a localização atual do jogador no GameManager.
   * Aceita: objeto path {worldId, continentId, ...} OU um id único/absoluto.
   *
   * @param {import('./gameManager')} gameManager
   * @param {LocationPath|string} pathLike
   * @returns {IndexedNode} nó final (ex.: vila ou local) validado
   */
  setCurrentLocation(gameManager, pathLike) {
    const node = this._resolveNode(pathLike);
    if (!node) throw new Error('[MapManager.setCurrentLocation] Local não encontrado.');

    // monta um path completo a partir dos breadcrumbs
    const crumbs = this.breadcrumbs.get(this._keyFromNode(node)) || [];
    const full = this._locationFromCrumbs(crumbs);

    // persiste no GM
    gameManager.flags = gameManager.flags || {};
    gameManager.flags.location = full;
    return node;
  }

  /**
   * Retorna o nó atual onde o jogador está (resolvido a partir de gameManager.flags.location).
   * @param {import('./gameManager')} gameManager
   * @returns {IndexedNode|null}
   */
  getCurrentLocation(gameManager) {
    const loc = gameManager?.flags?.location;
    if (!loc) return null;
    return this._resolveNode(loc);
  }

  /**
   * Retorna todas as localizações indexadas (ou filtradas por tipo).
   * @param {NodeType=} type
   * @returns {IndexedNode[]}
   */
  getAllLocations(type) {
    const all = Array.from(this.index.values());
    return type ? all.filter(n => n.type === type) : all;
  }

  /**
   * Retorna uma localização específica por caminho/objeto/ID.
   * @param {LocationPath|string} pathLike
   * @returns {IndexedNode|null}
   */
  getLocation(pathLike) {
    return this._resolveNode(pathLike);
  }

  // ===== helpers =====

  /**
   * Lista filhos diretos de um nó (para montar menus de navegação).
   * @param {LocationPath|string} pathLike
   * @param {NodeType[]=} filterTypes
   * @returns {IndexedNode[]}
   */
  listChildren(pathLike, filterTypes) {
    const node = this._resolveNode(pathLike);
    if (!node) return [];
    const baseKey = this._keyFromNode(node);

    // filhos = todos que possuem parentPath = parentPath do filho == [ ...node.parentPath, node.id ]
    const parentList = [...node.parentPath, node.id];
    const all = Array.from(this.index.values()).filter(n => {
      const p = n.parentPath;
      if (p.length !== parentList.length) return false;
      for (let i = 0; i < p.length; i++) if (p[i] !== parentList[i]) return false;
      return true;
    });

    return filterTypes?.length ? all.filter(n => filterTypes.includes(n.type)) : all;
  }

  /**
   * Resolve qualquer formato para um nó indexado.
   * - se sting (id): tenta por id; se contiver '>' entende como caminho concatenado por ids
   * - se objeto: usa ids do objeto para construir caminho
   * @param {LocationPath|string} pathLike
   * @returns {IndexedNode|null}
   */
  _resolveNode(pathLike) {
    // proteção: null/undefined
    if (!pathLike) return null;
  
    // SE FOR UM NÓ INDEXADO (id + type + parentPath), aceite diretamente
    if (
      typeof pathLike === 'object' &&
      pathLike.id && pathLike.type && Array.isArray(pathLike.parentPath)
    ) {
      const key = this._keyFromPathList([...pathLike.parentPath, pathLike.id]);
      return this.index.get(key) || pathLike;
    }
  
    // string?
    if (typeof pathLike === 'string') {
      if (pathLike.includes('>')) {
        const key = pathLike;
        return this.index.get(key) || null;
      }
      return this.idIndex.get(pathLike) || null;
    }
  
    // objeto-path { worldId, continentId, ... }
    const parts = [
      pathLike.worldId,
      pathLike.continentId,
      pathLike.empireId,
      pathLike.kingdomId,
      pathLike.domainId,
      pathLike.cityId,
      pathLike.villageId,
      pathLike.localId
    ].filter(Boolean);
  
    const key = this._keyFromPathList(parts);
    return this.index.get(key) || null;
  }

  /**
   * Cria um objeto {worldId, continentId, ...} a partir dos breadcrumbs.
   * @param {IndexedNode[]} crumbs
   * @returns {LocationPath}
   */
  _locationFromCrumbs(crumbs) {
    /** @type {LocationPath} */
    const loc = {
      worldId: '',
      continentId: ''
    };
    for (const n of crumbs) {
      switch (n.type) {
        case 'world': loc.worldId = n.id; break;
        case 'continent': loc.continentId = n.id; break;
        case 'empire': loc.empireId = n.id; break;
        case 'kingdom': loc.kingdomId = n.id; break;
        case 'domain': loc.domainId = n.id; break;
        case 'city': loc.cityId = n.id; break;
        case 'village': loc.villageId = n.id; break;
        case 'local': loc.localId = n.id; break;
      }
    }
    return loc;
  }
}

module.exports = MapManager;
