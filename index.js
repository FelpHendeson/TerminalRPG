const InterfaceUtils = require('./utils/interfaceUtils');
const GameManager = require('./managers/gameManager');

class TerminalRPG {
    constructor() {
        this.game = new GameManager();
        this.isRunning = true;
    }

    /**
     * Inicia o jogo, exibindo o título e o menu principal.
     *
     * @returns {Promise<void>} Promise que resolve quando o jogo termina.
     */
    async start() {
        InterfaceUtils.drawGameTitle();
        let choice = 'new';
        if (this.game.hasSave()) {
            choice = await InterfaceUtils.showChoices(
                'Encontramos um save. O que você quer fazer?',
                [
                    { name: 'Continuar', value: 'continue', symbol: '[C]' },
                    { name: 'Novo jogo', value: 'new', symbol: '[N]' },
                ],
                false
            );
        }

        if (choice === 'continue') {
            const ok = this.game.load();
            if (!ok) {
                InterfaceUtils.showError('Save corrompido ou inválido. Iniciando novo jogo.');
                await InterfaceUtils.waitForInput();
                await this.createNewCharacterFlow();
            }
        } else {
            await this.createNewCharacterFlow();
        }

        await this.showMainMenu();
    }

    /**
     * Exibe o menu principal do jogo com todas as opções disponíveis.
     *
     * @returns {Promise<void>} Promise que resolve quando o usuário sai do jogo.
     */
    async showMainMenu() {
        while (this.isRunning) {
            const choices = [
                { name: "Mapa", value: "map", symbol: "[M]" },
                { name: "Menu de Missões", value: "quests", symbol: "[Q]" },
                { name: "Perfil do Jogador", value: "profile", symbol: "[P]" },
                { name: "Configurações", value: "configs", symbol: "[C]" },
                { name: "Salvar Progresso", value: "save", symbol: "[S]" },
                { name: "Sair e Salvar", value: "exit", symbol: "[X]" }
            ];

            InterfaceUtils.clearScreen();
            InterfaceUtils.drawBox('MENU PRINCIPAL', 60);
            console.log();

            const selectedChoice = await InterfaceUtils.showChoices('Faça uma escolha:', choices, false);

            switch (selectedChoice) {
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
        const lines = this.game.getStatusLines();
        InterfaceUtils.drawBox(lines, 60);
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
        this.game.save();
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
            this.game.save();
            InterfaceUtils.showSuccess('Progresso salvo! Até logo!');
            this.isRunning = false;
        }
    }

    async createNewCharacterFlow() {
        const CharacterCreator = require('./core/characterCreator');
        const creator = new CharacterCreator();

        // OBS: teu CharacterCreator hoje imprime e determina traços.
        // Aqui eu assumo que ele retorna pelo menos { name, traits } ou só os traits + nome.
        // Para manter compatível, vamos perguntar o nome via creator e construir o Player.
        // Se o creator.start() já te devolve { name, traits }, use isso direto.

        const Player = require('./entities/player');

        // Fallback genérico: peça um nome se o creator não o retornar.
        let name = 'Herói';
        let traits = null;

        const result = await creator.start();
        if (result && typeof result === 'object') {
            if (result.name) name = result.name;
            if (result.traits) traits = result.traits;
        } else {
            // caso o creator retorne só traits (ou nada), pede nome aqui
            name = await InterfaceUtils.showInput('Qual será o nome do seu herói?', 'Herói', {
                minLength: 2, maxLength: 20, fieldName: 'nome'
            });
            traits = result;
        }

        // Constrói o Player e aplica bônus simples dos traços (se existirem)
        const player = new Player({ name });
        if (Array.isArray(traits)) {
            for (const t of traits) {
                const ef = t?.effects || {};
                if (ef.maxHp) player.maxHp += ef.maxHp, player.hp = player.maxHp;
                if (ef.atk) player.atk += ef.atk;
                if (ef.def) player.def += ef.def;
                if (ef.spd) player.spd += ef.spd;
                // você pode guardar flags como xpGain/questRewards em player também
            }
        }

        this.game.startNewGame(player);
        InterfaceUtils.showSuccess('A aventura começa!');
        await InterfaceUtils.waitForInput();
    }
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);