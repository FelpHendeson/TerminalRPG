// game/core/locationManager.js

class LocationManager {
  constructor() {
    this.discoveredLocations = ['Vila Inicial'];
    this.locationProgress = {};
  }

  getAvailableLocations(currentLocation, dataManager) {
    const allLocations = dataManager.getLocations();
    const available = [];
    
    Object.values(allLocations).forEach(location => {
      // Verificar se o jogador pode acessar esta localização
      if (this.canAccessLocation(location, dataManager)) {
        available.push(location);
      }
    });
    
    return available;
  }

  canAccessLocation(location, dataManager) {
    // Verificar requisitos de nível e quests
    if (location.requires) {
      // Por enquanto, todas estão disponíveis
      // Implementar verificação de requisitos quando necessário
      return true;
    }
    
    return true;
  }

  discoverLocation(locationName) {
    if (!this.discoveredLocations.includes(locationName)) {
      this.discoveredLocations.push(locationName);
    }
  }

  getLocationInfo(locationName, dataManager) {
    return dataManager.getLocation(locationName);
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
