import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import axios from 'axios';

import uiState from '../../UiState';

@observer
class AdminIndex extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fullname: uiState.user.fullName
    };
  }
  
  changeNameSubmit(event) {
    const cid = uiState.user.cid;
    const url = `/auth/user/${cid}`;
    
    axios.put(url, { 
      fullname: this.state.fullname,
      dfotoMember: this.props.user.dfotoMember
    }).then((response => {
        this.setState({ saveSuccess: true });
      }).bind(this));
    
    event.preventDefault();
  }
  
  changeFullname(event) {
    this.setState({ fullname: event.target.value });
  }
  
  render() {
    if (!uiState.user.isLoggedIn || !uiState.user.dfotoMember) {
      return (<p>Du får inte vara här.</p>);
    }
    
    const saveSuccess = _.get(this.state, 'saveSuccess');
    const fullname = _.get(this.state, 'fullname', uiState.user.fullName);
    
    return (
      <div>
        <p> Välkommen {uiState.user.cid}. </p>
        
        <form onSubmit={ this.changeNameSubmit.bind(this) }>
          <label>Ditt namn:</label>
          <input type="text" value={ this.state.fullname } onChange={ this.changeFullname.bind(this) } />
          <button type="submit">Spara</button>
          { saveSuccess ? <span>Sparat!</span> : null }
          <p> Det är detta namnet som syns på dina bilder, om du inte har satt något namn syns ditt cid.</p>
        </form>
        <hr/>
        <Link to="/admin/gallery"><button type="button">Hantera gallerier</button></Link>
        <Link to="/admin/members"><button type="button">Hantera dfoto medlemmar</button></Link>
      </div>
    );
  }
}

export default AdminIndex;