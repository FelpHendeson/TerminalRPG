const chalk = require('chalk');

class InterfaceUtils {
  static drawBox(lines, squareSize = 0) {
    if (!Array.isArray(lines)) lines = [lines];

    // tamanho da caixa baseado na maior linha
    const maxTextLength = Math.max(...lines.map(line => line.length));
    const contentWidth = Math.max(maxTextLength, squareSize);

    const top = chalk.cyan.bold(`╔${'═'.repeat(contentWidth + 2)}╗`);
    const bottom = chalk.cyan.bold(`╚${'═'.repeat(contentWidth + 2)}╝`);

    console.log(top);

    lines.forEach(line => {
      const padding = contentWidth - line.length;
      console.log(
        chalk.cyan.bold('║') +
        ' ' +
        chalk.white.bold(line) +
        ' '.repeat(padding) +
        ' ' +
        chalk.cyan.bold('║')
      );
    });

    console.log(bottom);
  }
}

module.exports = InterfaceUtils;
