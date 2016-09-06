import React from "react";
import {Link} from "react-router";

import {observer} from 'mobx-react';
import uiState from '../UiState';

@observer
class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="header-content">
          <img src="https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/10274074_505549666223770_604053247227379460_n.jpg?oh=cf4fae6e3e1889cb30f139bf74916687&oe=58278F8A"/>
          <ul>
            <li><Link to="/"> Bilder </Link></li>
            <li><Link to="/about"> Kommittén </Link></li>
            { !uiState.user.isLoggedIn ?
              <li><Link to="/login"> Logga in </Link></li>
            : null }
            { uiState.user.isLoggedIn && uiState.user.dfotoMember ?
              <li><Link to="/admin">Admin </Link></li>
            : null }
          </ul>
        </div>
      </div>
    );
  }
}

export default Header;