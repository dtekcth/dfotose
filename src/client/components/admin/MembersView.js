import _ from 'lodash';
import React from 'react';

import {observable} from 'mobx';
import {observer} from 'mobx-react';

import UserStore from '../../UserStore';
import PreloadContainerFactory from '../PreloadContainerFactory';

class RegularMember extends React.Component {
  onRoleChange(event) {
    const newRole = event.target.value;
    this.props.member.setRole(newRole)
      .then(() => {
        // FIXME: this is ugly, but shit works.
        this.forceUpdate();
      });
  }
  
  render() {
    const member = this.props.member;
    return (
      <tr key={ member.cid }>
        <td> {member.cid} </td>
        <td> {member.fullname} </td>
        <td>
          <select value={member.role} onChange={this.onRoleChange.bind(this)}>
            <option value="Admin">Admin</option>
            <option value="DFoto">DFoto</option>
            <option value="Aspirant">Aspjävel</option>
            <option value="None">-</option>
          </select>
        </td>
      </tr>
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

    const members = _.chain(users)
      .filter(user => {
        return regularSearch == '' || user.cid.startsWith(regularSearch);
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

        <h3>Medlemmar ({members.length} st)</h3>
        Sök: <input onChange={ this.onSearchRegular.bind(this) } type="text" />
        <table>
          <thead>
            <tr>
              <th> cid </th>
              <th> namn </th>
              <th> roll </th>
            </tr>
          </thead>
          <tbody>
            {members}
          </tbody>
        </table>
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