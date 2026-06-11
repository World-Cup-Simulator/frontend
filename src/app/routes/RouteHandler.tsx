import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { BaseLayout } from '../layout';
import { HomePage, PredictPage, SimulationPage } from '../pages';

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
      {
        path: 'simulation',
        element: <SimulationPage />,
      },
    ],
  },
]);

export const RouteHandler = () => {
  return <RouterProvider router={router} />;
};
