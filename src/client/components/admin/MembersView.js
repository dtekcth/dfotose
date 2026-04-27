import React from 'react';

import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {Link} from 'react-router';

import UserStore, {EligibleUser} from '../../UserStore';
import uiState from '../../UiState';
import PreloadContainerFactory from '../PreloadContainerFactory';

const ROLE_PRIORITY = {
  DFoto: 0,
  Admin: 1,
  Aspirant: 2
};

function getRolePriority(role) {
  return ROLE_PRIORITY[role] ?? 3;
}

function compareMembersByRoleAndCid(firstMember, secondMember) {
  const roleDifference = getRolePriority(firstMember.role) - getRolePriority(secondMember.role);

  if (roleDifference != 0) {
    return roleDifference;
  }

  return firstMember.cid.localeCompare(secondMember.cid, 'sv');
}

function canCurrentUserEditRoles() {
  return uiState.user.role === 'Admin' || uiState.user.role === 'DFoto';
}

@observer
class EligibleMembers extends React.Component {
  state = {
    cid: '',
    role: 'None'
  };

  onCidChange(event) {
    this.setState({cid: event.target.value});
  }

  onRoleChange(event) {
    this.setState({role: event.target.value});
  }

  onAddEligibleUser(event) {
    if (!this.props.canEditRoles) {
      return;
    }

    const {cid, role} = this.state;
    EligibleUser.create(cid, role)
      .then(() => {
        this.props.members.push(new EligibleUser(this.state));
        this.setState({cid: '', role: 'None'});
      });
  }

  onDeleteEligibleUser(user) {
    return (event) => {
      if (!this.props.canEditRoles) {
        return;
      }

      user.remove().then(() => {
        const userIndex = this.props.members.indexOf(user);
        if (userIndex >= 0) {
          this.props.members.splice(userIndex, 1);
        }
      });
    };
  }

  render() {
    const eligibleUsers = this.props.members;

    const cid = this.state.cid || '';
    const role = this.state.role || '';

    const toBeMembers = eligibleUsers.map(eligibleUser => {
      return (
        <tr key={eligibleUser.cid}>
          <td>{eligibleUser.cid}</td>
          <td>{eligibleUser.role}</td>
          <td>
            <button onClick={this.onDeleteEligibleUser(eligibleUser).bind(this)} disabled={!this.props.canEditRoles}>
              Ta bort
            </button>
          </td>
        </tr>
      );
    });

    return (
      <div>
        {!this.props.canEditRoles ? <p>Bara DFoto och Admin kan lägga till eller ändra roller.</p> : null}
        <input type="text" onChange={this.onCidChange.bind(this)} value={cid} disabled={!this.props.canEditRoles}/>
        <select value={role} onChange={this.onRoleChange.bind(this)} disabled={!this.props.canEditRoles}>
          <option value="Admin">Admin</option>
          <option value="DFoto">DFoto</option>
          <option value="Aspirant">Aspjävel</option>
          <option value="None">-</option>
        </select>
        <button onClick={this.onAddEligibleUser.bind(this)} disabled={!this.props.canEditRoles}>Lägg till</button>

        <table>
          <thead>
            <tr>
              <th>cid</th>
              <th>roll</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {toBeMembers}
          </tbody>
        </table>
      </div>
    );
  }
}

@observer
class Member extends React.Component {
  onRoleChange(event) {
    if (!this.props.canEditRoles) {
      return;
    }

    const newRole = event.target.value;
    this.props.member.setRole(newRole).catch(() => {
      alert('Kunde inte ändra roll. Bara DFoto och Admin kan ändra roller.');
    });
  }

  render() {
    const member = this.props.member;
    const photoCount = this.props.photoCount || 0;

    return (
      <tr key={ member.cid }>
        <td> {member.cid} </td>
        <td> {member.fullname} </td>
        <td>
          {photoCount > 0 ? (
            <Link to={`/image/photographer/${encodeURIComponent(member.cid)}`}>
              {photoCount}
            </Link>
          ) : null}
        </td>
        <td>
          <select value={member.role} onChange={this.onRoleChange.bind(this)} disabled={!this.props.canEditRoles}>
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
    const regularSearch = this.state?.regularSearch || '';
    const {users, eligibleUsers, photoCounts} = this.props;
    const canEditRoles = canCurrentUserEditRoles();

    const members = users
      .filter(user => regularSearch == '' || user.cid.startsWith(regularSearch))
      .sort(compareMembersByRoleAndCid)
      .map(member => {
        return (
          <Member
            key={ member.cid }
            member={ member }
            photoCount={ photoCounts[member.cid] }
            canEditRoles={ canEditRoles }
          />
        );
      });

    return (
      <div>
        <p>Här kan du ge andra personer access till att ladda upp bilder - och i sin tur att ge andra personer
          access.</p>

        <h3>Fördefinierade roller</h3>
        <EligibleMembers members={eligibleUsers} canEditRoles={canEditRoles}/>

        <h3>Medlemmar ({members.length} st)</h3>
        Sök: <input onChange={ this.onSearchRegular.bind(this) } type="text" />
        <table>
          <thead>
            <tr>
              <th> cid </th>
              <th> namn </th>
              <th> bilder </th>
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
  const userPromise = UserStore.fetchAllUsers();
  const eligibleUserPromise = UserStore.fetchEligibleUsers();
  const photoCountsPromise = UserStore.fetchPhotoCounts();

  return Promise.all([userPromise, eligibleUserPromise, photoCountsPromise])
    .then(([users, eligibleUsers, photoCounts]) => {
      return {
        users: observable(users),
        eligibleUsers: observable(eligibleUsers),
        photoCounts
      };
  });
}, MembersView);

export default MembersViewContainer;
