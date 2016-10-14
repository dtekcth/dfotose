import React from "react";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import {observer} from "mobx-react";
import keydown, {Keys} from 'react-keydown';

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
        { children }
      </div>
    </div>
  )
};

const Site = ({children}) => {
  return (
    <StickyContainer>
      <Header user={ uiState.user } />
      <StickyHeader />
      <ContentContainer>
        { children }
      </ContentContainer>
      <Footer />
    </StickyContainer>
  )
};

@observer
class Home extends React.Component {
  constructor() {
    super();
  }

  @keydown(Keys.right)
  nextPage(event) {
    event.preventDefault();
    uiState.galleryStore.nextPage().catch(() => undefined);
  }

  @keydown(Keys.left)
  prevPage(event) {
    event.preventDefault();
    uiState.galleryStore.previousPage().catch(() => undefined);
  }

  render() {
    return (
      <div>
        <GalleryList galleries={ uiState.galleryStore.Galleries.toJS() } />
        <div className="gallery-pagination">
          <a onClick={ this.prevPage } type="button">Föregående</a>
          <span>sida { uiState.galleryStore.currentPageNumber } / { uiState.galleryStore.maxPageNumber } </span>
          <a onClick={ this.nextPage } type="button">Nästa</a>
        </div>
      </div>
    );
  }
}

const Login = () => {
  return (<LoginView user={ uiState.user }/>);
};

const Admin = ({children}) => {
  return (
    <div className="site-content">
      <h2> Admin </h2>
      { children }
    </div>
  );
};

const About = () => {
  return (
    <div className="site-content about-us">
      <h2>Om oss</h2>
      <p>DFoto är Datateknologsektionens fotoförening.
        Vår ambition är att genom foto och film föreviga alla arrangemang Datateknologen går på.
        Allt ifrån iDrotts legendariska aktiviteter, till D6s storslagna fester och Deltas episka pubar.</p>
      <p> Du kan komma i kontakt med oss genom att maila <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a>!</p>
      <h3>Vi ses genom kameralinsen!</h3>
    </div>
  );
};

const AdminHome = () => {
  return (<AdminIndex user={ uiState.user } />);
};

@observer
class App extends React.Component {
  render() {
    return (
      <div>
        <Router history={ browserHistory }>
          <Route path="/" component={ Site }>
            <IndexRoute component={ Home }/>
            <Route path="login" component={ Login }/>
            <Route path="about" component={ About }/>
            <Route path="gallery/:id" component={ GalleryView } />
            <Route path="gallery/:galleryId/image/:id" component={ ImageView } />
            <Route path="image/search/:tag" component={ TagSearchView } />

            <Route path="admin" component={ Admin }>
              <IndexRoute component={ AdminHome } />
              <Route path="gallery">
                <IndexRoute component={ AdminGalleryListView } />
                <Route path="new" component={ AdminNewGalleryView } />
                <Route path="edit/:id" component={ AdminEditGalleryView } />
              </Route>
              <Route path="members">
                <IndexRoute component={ AdminMembersView } />
              </Route>
            </Route>
          </Route>
        </Router>
      </div>
    );
  }
}

export default App;
