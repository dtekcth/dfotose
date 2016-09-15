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
          <h1>Om oss</h1>
          <p>DFoto är Datateknologsektionens fotoförening. 
            Vår ambition är att genom foto och film föreviga alla arrangemang Datateknologen går på.
            Allt ifrån iDrotts legendariska aktiviteter, till D6s storslagna fester och Deltas episka pubar.</p>
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
