// saveManager.js
const fs = require('fs');
const path = require('path');

class SaveManager {
  constructor(options = {}) {
    this.saveDir = options.saveDir || path.resolve(__dirname, 'saves'); // <== pasta "saves" na raiz do projeto
    this.maxSlots = 3;
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.saveDir)) fs.mkdirSync(this.saveDir, { recursive: true });
  }

  slotPath(slot) {
    return path.join(this.saveDir, `slot${slot}.json`);
  }

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

  hasAnySave() {
    return this.listSlots().some(s => s.exists);
  }

  load(slot) {
    const p = this.slotPath(slot);
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
      return null;
    }
  }

  save(slot, data) {
    this.ensureDir();
    const p = this.slotPath(slot);
    const payload = { ...data, savedAt: Date.now(), version: (data?.version ?? 1) };
    fs.writeFileSync(p, JSON.stringify(payload, null, 2), 'utf-8');
    return true;
  }

  delete(slot) {
    const p = this.slotPath(slot);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

module.exports = SaveManager;
