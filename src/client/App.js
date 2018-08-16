import React from "react";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
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
        <p> Du kan komma i kontakt med oss genom att maila <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a>!</p>
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
    {path: '/assets/images/404-hasse.jpg', text: 'Like lite brösthår som Hasse?'},
    {path: '/assets/images/404-isak.jpg', text: 'Lika full som Isak?'},
    {path: '/assets/images/404-miranda.jpg', text: 'Nergången är det nya svarta, som Miranda..'},
    {path: '/assets/images/404-tove.jpg', text: 'Tove approves, mer fylla'},
    {path: '/assets/images/404-martin.jpg', text: 'Ser du lika dåligt som Martin?'},
    {path: '/assets/images/404-sebbe.gif', text: 'Lika imponerande som Sebbe?'}
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

@observer
class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <StickyContainer>
          <Header user={uiState.user}/>
          <StickyHeader/>
          <ContentContainer>
            <Switch>
              <Route exact path="/" component={GalleryList}/>
              <Route path="login" component={Login}/>
              <Route path="about" component={About}/>
              <Route path="gallery/page/:pageNumber" component={GalleryList}/>
              <Route path="gallery/:id" component={GalleryView}/>
              <Route path="gallery/:galleryId/image/:id" component={ImageView}/>
              <Route path="image/search/:tag" component={TagSearchView}/>

              <Route path="admin" component={Admin}>
                <Switch>
                  <Route exact path="/" component={AdminHome}/>
                  <Route path="gallery">
                    <Switch>
                      <Route exact path="/" component={AdminGalleryListView}/>
                      <Route path="new" component={AdminNewGalleryView}/>
                      <Route path="edit/:id" component={AdminEditGalleryView}/>
                    </Switch>
                  </Route>
                  <Route path="members" component={AdminMembersView}/>
                </Switch>
              </Route>

              <Route path="*" component={NotFound}/>
            </Switch>
          </ContentContainer>
          <Footer/>
        </StickyContainer>

      </BrowserRouter>
    );
  }
}

export default App;
