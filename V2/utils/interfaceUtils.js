// utils/interfaceUtils.js
const chalk = require('chalk');

class InterfaceUtils {
  static drawBox(lines, squareSize = 0) {
    if (!Array.isArray(lines)) lines = [lines];

    const maxTextLength = Math.max(...lines.map(line => line.length));
    const contentWidth = Math.max(maxTextLength, squareSize);

    const top = chalk.cyan.bold(`╔${'═'.repeat(contentWidth + 2)}╗`);
    const bottom = chalk.cyan.bold(`╚${'═'.repeat(contentWidth + 2)}╝`);

    console.log(top);

    lines.forEach(line => {
      const totalPadding = contentWidth - line.length;
      const leftPadding = Math.floor(totalPadding / 2);
      const rightPadding = totalPadding - leftPadding;

      console.log(
        chalk.cyan.bold('║') +
        ' '.repeat(leftPadding + 1) +
        chalk.white.bold(line) +
        ' '.repeat(rightPadding + 1) +
        chalk.cyan.bold('║')
      );
    });

    console.log(bottom);
  }

  // Função extra só pra o título do jogo
  static drawGameTitle() {
    this.drawBox(
      ['TERMINAL RPG v2.0', 'Uma Aventura Linear'],
      60 // tamanho fixo
    );
    console.log(); // espaço extra
  }
}

module.exports = InterfaceUtils;
