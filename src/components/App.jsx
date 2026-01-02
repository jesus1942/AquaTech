import React from 'react';
import { AppProvider } from '../hooks/useStore.jsx';
import AquaTechManager from './AquaTechManager';

export default function App() {
  return (
    <AppProvider>
      <AquaTechManager />
    </AppProvider>
  );
}
