// dataEditor.js - Editor de dados do jogo
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const InterfaceUtils = require('./utils/interfaceUtils');

class DataEditor {
  constructor() {
    this.dataPath = path.resolve(__dirname, 'data');
    this.currentData = {};
  }

  async start() {
    console.clear();
    InterfaceUtils.drawBox(['EDITOR DE DADOS DO JOGO'], 60);
    console.log();

    await this.showMainMenu();
  }

  async showMainMenu() {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'O que você deseja editar?',
        choices: [
          { name: '🗺️  Localizações', value: 'locations' },
          { name: '👥 NPCs', value: 'npcs' },
          { name: '📜 Quests', value: 'quests' },
          { name: '🐉 Monstros', value: 'monsters' },
          { name: '⚔️  Itens', value: 'items' },
          { name: '💾 Salvar Tudo', value: 'save' },
          { name: '❌ Sair', value: 'exit' }
        ]
      }
    ]);

    switch (choice) {
      case 'locations':
        await this.editLocations();
        break;
      case 'npcs':
        await this.editNPCs();
        break;
      case 'quests':
        await this.editQuests();
        break;
      case 'monsters':
        await this.editMonsters();
        break;
      case 'items':
        await this.editItems();
        break;
      case 'save':
        await this.saveAllData();
        break;
      case 'exit':
        console.log(chalk.green('Até logo!'));
        process.exit(0);
        break;
    }

    await this.showMainMenu();
  }

  async editLocations() {
    console.clear();
    InterfaceUtils.drawBox(['EDITOR DE LOCALIZAÇÕES'], 60);
    console.log();
    
    const locations = this.loadJSON('locations.json');
    const locationNames = Object.keys(locations.locations || {});
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: [
          { name: '➕ Adicionar Localização', value: 'add' },
          { name: '✏️  Editar Localização', value: 'edit' },
          { name: '🗑️  Remover Localização', value: 'remove' },
          { name: '⬅️  Voltar', value: 'back' }
        ]
      }
    ]);

    if (action === 'add') {
      await this.addLocation();
    } else if (action === 'edit' && locationNames.length > 0) {
      await this.editLocation(locationNames);
    } else if (action === 'remove' && locationNames.length > 0) {
      await this.removeLocation(locationNames);
    }
  }

  async addLocation() {
    const locationData = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Nome da localização:',
        validate: input => input.trim().length > 0 ? true : 'Nome é obrigatório'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Descrição:',
        validate: input => input.trim().length > 0 ? true : 'Descrição é obrigatória'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Tipo:',
        choices: ['village', 'forest', 'dungeon', 'city', 'road']
      },
      {
        type: 'number',
        name: 'level',
        message: 'Nível mínimo:',
        default: 1
      }
    ]);

    if (!this.currentData.locations) {
      this.currentData.locations = { locations: {} };
    }

    this.currentData.locations.locations[locationData.name] = {
      name: locationData.name,
      description: locationData.description,
      type: locationData.type,
      level: locationData.level,
      availableActions: [],
      connections: [],
      npcs: [],
      quests: [],
      monsters: []
    };

    console.log(chalk.green(`✓ Localização "${locationData.name}" adicionada!`));
  }

  async editLocation(locationNames) {
    const { selectedLocation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLocation',
        message: 'Qual localização editar?',
        choices: locationNames
      }
    ]);

    console.log(chalk.yellow(`Editando: ${selectedLocation}`));
    // Implementar edição detalhada aqui
  }

  async removeLocation(locationNames) {
    const { selectedLocation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLocation',
        message: 'Qual localização remover?',
        choices: locationNames
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Tem certeza que deseja remover "${selectedLocation}"?`,
        default: false
      }
    ]);

    if (confirm) {
      delete this.currentData.locations.locations[selectedLocation];
      console.log(chalk.green(`✓ Localização "${selectedLocation}" removida!`));
    }
  }

  async editNPCs() {
    console.clear();
    InterfaceUtils.drawBox(['EDITOR DE NPCs'], 60);
    console.log();
    console.log(chalk.gray('Funcionalidade em desenvolvimento...'));
    await this.wait(2000);
  }

  async editQuests() {
    console.clear();
    InterfaceUtils.drawBox(['EDITOR DE QUESTS'], 60);
    console.log();
    console.log(chalk.gray('Funcionalidade em desenvolvimento...'));
    await this.wait(2000);
  }

  async editMonsters() {
    console.clear();
    InterfaceUtils.drawBox(['EDITOR DE MONSTROS'], 60);
    console.log();
    console.log(chalk.gray('Funcionalidade em desenvolvimento...'));
    await this.wait(2000);
  }

  async editItems() {
    console.clear();
    InterfaceUtils.drawBox(['EDITOR DE ITENS'], 60);
    console.log();
    console.log(chalk.gray('Funcionalidade em desenvolvimento...'));
    await this.wait(2000);
  }

  async saveAllData() {
    try {
      // Salvar localizações
      if (this.currentData.locations) {
        this.saveJSON('locations.json', this.currentData.locations);
      }

      // Salvar outros dados quando implementados
      
      console.log(chalk.green('✓ Todos os dados salvos com sucesso!'));
    } catch (error) {
      console.log(chalk.red('Erro ao salvar dados:', error.message));
    }
  }

  loadJSON(filename) {
    const filePath = path.join(this.dataPath, filename);
    if (!fs.existsSync(filePath)) {
      return {};
    }
    
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Erro ao carregar ${filename}:`, error);
      return {};
    }
  }

  saveJSON(filename, data) {
    const filePath = path.join(this.dataPath, filename);
    
    // Criar diretório se não existir
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar o editor se este arquivo for executado diretamente
if (require.main === module) {
  const editor = new DataEditor();
  editor.start().catch(console.error);
}

module.exports = DataEditor;
