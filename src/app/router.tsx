import { createBrowserRouter } from 'react-router';
import { App } from '../App';
import { UiPage } from '../pages/UiPage';
import { UiModalsPage } from '../pages/UiModalsPage';
import { UiButtonsPage } from '../pages/UiButtonsPage';
import { UiInputsPage } from '../pages/UiInputsPage';
import { UiIconsPage } from '../pages/UiIconsPage';

export const router = createBrowserRouter([
  { path: '/ui', element: <UiPage /> },
  { path: '/ui/modals', element: <UiModalsPage /> },
  { path: '/ui/buttons', element: <UiButtonsPage /> },
  { path: '/ui/inputs', element: <UiInputsPage /> },
  { path: '/ui/icons', element: <UiIconsPage /> },
  { path: '*', element: <App /> },
]);
