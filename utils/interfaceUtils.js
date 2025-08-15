const chalk = require("chalk");
const inquirer = require("inquirer");

class InterfaceUtils {
  /**
   * Desenha uma caixa no terminal com bordas e texto centralizado.
   *
   * @param {string|string[]} lines - Texto ou lista de linhas a serem exibidas dentro da caixa.
   * @param {number} [squareSize=0] - Largura mínima da caixa (se for maior que o texto).
   * @returns {void} Não retorna nada; apenas imprime no console.
   */
  static drawBox(lines, squareSize = 0) {
    if (!Array.isArray(lines)) lines = [lines];

    const maxTextLength = Math.max(...lines.map((line) => line.length));
    const contentWidth = Math.max(maxTextLength, squareSize);

    const top = chalk.cyan.bold(`╔${"═".repeat(contentWidth + 2)}╗`);
    const bottom = chalk.cyan.bold(`╚${"═".repeat(contentWidth + 2)}╝`);

    console.log(top);

    lines.forEach((line) => {
      const totalPadding = contentWidth - line.length;
      const leftPadding = Math.floor(totalPadding / 2);
      const rightPadding = totalPadding - leftPadding;

      console.log(
        chalk.cyan.bold("║") +
          " ".repeat(leftPadding + 1) +
          chalk.white.bold(line) +
          " ".repeat(rightPadding + 1) +
          chalk.cyan.bold("║")
      );
    });

    console.log(bottom);
  }

  /**
   * Exibe o título fixo do jogo no terminal.
   *
   * @returns {void} Não retorna nada; apenas imprime no console.
   */
  static drawGameTitle() {
    this.drawBox(
      ["TERMINAL RPG"],
      60 // tamanho fixo
    );
    console.log(); // espaço extra
  }

  /**
   * Exibe uma lista de escolhas para o usuário com símbolos ASCII compatíveis.
   *
   * @param {string} title - Título/mensagem a ser exibida acima das opções.
   * @param {Array<Object>} choices - Array de objetos com as opções disponíveis.
   * @param {string} choices[].name - Nome/texto visível da opção.
   * @param {string} choices[].value - Valor retornado quando a opção é selecionada.
   * @param {string} [choices[].symbol] - Símbolo ASCII opcional para a opção.
   * @param {boolean} [showBackOption=true] - Se deve mostrar opção de voltar.
   * @returns {Promise<string>} Promise que resolve com o valor da opção selecionada.
   * @example
   * const choices = [
   *   { name: "Opção 1", value: "opt1", symbol: "[1]" },
   *   { name: "Opção 2", value: "opt2", symbol: "[2]" }
   * ];
   * const selected = await InterfaceUtils.showChoices("Escolha uma opção:", choices);
   * // selected será "opt1" ou "opt2" dependendo da escolha do usuário
   */
  static async showChoices(title, choices, showBackOption = true) {
    // Símbolos ASCII compatíveis com qualquer terminal
    const symbols = {
      map: '[M]',
      quests: '[Q]',
      profile: '[P]',
      configs: '[C]',
      save: '[S]',
      exit: '[X]',
      back: '[B]'
    };

    // Adicionar símbolos padrão se não fornecidos
    const enhancedChoices = choices.map(choice => ({
      ...choice,
      name: choice.symbol ? `${choice.symbol} ${choice.name}` : `> ${choice.name}`
    }));

    // Adicionar opção de voltar se solicitado
    if (showBackOption) {
      enhancedChoices.push({
        name: `${symbols.back} Voltar`,
        value: 'back'
      });
    }

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: chalk.cyan.bold(title),
        choices: enhancedChoices,
        pageSize: 10, // Limita o número de opções por página
      },
    ]);

    return choice;
  }

  /**
   * Exibe uma mensagem de confirmação.
   *
   * @param {string} message - Mensagem a ser exibida.
   * @param {string} [defaultValue='n'] - Valor padrão (y/n).
   * @returns {Promise<boolean>} Promise que resolve com true/false.
   * @example
   * const confirmed = await InterfaceUtils.confirm('Tem certeza que deseja sair?');
   * if (confirmed) {
   *   // Usuário confirmou
   * }
   */
  static async confirm(message, defaultValue = 'n') {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: chalk.yellow.bold(message),
        default: defaultValue === 'y'
      }
    ]);
    return confirmed;
  }

  /**
   * Exibe uma mensagem de sucesso usando símbolos ASCII.
   *
   * @param {string} message - Mensagem a ser exibida.
   * @returns {void} Não retorna nada; apenas imprime no console.
   * @example
   * InterfaceUtils.showSuccess('Progresso salvo com sucesso!');
   */
  static showSuccess(message) {
    console.log(chalk.green.bold(`[+] ${message}`));
  }

  /**
   * Exibe uma mensagem de erro usando símbolos ASCII.
   *
   * @param {string} message - Mensagem a ser exibida.
   * @returns {void} Não retorna nada; apenas imprime no console.
   * @example
   * InterfaceUtils.showError('Erro ao salvar progresso!');
   */
  static showError(message) {
    console.log(chalk.red.bold(`[!] ${message}`));
  }

  /**
   * Exibe uma mensagem de informação usando símbolos ASCII.
   *
   * @param {string} message - Mensagem a ser exibida.
   * @returns {void} Não retorna nada; apenas imprime no console.
   * @example
   * InterfaceUtils.showInfo('Funcionalidade será implementada em breve!');
   */
  static showInfo(message) {
    console.log(chalk.blue.bold(`[i] ${message}`));
  }

  /**
   * Limpa a tela e exibe o cabeçalho do jogo.
   *
   * @returns {void} Não retorna nada; apenas limpa a tela e imprime o título.
   */
  static clearScreen() {
    console.clear();
    this.drawGameTitle();
  }

  /**
   * Aguarda o usuário pressionar Enter para continuar.
   *
   * @param {string} [message='Pressione Enter para continuar...'] - Mensagem personalizada.
   * @returns {Promise<void>} Promise que resolve quando o usuário pressiona Enter.
   * @example
   * await InterfaceUtils.waitForInput('Pressione Enter para voltar ao menu...');
   */
  static async waitForInput(message = 'Pressione Enter para continuar...') {
    console.log();
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray(message)
      }
    ]);
  }
}

module.exports = InterfaceUtils;
