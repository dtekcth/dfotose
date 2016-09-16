import React from "react";
import {Link} from 'react-router';

import {observer} from 'mobx-react';

import uiState from '../UiState';

@observer
class Footer extends React.Component {
  render() {
    return (
      <div className="footer">
        <div className="footer-content">
          <p> Du kan komma i kontakt med oss genom att maila <a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a>!</p>
          <h3>Vi ses genom kameralinsen!</h3>
          { !uiState.user.isLoggedIn ?
            <Link to="/login"> Logga in </Link>
            : null }
          { uiState.user.isLoggedIn ? <span>Du är inloggad som { uiState.user.cid }</span> : null }
        </div>
      </div>
    );
  }
}

export default Footer;
