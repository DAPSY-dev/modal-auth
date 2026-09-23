import { createBrowserRouter } from 'react-router';
import { App } from '../App';
import { UiPage } from '../pages/UiPage';

export const router = createBrowserRouter([
  { path: '/ui', element: <UiPage /> },
  { path: '*', element: <App /> },
]);
