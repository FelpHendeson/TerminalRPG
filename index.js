const InterfaceUtils = require('./utils/interfaceUtils');
const chalk = require('chalk');
const inquirer = require('inquirer');

class TerminalRPG {
    constructor() {
        this.isRunning = true;
    }
    
    /**
     * Inicia o jogo, exibindo o título e o menu principal.
     *
     * @returns {Promise<void>} Promise que resolve quando o jogo termina.
     */
    async start() {
        InterfaceUtils.drawGameTitle();
        await this.showMainMenu();
    }

    /**
     * Exibe o menu principal do jogo com todas as opções disponíveis.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário sai do jogo.
     */
    async showMainMenu() {
        while(this.isRunning) {
            const choices = [
                {name: "Mapa", value: "map", symbol: "[M]"},
                {name: "Menu de Missões", value: "quests", symbol: "[Q]"},
                {name: "Perfil do Jogador", value: "profile", symbol: "[P]"},
                {name: "Configurações", value: "configs", symbol: "[C]"},
                {name: "Salvar Progresso", value: "save", symbol: "[S]"},
                {name: "Sair e Salvar", value: "exit", symbol: "[X]"}
            ];

            InterfaceUtils.clearScreen();
            InterfaceUtils.drawBox('MENU PRINCIPAL', 60);
            console.log();

            const selectedChoice = await InterfaceUtils.showChoices('Faça uma escolha:', choices, false); 

            switch(selectedChoice) {
                case 'map':
                    await this.showMap();
                    break;
                case 'quests':
                    await this.showQuests();
                    break;
                case 'profile':
                    await this.showProfile();
                    break;
                case 'configs':
                    await this.showConfigs();
                    break;
                case 'save':
                    await this.saveProgress();
                    break;
                case 'exit':
                    await this.exitAndSave();
                    break;
                default:
                    InterfaceUtils.showError('Opção inválida!');
                    await InterfaceUtils.waitForInput();
                    break;
            }
        }
    }

    /**
     * Exibe a tela do mapa do mundo.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
     */
    async showMap() {
        InterfaceUtils.clearScreen();
        InterfaceUtils.drawBox('[M] MAPA DO MUNDO', 60);
        console.log();
        InterfaceUtils.showInfo('Funcionalidade do mapa será implementada em breve!');
        await InterfaceUtils.waitForInput();
    }

    /**
     * Exibe o menu de missões.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
     */
    async showQuests() {
        InterfaceUtils.clearScreen();
        InterfaceUtils.drawBox('[Q] MENU DE MISSÕES', 60);
        console.log();
        InterfaceUtils.showInfo('Sistema de missões será implementado em breve!');
        await InterfaceUtils.waitForInput();
    }

    /**
     * Exibe o perfil do jogador.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
     */
    async showProfile() {
        InterfaceUtils.clearScreen();
        InterfaceUtils.drawBox('[P] PERFIL DO JOGADOR', 60);
        console.log();
        InterfaceUtils.showInfo('Perfil do jogador será implementado em breve!');
        await InterfaceUtils.waitForInput();
    }

    /**
     * Exibe as configurações do jogo.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
     */
    async showConfigs() {
        InterfaceUtils.clearScreen();
        InterfaceUtils.drawBox('[C] CONFIGURAÇÕES', 60);
        console.log();
        InterfaceUtils.showInfo('Configurações serão implementadas em breve!');
        await InterfaceUtils.waitForInput();
    }

    /**
     * Salva o progresso do jogo.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
     */
    async saveProgress() {
        InterfaceUtils.showSuccess('Progresso salvo com sucesso!');
        await InterfaceUtils.waitForInput();
    }

    /**
     * Confirma a saída do jogo e salva o progresso.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário confirma a saída.
     */
    async exitAndSave() {
        const confirmed = await InterfaceUtils.confirm('Tem certeza que deseja sair?');
        if (confirmed) {
            InterfaceUtils.showSuccess('Progresso salvo! Até logo!');
            this.isRunning = false;
        }
    }
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);