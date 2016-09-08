import _ from 'lodash';
import React from "react";
import {Link} from "react-router";
import {animateScroll} from 'react-scroll';

import {observer} from 'mobx-react';
import uiState from '../UiState';

@observer
class Header extends React.Component {
  onClickAbout(event) {
    event.preventDefault();
    
    animateScroll.scrollToBottom();
  }
  
  render() {
    return (
      <div className="header">
        <div className="header-content">
          <Link to="/"><img src="/assets/images/logo.png"/></Link>
          <ul>
            <li>
              <Link to="/"> Bilder </Link>
            </li>
            <li>
              <a onClick={ this.onClickAbout } href="#about"> Om oss </a>
            </li>
            { !uiState.user.isLoggedIn ?
              <li>
                <Link to="/login"> Logga in </Link>
              </li>
            : null }
            { uiState.user.isLoggedIn && uiState.user.dfotoMember ?
              <li>
                <Link to="/admin">Admin </Link>
              </li>
            : null }
          </ul>
          
          <div className="info">
            { uiState.user.isLoggedIn ? <span>Du är inloggad som { uiState.user.cid }</span> : null }
          </div>
        </div>
      </div>
    );
  }
}

export default Header;