// game/core/saveManager.js
const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.resolve(__dirname, '..', '..', 'saves');
const WORLD_FILE = path.join(SAVE_DIR, 'world-save.json');

function ensureSaveDir() {
  if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
}

function saveWorld(data) {
  ensureSaveDir();
  fs.writeFileSync(WORLD_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function loadWorld() {
  if (!fs.existsSync(WORLD_FILE)) return null;
  const raw = fs.readFileSync(WORLD_FILE, 'utf8');
  return JSON.parse(raw);
}

module.exports = {
  saveWorld,
  loadWorld,
  WORLD_FILE
};
