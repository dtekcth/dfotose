import React from "react";
import {Link} from "react-router";

import {observer} from 'mobx-react';

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
            <h3>Vi ses genom kameralinsen!</h3>
        </div>
      </div>
    );
  }
}

export default Footer;
