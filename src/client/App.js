import React from "react";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import {observer} from "mobx-react";
import DevTool from 'mobx-react-devtools';

import {StickyContainer} from 'react-sticky';

import Header from "./components/Header";
import StickyHeader from "./components/StickyHeader";
import Footer from "./components/Footer";
import LoginView from './components/LoginView';
import GalleryList from './components/GalleryList';
import GalleryView from './components/GalleryView';
import ImageView from './components/ImageView';

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
  render() {
    return (
      <div>
        <GalleryList galleries={ uiState.galleryStore.Galleries.toJS() } />
      </div>
    );
  }
}

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
              <Route path="members">
                <IndexRoute component={ () => <AdminMembersView userStore={ uiState.userStore } /> } />
              </Route>
            </Route>
          </Route>
        </Router>
      </div>
    );
  }
}

export default App;
