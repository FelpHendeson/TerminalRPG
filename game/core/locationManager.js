// game/core/locationManager.js

class LocationManager {
  constructor() {
    this.discoveredLocations = ['Vila Inicial'];
    this.locationProgress = {};
    
    this.locations = {
      'Vila Inicial': {
        name: 'Vila Inicial',
        description: 'Uma pequena vila acolhedora cercada por campos verdes. É aqui que sua jornada começou.',
        type: 'village',
        availableActions: ['talk', 'shop', 'quest'],
        connections: ['Floresta Verde', 'Estrada Principal'],
        level: 1
      },
      'Floresta Verde': {
        name: 'Floresta Verde',
        description: 'Uma densa floresta cheia de vida. O ar é fresco e você pode ouvir pássaros cantando.',
        type: 'forest',
        availableActions: ['explore', 'hunt', 'gather'],
        connections: ['Vila Inicial', 'Caverna dos Goblins'],
        level: 2
      },
      'Estrada Principal': {
        name: 'Estrada Principal',
        description: 'Uma estrada de terra que conecta várias regiões. Viajantes passam por aqui regularmente.',
        type: 'road',
        availableActions: ['travel', 'encounter'],
        connections: ['Vila Inicial', 'Cidade Mercante'],
        level: 1
      },
      'Caverna dos Goblins': {
        name: 'Caverna dos Goblins',
        description: 'Uma caverna escura e úmida. Dizem que goblins vivem aqui, mas também há tesouros escondidos.',
        type: 'dungeon',
        availableActions: ['explore', 'combat', 'loot'],
        connections: ['Floresta Verde'],
        level: 3,
        requires: { level: 2, quest: 'first_quest' }
      },
      'Cidade Mercante': {
        name: 'Cidade Mercante',
        description: 'Uma cidade movimentada onde mercadores de todo o reino se encontram para fazer negócios.',
        type: 'city',
        availableActions: ['shop', 'quest', 'guild'],
        connections: ['Estrada Principal'],
        level: 5,
        requires: { level: 3 }
      }
    };
  }

  getAvailableLocations(currentLocation) {
    const available = [];
    
    Object.values(this.locations).forEach(location => {
      // Verificar se o jogador pode acessar esta localização
      if (this.canAccessLocation(location)) {
        available.push(location);
      }
    });
    
    return available;
  }

  canAccessLocation(location) {
    // Verificar requisitos de nível e quests
    if (location.requires) {
      // Implementar verificação de requisitos
      return true; // Por enquanto, todas estão disponíveis
    }
    
    return true;
  }

  discoverLocation(locationName) {
    if (!this.discoveredLocations.includes(locationName)) {
      this.discoveredLocations.push(locationName);
    }
  }

  getLocationInfo(locationName) {
    return this.locations[locationName];
  }

  getProgress() {
    return {
      discoveredLocations: this.discoveredLocations,
      locationProgress: this.locationProgress
    };
  }

  loadProgress(progress) {
    if (progress) {
      this.discoveredLocations = progress.discoveredLocations || ['Vila Inicial'];
      this.locationProgress = progress.locationProgress || {};
    }
  }
}

module.exports = LocationManager;
