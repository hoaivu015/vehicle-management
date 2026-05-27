import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './shared/design-system/ErrorBoundary';
import { DependencyProvider } from './shared/ioc/DependencyContext';
import { initSentry } from './shared/infrastructure/monitoring/SentryProvider';
import './index.css';

initSentry();


import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <DependencyProvider>
          <App />
        </DependencyProvider>
      </BrowserRouter>

    </ErrorBoundary>
  </StrictMode>,
);
