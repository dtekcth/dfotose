import React from "react";
import {BrowserRouter, Route, Routes} from 'react-router';
import {observer} from "mobx-react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import GalleryList from './components/GalleryList';
import GalleryView from './components/GalleryView';
import TagSearchView from './components/TagSearchView';
import PhotographerView from './components/PhotographerView';

import uiState from './UiState';

const LoginView = React.lazy(() => import('./components/LoginView'));
const ImageView = React.lazy(() => import('./components/ImageView'));

const AdminIndex = React.lazy(() => import('./components/admin/Index'));
const AdminGalleryListView = React.lazy(() => import('./components/admin/GalleryListView'));
const AdminNewGalleryView = React.lazy(() => import('./components/admin/NewGalleryView'));
const AdminEditGalleryView = React.lazy(() => import('./components/admin/EditGalleryView'));
const AdminMembersView = React.lazy(() => import('./components/admin/MembersView'));
const AdminStressTestView = React.lazy(() => import('./components/admin/StressTestView'));

const ContentContainer = ({children}) => {
  return (
    <div className="content">
      <div className="row">
        {children}
      </div>
    </div>
  )
};

const Login = () => {
  return (<LoginView user={uiState.user}/>);
};

const Admin = ({children}) => {
  return (
    <div className="site-content">
      <h2> Admin </h2>
      {children}
    </div>
  );
};

const About = () => {
  return (
    <div className="wrapper">
      <div className="site-content about-us">
        <h2>Om oss</h2>
        <p>
          DFoto är Datateknologsektionens fotoförening. 
          Vår ambition är att genom foto och film föreviga alla arrangemang Datateknologen deltar i. 
          Allt från iDrotts legendariska aktiviteter, till D6:s storslagna fester och Deltas episka pubar.
        </p>
        <p>
          Du kan komma i kontakt med oss genom att maila <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a>, 
          skriva till vår <a href="https://www.facebook.com/dfotochalmers/">Facebook </a> 
           eller följ oss på <a href="https://www.instagram.com/dfoto_chalmers/">Instagram</a>.
        </p>
        <h2>Anmäla arrangemang</h2>
        <p>
          Vill du att vi kommer och fotograferar ett arrangemang? Anmäl det via <a href="https://forms.gle/d7ESL17YZq86oPNfA">detta formulär</a>.
        </p>
        <h3>Vi ses genom kameralinsen!</h3>
      </div>
    </div>
  );
};


const AdminHome = () => {
  return (<AdminIndex user={uiState.user}/>);
};

const AdminRouteFallback = () => {
  return <div>Laddar...</div>;
};

const NotFound = () => {
  const imagesWithText = [
    {path: '/assets/images/404_lec.jpg', text: 'Rädd för Corona?'},
    {path: '/assets/images/404_logan1.jpg', text: 'Lika bra på Frisbee som Logan?'},
    {path: '/assets/images/404_logan2.jpg', text: 'Smartast på data?'},
    {path: '/assets/images/404_riddle.jpg', text: 'Känner in rummet?'},
    {path: '/assets/images/404_vilse.jpg', text: 'Ute på äventyr?'},
    {path: '/assets/images/404_win.jpg', text: 'Alltid redo?'},
    {path: '/assets/images/404_boris.jpg', text: 'Kidnappad?'},
    {path: '/assets/images/404_vela.jpg', text: 'Glad i glaset?'}
  ];

  const picked = imagesWithText[Math.floor(Math.random() * imagesWithText.length)];

  return (
    <div className="not-found">
      <img src={picked.path}/>
      <h1> 404 </h1>
      <p>{picked.text}</p>
      <small>Sidan kunde alltså inte hittas...</small>
    </div>
  );
};

const AppFrame = ({children, ...props}) => <div {...props}>{children}</div>;

@observer
class App extends React.Component {
  render() {
    const Router = this.props.Router || BrowserRouter;
    const routerProps = this.props.routerProps || {};
    const ssrData = this.props.ssrData || {};
    const ssrInitialPath = ssrData.path;

    return (
      <Router {...routerProps}>
        <AppFrame style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Header user={uiState.user}/>
          <div className="content" style={{ flex: '1 0 auto' }}>
            <div className="row">
              <div className="wrapper">
                <React.Suspense fallback={<AdminRouteFallback/>}>
                  <Routes>
                    {/* User routes */}
                    <Route
                      path="/"
                      element={
                        <GalleryList
                          ssrInitialPath={ssrInitialPath}
                          ssrInitialState={ssrData.galleryList}
                        />
                      }
                    />
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route
                      path="/gallery/page/:pageNumber"
                      element={
                        <GalleryList
                          ssrInitialPath={ssrInitialPath}
                          ssrInitialState={ssrData.galleryList}
                        />
                      }
                    />
                    <Route
                      path="/gallery/:id"
                      element={
                        <GalleryView
                          ssrInitialPath={ssrInitialPath}
                          ssrInitialState={ssrData.galleryView}
                        />
                      }
                    />
                    <Route path="/gallery/:galleryId/image/:id" element={<ImageView/>}/>
                    <Route path="/image/search" element={<TagSearchView/>}/>
                    <Route
                      path="/image/search/:tag"
                      element={
                        <TagSearchView
                          ssrInitialPath={ssrInitialPath}
                          ssrInitialState={ssrData.tagSearch}
                        />
                      }
                    />
                    <Route
                      path="/image/photographer/:cid"
                      element={
                        <PhotographerView
                          ssrInitialPath={ssrInitialPath}
                          ssrInitialState={ssrData.photographerView}
                        />
                      }
                    />

                    {/* Admin routes are lazy-loaded so public gallery visitors avoid this bundle. */}
                    <Route path="/admin" element={<AdminHome/>}/>
                    <Route path="/admin/members" element={<AdminMembersView/>}/>
                    <Route path="/admin/stress-test" element={<AdminStressTestView user={uiState.user}/>}/>

                    {/* Admin gallery routes */}
                    <Route path="/admin/gallery" element={<AdminGalleryListView/>}/>
                    <Route path="/admin/gallery/new" element={<AdminNewGalleryView/>}/>
                    <Route path="/admin/gallery/edit/:id" element={<AdminEditGalleryView/>}/>

                    <Route path="*" element={<NotFound/>}/>
                  </Routes>
                </React.Suspense>
              </div>
            </div>
          </div>
          <Footer/>
        </AppFrame>
      </Router>
    );
  }
}

export default App;
