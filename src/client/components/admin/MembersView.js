import _ from 'lodash';
import React from 'react';

import {observable} from 'mobx';
import {observer} from 'mobx-react';

import UserStore from '../../UserStore';
import PreloadContainerFactory from '../PreloadContainerFactory';

class DFotoMember extends React.Component {
  render() {
    const member = this.props.member;
    return <li key={ member.cid }>{member.cid} - {member.fullname}</li>;
  }
}

class RegularMember extends React.Component {
  makeDfoto() {
    this.props.member.setDfotoMember(true);
  }
  
  render() {
    const member = this.props.member;
    return (
      <li key={ member.cid }>
        {member.cid} - {member.fullname}
        <button onClick={ this.makeDfoto.bind(this) } className="button" type="button">gör till dfoto-medlem</button>
      </li>
    );
  }
}

@observer
class MembersView extends React.Component {
  onSearchRegular(event) {
    const searchValue = event.target.value;

    this.setState({ regularSearch: searchValue });
  }

  render() {
    const regularSearch = _.get(this.state, 'regularSearch', '');
    const users = this.props.users;

    const dfotoMembers = _.chain(users)
      .filter({dfotoMember: true})
      .map(member => {
        return <DFotoMember key={ member.cid } member={ member } />;
      })
      .value();
    
    const regularMembers = _.chain(users)
      .filter(user => {
        const filtered = regularSearch == '' || user.cid.startsWith(regularSearch);
        return !user.dfotoMember && filtered;
      })
      .map(member => {
        return <RegularMember key={ member.cid } member={ member } />;
      })
      .value();
    
    return (
      <div>
        <p>Här kan du ge andra personer access till att ladda upp bilder - och i sin tur att ge andra personer
          access.
        <br/> För att du skall kunna ge någon access måste denna personen ha loggat in på sidan tidigare!</p>
        
        <h3>DFoto-medlemmar ({dfotoMembers.length} st):</h3>
        <ul>
          {dfotoMembers}
        </ul>
        
        <h3>Andra medlemmar ({regularMembers.length} st)</h3>
        Sök: <input onChange={ this.onSearchRegular.bind(this) } type="text" />
        <ul>
          {regularMembers}
        </ul>
      </div>
    );
  }
}

const MembersViewContainer = PreloadContainerFactory((props) => {
  return UserStore.fetchAllUsers()
    .then((users) => {
      return {
        users: observable(users)
      };
    })
}, MembersView);

export default MembersViewContainer;