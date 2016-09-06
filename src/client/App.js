import React from "react";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import {observer} from "mobx-react";
import DevTool from 'mobx-react-devtools';

import Header from "./components/Header";
import LoginView from './components/LoginView';
import GalleryList from './components/GalleryList';
import GalleryView from './components/GalleryView';
import ImageView from './components/ImageView';

import AdminIndex from './components/admin/Index';
import AdminGalleryListView from './components/admin/GalleryListView';
import AdminNewGalleryView from './components/admin/NewGalleryView';
import AdminEditGalleryView from './components/admin/EditGalleryView';

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
    <div>
      <Header user={ uiState.user } />
      <ContentContainer>
        { children }
      </ContentContainer>
    </div>
  )
};

@observer
class Home extends React.Component {
  render() {
    return (
      <div>
        <GalleryList galleries={ uiState.galleryStore.Galleries.toJS() } />
      </div>
    );
  }
}

const About = () => {
  return (
    <ContentContainer>
      <h1>Om DFoto</h1>
      
      <h2>Verksamhet</h2>
      <p>DFoto är en förening som sköter all fotografisk verksamhet på Datateknologsektionen på Chalmers Tekniska Högskola i Göteborg.</p>
      
      <h2>Kontakt</h2>
      <p>Det går att maila oss på <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a>.</p>
      
    </ContentContainer>
  );
};

const Login = () => {
  return (<LoginView user={ uiState.user }/>);
};

const Admin = ({children}) => {
  return (
    <div>
      <h2> Admin </h2>
      { children }
    </div>
  );
};

const AdminHome = () => {
  return (<AdminIndex />);
};

@observer
class ImageContainer extends React.Component {
  constructor(props) {
    super(props);
    
    const galleryId = _.get(props, 'routeParams.galleryId');
    const id = _.get(props, 'routeParams.id');

    const galleries = uiState.galleryStore.galleries;
    const gallery = _.find(galleries, gallery => gallery.id == galleryId);
    
    this.state = {
      gallery: gallery,
      galleryId: galleryId,
      imageId: id,
      imageList: uiState.imageStore.getImagesForGallery(galleryId)
    };
  }
  
  render() {
    return (<ImageView imageId={ this.state.imageId } images={ this.state.imageList.images.toJS() } galleryId={ this.state.galleryId } />);
  }
}

class GalleryViewContainer extends React.Component {
  render() {
    return (<GalleryView {...this.props} galleryStore={ uiState.galleryStore } />);
  }
}

@observer
class App extends React.Component {
  render() {
    return (
      <div>
        <Router history={ browserHistory }>
          <Route path="/" component={ Site }>
            <IndexRoute component={ Home }/>
            <Route path="about" component={ About }/>
            <Route path="login" component={ Login }/>
            <Route path="gallery/:id" component={ GalleryViewContainer } />
            <Route path="gallery/:galleryId/image/:id" component={ ImageContainer } />

            <Route path="admin" component={ Admin }>
              <IndexRoute component={ AdminHome } />
              <Route path="gallery">
                <IndexRoute component={ AdminGalleryListView } />
                <Route path="new" component={ AdminNewGalleryView } />
                <Route path="edit/:id" component={ AdminEditGalleryView } />
              </Route>
            </Route>
          </Route>
        </Router>
        <DevTool />
      </div>
    );
  }
}

export default App;
