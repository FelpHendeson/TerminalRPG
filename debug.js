// debug.js - Script de debug para o Terminal RPG
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Debugger {
  constructor() {
    this.debugLog = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    this.debugLog.push(logEntry);
    
    switch (type) {
      case 'error':
        console.log(chalk.red(logEntry));
        break;
      case 'warning':
        console.log(chalk.yellow(logEntry));
        break;
      case 'success':
        console.log(chalk.green(logEntry));
        break;
      default:
        console.log(chalk.gray(logEntry));
    }
  }

  async debugCharacterCreation() {
    console.log(chalk.cyan.bold('=== DEBUG: CRIAÇÃO DE PERSONAGEM ==='));
    
    try {
      // 1. Verificar dependências
      this.log('Verificando dependências...', 'info');
      
      const requiredModules = [
        'chalk',
        'inquirer',
        './game/core/gameManager',
        './game/core/characterCreator',
        './game/entities/player',
        './game/core/saveManager',
        './game/core/dataManager'
      ];

      for (const module of requiredModules) {
        try {
          require(module);
          this.log(`✓ Módulo ${module} carregado com sucesso`, 'success');
        } catch (error) {
          this.log(`✗ Erro ao carregar ${module}: ${error.message}`, 'error');
          this.errors.push(`Falha ao carregar ${module}: ${error.message}`);
        }
      }

      // 2. Verificar arquivos de dados
      this.log('Verificando arquivos de dados...', 'info');
      const dataFiles = [
        'data/locations.json',
        'data/npcs.json',
        'data/quests.json',
        'data/monsters.json',
        'data/items.json'
      ];

      for (const file of dataFiles) {
        if (fs.existsSync(file)) {
          try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            this.log(`✓ Arquivo ${file} carregado (${Object.keys(data).length} chaves)`, 'success');
          } catch (error) {
            this.log(`✗ Erro ao parsear ${file}: ${error.message}`, 'error');
            this.errors.push(`JSON inválido em ${file}: ${error.message}`);
          }
        } else {
          this.log(`✗ Arquivo ${file} não encontrado`, 'error');
          this.errors.push(`Arquivo ${file} não existe`);
        }
      }

      // 3. Verificar sistema de save
      this.log('Verificando sistema de save...', 'info');
      const saveFile = 'saves/game-save.json';
      if (fs.existsSync(saveFile)) {
        try {
          const saveData = JSON.parse(fs.readFileSync(saveFile, 'utf8'));
          this.log(`✓ Save encontrado (player: ${saveData.player ? 'sim' : 'não'})`, 'success');
          
          if (saveData.player) {
            this.log(`  - Nome: ${saveData.player.name}`, 'info');
            this.log(`  - Nível: ${saveData.player.level}`, 'info');
            this.log(`  - HP: ${saveData.player.hp}/${saveData.player.maxHp}`, 'info');
          }
        } catch (error) {
          this.log(`✗ Erro ao carregar save: ${error.message}`, 'error');
          this.errors.push(`Save corrompido: ${error.message}`);
        }
      } else {
        this.log('ℹ️  Nenhum save encontrado (normal para primeiro uso)', 'warning');
      }

      // 4. Testar criação de personagem
      this.log('Testando criação de personagem...', 'info');
      
      try {
        const Player = require('./game/entities/player');
        const CharacterCreator = require('./game/core/characterCreator');
        
        // Criar personagem de teste
        const testTraits = [
          { name: "Teste", description: "Traço de teste", effects: { atk: 5 } }
        ];
        
        const testPlayer = new Player({
          name: 'Teste',
          level: 1,
          maxHp: 100,
          atk: 10,
          def: 5,
          spd: 5,
          gold: 50,
          xp: 0,
          xpToLevelUp: 100,
          inventory: [],
          traits: testTraits
        });
        
        this.log(`✓ Personagem de teste criado: ${testPlayer.name}`, 'success');
        this.log(`  - HP: ${testPlayer.hp}/${testPlayer.maxHp}`, 'info');
        this.log(`  - Ataque: ${testPlayer.atk}`, 'info');
        
        // Testar serialização
        const playerJSON = testPlayer.toJSON();
        this.log(`✓ Serialização OK (${Object.keys(playerJSON).length} propriedades)`, 'success');
        
        // Testar deserialização
        const restoredPlayer = Player.fromJSON(playerJSON);
        this.log(`✓ Deserialização OK: ${restoredPlayer.name}`, 'success');
        
      } catch (error) {
        this.log(`✗ Erro na criação de personagem: ${error.message}`, 'error');
        this.log(`  Stack: ${error.stack}`, 'error');
        this.errors.push(`Falha na criação de personagem: ${error.message}`);
      }

      // 5. Testar GameManager
      this.log('Testando GameManager...', 'info');
      
      try {
        const GameManager = require('./game/core/gameManager');
        const gameManager = new GameManager();
        
        this.log(`✓ GameManager criado`, 'success');
        this.log(`  - Has character: ${gameManager.hasCharacter()}`, 'info');
        this.log(`  - Current location: ${gameManager.getCurrentLocation()}`, 'info');
        
        // Testar setPlayer
        gameManager.setPlayer(testPlayer);
        this.log(`✓ Player definido no GameManager`, 'success');
        
        // Testar save
        const saveResult = gameManager.saveGame();
        this.log(`✓ Save testado: ${saveResult ? 'sucesso' : 'falha'}`, saveResult ? 'success' : 'error');
        
      } catch (error) {
        this.log(`✗ Erro no GameManager: ${error.message}`, 'error');
        this.errors.push(`Falha no GameManager: ${error.message}`);
      }

      // 6. Resumo
      console.log(chalk.cyan.bold('\n=== RESUMO DO DEBUG ==='));
      
      if (this.errors.length === 0) {
        this.log('🎉 Sistema funcionando corretamente!', 'success');
      } else {
        this.log(`⚠️  Encontrados ${this.errors.length} problemas:`, 'warning');
        this.errors.forEach((error, index) => {
          console.log(chalk.red(`  ${index + 1}. ${error}`));
        });
      }

      // 7. Salvar log de debug
      const debugLogFile = 'debug.log';
      const logContent = this.debugLog.join('\n');
      fs.writeFileSync(debugLogFile, logContent, 'utf8');
      this.log(`Log de debug salvo em: ${debugLogFile}`, 'info');

    } catch (error) {
      this.log(`Erro crítico no debug: ${error.message}`, 'error');
      this.log(`Stack: ${error.stack}`, 'error');
    }
  }

  async debugSaveSystem() {
    console.log(chalk.cyan.bold('=== DEBUG: SISTEMA DE SAVE ==='));
    
    try {
      const { saveGame, loadGame, hasSave } = require('./game/core/saveManager');
      
      // Testar hasSave
      const hasSaveResult = hasSave();
      this.log(`hasSave(): ${hasSaveResult}`, 'info');
      
      // Testar loadGame
      const loadedData = loadGame();
      this.log(`loadGame(): ${loadedData ? 'dados carregados' : 'null'}`, 'info');
      
      if (loadedData) {
        this.log(`  - Player: ${loadedData.player ? 'sim' : 'não'}`, 'info');
        this.log(`  - Settings: ${Object.keys(loadedData.settings || {}).length} configurações`, 'info');
        this.log(`  - Location: ${loadedData.currentLocation}`, 'info');
      }
      
      // Testar saveGame
      const testData = {
        player: {
          name: 'Teste',
          level: 1,
          hp: 100,
          maxHp: 100
        },
        settings: { gameMode: 'active' },
        currentLocation: 'Vila Inicial',
        timestamp: Date.now()
      };
      
      const saveResult = saveGame(testData);
      this.log(`saveGame(): ${saveResult ? 'sucesso' : 'falha'}`, saveResult ? 'success' : 'error');
      
    } catch (error) {
      this.log(`Erro no sistema de save: ${error.message}`, 'error');
    }
  }
}

// Executar debug se este arquivo for executado diretamente
if (require.main === module) {
  const debugInstance = new Debugger();
  
  const args = process.argv.slice(2);
  if (args.includes('--save')) {
    debugInstance.debugSaveSystem();
  } else {
    debugInstance.debugCharacterCreation();
  }
}

module.exports = Debugger;