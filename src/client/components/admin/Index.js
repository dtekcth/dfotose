import _ from 'lodash';
import React from 'react';
import {observer} from 'mobx-react';
import axios from 'axios';

import GalleryList from './GalleryList';

@observer
class AdminIndex extends React.Component {
  constructor(props) {
    super(props);

    const galleryList = new GalleryList();
    
    const fullname = props.user.fullName;
    this.state = {
      fullname: fullname,
      galleryList: galleryList
    };
  }
  
  changeNameSubmit(event) {
    const cid = _.get(this.props.user, 'current.cid', '');
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
    const user = this.props.user;
    if (user == null || !user.dfotoMember) {
      return (<p>Du får inte vara här.</p>);
    }
    
    const saveSuccess = _.get(this.state, 'saveSuccess');
    const fullname = _.get(this.state, 'fullname', user.current.fullname);
    
    const galleries = _.get(this.state.galleryList, 'Galleries', []);
    const renderedGalleries = _.map(galleries, (gallery) => {
      return (
        <li>{ gallery.name } </li>
      );
    });
    
    return (
      <div>
        <p> Välkommen {user.cid}. </p>
        
        <form onSubmit={ this.changeNameSubmit.bind(this) }>
          <label>Ditt namn:</label>
          <input type="text" value={ this.state.fullname } onChange={ this.changeFullname.bind(this) } />
          <button type="submit">Spara</button>
          { saveSuccess ? <span>Sparat!</span> : null }
          <p> Det är detta namnet som syns på dina bilder, om du inte har satt något namn syns ditt cid.</p>
        </form>
        <hr/>
        <h4>Gallerier</h4>
        <ul>
          { renderedGalleries }
        </ul>
      </div>
    );
  }
}

export default AdminIndex;