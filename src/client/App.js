import React from "react";
import {Router, Route, IndexRoute, Link, browserHistory} from "react-router";
import {observer} from "mobx-react";

import Header from "./components/Header";
import ImageUpload from "./components/ImageUpload";
import LoginView from './components/LoginView';

import User from './User';

require('./css/all.scss');

const user = new User();

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
      <Header />
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
        { user.isLoggedIn ? <p> Du är inloggad som { user.current.cid } </p> : null }
        <ImageUpload />
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
  return (<LoginView user={ user }/>);
};

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
          </Route>
        </Router>
      </div>
    );
  }
}

export default App;
