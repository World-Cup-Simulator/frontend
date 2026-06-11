import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { BaseLayout } from '../layout';
import { HomePage } from '../pages';
import { PredictPage } from '../pages/PredictPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <BaseLayout>
        <Outlet />
      </BaseLayout>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'predict',
        element: <PredictPage />,
      },
    ],
  },
]);

export const RouteHandler = () => {
  return <RouterProvider router={router} />;
};
