import React from 'react';
import { observer } from 'mobx-react';

require('purecss');
require('./css/all.scss');

import Header from './components/Header';

@observer
class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        
        <button className="pure-button pure-button-primary">Test button</button>
      </div>
    );
  }
}

export default App;
