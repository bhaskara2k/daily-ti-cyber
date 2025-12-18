import React, { useState } from 'react';
import { Sector } from './types';
import { SectorSelector } from './components/SectorSelector';
import { RouletteGame } from './components/RouletteGame';

const App: React.FC = () => {
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);

  if (currentSector) {
    return (
      <RouletteGame
        sector={currentSector}
        onBack={() => setCurrentSector(null)}
      />
    );
  }

  return (
    <SectorSelector
      onSelectSector={setCurrentSector}
    />
  );
};

export default App;
