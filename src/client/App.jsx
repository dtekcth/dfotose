import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useRouteError,
} from 'react-router-dom';
import { observer } from 'mobx-react';

import Header from './components/Header';
import Footer from './components/Footer';
import LoginView from './components/LoginView';
import GalleryList from './components/GalleryList';
import GalleryView from './components/GalleryView';
import ImageView from './components/ImageView';
import TagSearchView from './components/TagSearchView';

import AdminIndex from './components/admin/Index';
import AdminGalleryListView from './components/admin/GalleryListView';
import AdminNewGalleryView from './components/admin/NewGalleryView';
import AdminEditGalleryView from './components/admin/EditGalleryView';
import AdminMembersView from './components/admin/MembersView';

import uiState from './UiState';
import { head, shuffle } from 'lodash-es';

require('./css/all.scss');

const Login = () => {
  return <LoginView user={uiState.user} />;
};

const About = () => {
  return (
    <div className="wrapper">
      <div className="site-content about-us">
        <h2>Om oss</h2>
        <p>
          DFoto är Datateknologsektionens fotoförening. Vår ambition är att
          genom foto och film föreviga alla arrangemang Datateknologen går på.
          Allt ifrån iDrotts legendariska aktiviteter, till D6s storslagna
          fester och Deltas episka pubar.
        </p>
        <p>
          {' '}
          Du kan komma i kontakt med oss genom att maila{' '}
          <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a> eller skriva till vår{' '}
          <a href="https://www.facebook.com/dfotochalmers/">Facebooksida</a>.
        </p>
        <h3>Vi ses genom kameralinsen!</h3>
      </div>
    </div>
  );
};

const AdminHome = () => {
  return <AdminIndex user={uiState.user} />;
};

const NotFound = () => {
  const imagesWithText = [
    { path: '/assets/images/404_lec.jpg', text: 'Rädd för Corona?' },
    {
      path: '/assets/images/404_logan1.jpg',
      text: 'Lika bra på Frisbee som Logan?',
    },
    { path: '/assets/images/404_logan2.jpg', text: 'Smartast på data?' },
    { path: '/assets/images/404_riddle.jpg', text: 'Känner in rummet?' },
    { path: '/assets/images/404_vilse.jpg', text: 'Ute på äventyr?' },
    { path: '/assets/images/404_win.jpg', text: 'Alltid redo?' },
    { path: '/assets/images/404_boris.jpg', text: 'Kidnappad?' },
    { path: '/assets/images/404_vela.jpg', text: 'Glad i glaset?' },
  ];

  const shuffled = shuffle(imagesWithText);
  const picked = head(shuffled);
  /**
   * @type {any}
   */
  const error = useRouteError();

  return (
    <div className="not-found">
      <img src={picked.path} />
      <h1> {error.statusText || error.message} </h1>
      <p>{picked.text}</p>
      <small>Sidan kunde alltså inte hittas...</small>
    </div>
  );
};

const Root = observer(() => (
  <>
    <Header user={uiState.user}></Header>
    <Outlet />
    <Footer />
  </>
));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <GalleryList /> },
      { path: '/login', element: <Login /> },
      { path: '/about', element: <About /> },
      { path: '/gallery/page/:pageNumber', element: <GalleryList /> },
      { path: '/gallery/:id', element: <GalleryView /> },
      { path: '/gallery/:galleryId/image/:id', element: <ImageView /> },
      { path: '/image/search/:tag', element: <TagSearchView /> },
      { path: '/admin', element: <AdminHome /> },
      { path: '/admin/members', element: <AdminMembersView /> },
      { path: '/admin/gallery', element: <AdminGalleryListView /> },
      { path: '/admin/gallery/new', element: <AdminNewGalleryView /> },
      { path: '/admin/gallery/edit/:id', element: <AdminEditGalleryView /> },
    ],
  },
]);

const App = observer(() => (
  <>
    <Header user={uiState.user}></Header>
    <RouterProvider router={router}></RouterProvider>
    <Footer />
  </>
));

export default App;
