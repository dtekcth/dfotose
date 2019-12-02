import React from "react";
import {BrowserRouter, Route, Switch, withRouter} from 'react-router-dom';
import {observer} from "mobx-react";

import {StickyContainer} from 'react-sticky';

import Header from "./components/Header";
import StickyHeader from "./components/StickyHeader";
import Footer from "./components/Footer";
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

require('./css/all.scss');

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
        <p>DFoto är Datateknologsektionens fotoförening.
          Vår ambition är att genom foto och film föreviga alla arrangemang Datateknologen går på.
          Allt ifrån iDrotts legendariska aktiviteter, till D6s storslagna fester och Deltas episka pubar.</p>
        <p> Du kan komma i kontakt med oss genom att maila <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a> eller 
          skriva till vår <a href="https://www.facebook.com/dfotochalmers/">Facebooksida</a>.
        </p>
        <h3>Vi ses genom kameralinsen!</h3>
      </div>
    </div>
  );
};

const AdminHome = () => {
  return (<AdminIndex user={uiState.user}/>);
};

const NotFound = () => {
  const imagesWithText = [
    {path: '/assets/images/404-erland.jpg', text: 'Lika sögen på kaliber som Erland?'},
    {path: '/assets/images/404-nemo.jpg', text: 'Lika högljudd som Nemo?'},
    {path: '/assets/images/404-nora.jpg', text: 'Lika bra korvhäfvare som Nora?'},
    {path: '/assets/images/404-samu.jpg', text: 'Lika dålig gymnast som Samu?'},
    {path: '/assets/images/404-stas.jpg', text: 'Lika klar i skallen som Staś?'},
    {path: '/assets/images/404-tolv.jpg', text: 'Sexigast på data?'}
  ];

  const shuffled = _.shuffle(imagesWithText);
  const picked = _.head(shuffled);

  return (
    <div className="not-found">
      <img src={picked.path}/>
      <h1> 404 </h1>
      <p>{picked.text}</p>
      <small>Sidan kunde alltså inte hittas...</small>
    </div>
  );
};

const UnblockedStickyContainer = withRouter(StickyContainer);

@observer
class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <UnblockedStickyContainer>
          <Header user={uiState.user}/>
          <StickyHeader/>
          <div className="content">
            <div className="row">
              <Switch>
                {/* User routes */}
                <Route exact path="/" component={GalleryList}/>
                <Route exact path="/login" component={Login}/>
                <Route exact path="/about" component={About}/>
                <Route exact path="/gallery/page/:pageNumber" component={GalleryList}/>
                <Route exact path="/gallery/:id" component={GalleryView}/>
                <Route exact path="/gallery/:galleryId/image/:id" component={ImageView}/>
                <Route exact path="/image/search/:tag" component={TagSearchView}/>

                {/* Admin routes */}
                <Route exact path="/admin" component={AdminHome}/>
                <Route path="/admin/members" component={AdminMembersView}/>

                {/* Admin gallery routes */}
                <Route exact path="/admin/gallery" component={AdminGalleryListView}/>
                <Route exact path="/admin/gallery/new" component={AdminNewGalleryView}/>
                <Route exact path="/admin/gallery/edit/:id" component={AdminEditGalleryView}/>

                <Route path="*" component={NotFound}/>
              </Switch>
            </div>
          </div>
          <Footer/>
        </UnblockedStickyContainer>

      </BrowserRouter>
    );
  }
}

export default App;
