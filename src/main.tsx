import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router/dom';
import { createAppStore } from './app/store';
import { router } from './app/router';
import { startAuth } from './features/auth/startAuth';

const store = createAppStore();
const stopAuth = startAuth(store);
if (import.meta.hot) import.meta.hot.dispose(stopAuth);

createRoot(document.getElementById('root')!).render(
  <StrictMode><Provider store={store}><RouterProvider router={router} /></Provider></StrictMode>,
);
