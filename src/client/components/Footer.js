import React from "react";
import {Link} from 'react-router-dom';

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
          <br/>
          <p>Hittar du något du inte gillar med sidan? Fixa det! <a href="https://github.com/dtekcth/dfotose">Här</a> är koden. </p>
          <p>Copyright &copy; DFoto 2019.</p>
        </div>
      </div>
    );
  }
}

export default Footer;
