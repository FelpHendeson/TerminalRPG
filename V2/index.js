const InterfaceUtils = require('./utils/interfaceUtils');
const GameManager = require('./game/core/gameManager');

class TerminalRPG {
    constructor() {
        this.gameManager = new GameManager();
        this.isRunning = true;
    }

    async start() {
        InterfaceUtils.drawGameTitle(); // mostra o título já pronto
        await this.showMainMenu();
    }

    async showMainMenu() {
        interfaceUtils.drawBox(
            ['MENU PRINCIPAL'],
            60 // tamanho fixo
        );
        console.log(); // espaço extra

        const { choice } = await inquirer.prompt([
            {
            type: 'list',
            name: 'choice',
            message: 'Escolha uma opção:',
                choices: [
                    { name: ' Continuar História', value: 'story' },
                    { name: 'Mapa e Viagem', value: 'map' },
                    { name: 'Perfil do Personagem', value: 'profile' },
                    { name: 'Configurações', value: 'settings' },
                    { name: 'Salvar e Sair', value: 'exit' }
                ]
            }
        ]);

        switch (choice) {
            case 'story':
                // await this.gameManager.continueStory();
                break;
            case 'map':
                await this.showMapMenu();
                break;
            case 'profile':
                // await this.showProfileMenu();
                break;
            case 'settings':
                // await this.showSettingsMenu();
                break;
            case 'exit':
                // this.gameManager.saveGame();
                console.log(chalk.green('Jogo salvo! Até logo!'));
                this.isRunning = false;
                break;
        }
    }

    async showMapMenu() {
        interfaceUtils.drawBox(
            ['MAPA'],
            60 // tamanho fixo
        );
        console.log(); // espaço extra

        const locations = this.gameManager.getAvailableLocations();
        const currentLocation = this.gameManager.getCurrentLocation();
    }
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);

function start() {
    InterfaceUtils.drawGameTitle(); // mostra o título já pronto
}

start();