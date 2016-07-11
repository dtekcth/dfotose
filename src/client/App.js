import React from 'react';
import { observer } from 'mobx-react';

require('purecss');
require('./css/all.scss');

import Header from './components/Header';
import ImageUpload from './components/ImageUpload';

@observer
class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        
        <ImageUpload />
      </div>
    );
  }
}

export default App;
