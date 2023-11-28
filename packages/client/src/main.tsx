import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Root, loader as rootLoader } from './routes/root';
import GalleryList, {
  loader as galleryListLoader,
} from './components/GalleryList';
import LoginView from './components/LoginView';
import About from './routes/about';
import GalleryView, {
  loader as galleryViewLoader,
} from './components/GalleryView';
import ImageView, { loader as imageViewLoader } from './components/ImageView';
import TagSearchView, {
  loader as tagSearchViewLoader,
} from './components/TagSearchView';
import { AdminIndex } from './components/admin/Index';
import { NotFound } from './routes/error';

import uiState from './UiState';
import { AdminMembersView } from './components/admin/MembersView';
import { AdminNewGalleryView } from './components/admin/NewGalleryView';
import { AdminEditGalleryView } from './components/admin/EditGalleryView';
import { AdminGalleryListView } from './components/admin/GalleryListView';

import './assets/scss/all.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    loader: rootLoader(queryClient),
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <GalleryList />,
        loader: galleryListLoader(queryClient),
      },
      { path: '/login', element: <LoginView user={uiState.user} /> },
      { path: '/about', element: <About /> },
      {
        path: '/gallery/page/:pageNumber',
        element: <GalleryList />,
        loader: galleryListLoader(queryClient),
      },
      {
        path: '/gallery/:id',
        element: <GalleryView />,
        loader: galleryViewLoader,
      },
      {
        path: '/gallery/:galleryId/image/:id',
        element: <ImageView />,
        loader: imageViewLoader,
      },
      {
        path: '/image/search/:tag',
        element: <TagSearchView />,
        loader: tagSearchViewLoader,
      },
      { path: '/admin', element: <AdminIndex user={uiState.user} /> },
      { path: '/admin/members', element: <AdminMembersView /> },
      { path: '/admin/gallery', element: <AdminGalleryListView /> },
      { path: '/admin/gallery/new', element: <AdminNewGalleryView /> },
      { path: '/admin/gallery/edit/:id', element: <AdminEditGalleryView /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
