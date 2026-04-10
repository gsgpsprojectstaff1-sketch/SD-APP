
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import PowerProvider from './PowerProvider.tsx';
import { RefreshProvider } from './RefreshContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PowerProvider>
      <RefreshProvider>
        <App />
      </RefreshProvider>
    </PowerProvider>
  </StrictMode>,
);