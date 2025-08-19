// managers/timeManager.js
const DEFAULT_MS_PER_HOUR = 60000; // 1 minuto real = 1 hora no jogo

class TimeManager {
  constructor({ msPerHour = DEFAULT_MS_PER_HOUR } = {}) {
    this.msPerHour = msPerHour;
    this.timer = null;
  }

  start(game) {
    if (!game.flags.time) game.flags.time = { hour: 8 };
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.advanceHour(game, 1), this.msPerHour);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  getHour(game) {
    return (game.flags.time?.hour || 0) % 24;
  }

  advanceHour(game, hours = 1) {
    game.flags.time = game.flags.time || { hour: 0 };
    game.flags.time.hour = (game.flags.time.hour + hours) % 24;
  }

  isDay(game) {
    const h = this.getHour(game);
    return h >= 6 && h < 18;
  }

  getFormattedTime(game) {
    const h = this.getHour(game).toString().padStart(2, '0');
    return `${h}:00`;
  }
}

module.exports = TimeManager;
