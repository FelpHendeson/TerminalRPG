// game/core/saveManager.js
const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.resolve(__dirname, '..', '..', 'saves');
const GAME_SAVE_FILE = path.join(SAVE_DIR, 'game-save.json');

function ensureSaveDir() {
  if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
  }
}

function saveGame(data) {
  try {
    ensureSaveDir();
    const saveData = {
      ...data,
      lastSaved: new Date().toISOString(),
      version: '1.0.0'
    };
    fs.writeFileSync(GAME_SAVE_FILE, JSON.stringify(saveData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    return false;
  }
}

function loadGame() {
  try {
    if (!fs.existsSync(GAME_SAVE_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(GAME_SAVE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao carregar jogo:', error);
    return null;
  }
}

function deleteSave() {
  try {
    if (fs.existsSync(GAME_SAVE_FILE)) {
      fs.unlinkSync(GAME_SAVE_FILE);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao deletar save:', error);
    return false;
  }
}

function hasSave() {
  return fs.existsSync(GAME_SAVE_FILE);
}

module.exports = {
  saveGame,
  loadGame,
  deleteSave,
  hasSave,
  GAME_SAVE_FILE
};
