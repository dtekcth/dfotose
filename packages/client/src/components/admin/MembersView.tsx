import React, { FormEvent, useState } from 'react';

import { observable } from 'mobx';
import { observer } from 'mobx-react';

import UserStore, { EligibleUser, User } from '../../UserStore';
import { chain, get, map, remove } from 'lodash-es';
import { useLoaderData } from 'react-router-dom';

const EligibleMembers = observer(({ members }: { members: EligibleUser[] }) => {
  const [cid, setCid] = useState('');
  const [role, setRole] = useState('None');

  function onAddEligibleUser() {
    EligibleUser.create(cid, role).then(() => {
      members.push(new EligibleUser({ cid, role }));
      setCid('');
      setRole('None');
    });
  }

  function onDeleteEligibleUser(user: EligibleUser) {
    user.remove().then(() => {
      remove(members, user);
    });
  }

  const toBeMembers = map(members, (eligibleUser) => {
    return (
      <tr key={eligibleUser.cid}>
        <td>{eligibleUser.cid}</td>
        <td>{eligibleUser.role}</td>
        <td>
          <button onClick={() => onDeleteEligibleUser(eligibleUser)}>
            Ta bort
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <form onSubmit={onAddEligibleUser}>
        <input
          type="text"
          onChange={(e) => setCid(e.target.value)}
          value={cid}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Admin">Admin</option>
          <option value="DFoto">DFoto</option>
          <option value="Aspirant">Aspjävel</option>
          <option value="None">-</option>
        </select>
        <button>Lägg till</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>cid</th>
            <th>roll</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>{toBeMembers}</tbody>
      </table>
    </div>
  );
});

const Member = observer(({ member }: { member: User }) => {
  return (
    <tr key={member.cid}>
      <td> {member.cid} </td>
      <td> {member.fullname} </td>
      <td>
        <select
          value={member.role}
          onChange={(e) => member.setRole(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="DFoto">DFoto</option>
          <option value="Aspirant">Aspjävel</option>
          <option value="None">-</option>
        </select>
      </td>
    </tr>
  );
});

export async function loader() {
  const usersP = UserStore.fetchAllUsers();
  const eligibleUsersP = UserStore.fetchEligibleUsers();

  const [users, eligibleUsers] = await Promise.all([usersP, eligibleUsersP]);

  return {
    users: observable(users),
    eligibleUsers: observable(eligibleUsers),
  };
}

const MembersView = observer(() => {
  const { users, eligibleUsers } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  const [regularSearch, setRegularSearch] = useState('');

  const members = users
    .filter((user) => regularSearch == '' || user.cid.startsWith(regularSearch))
    .map((member) => <Member key={member.cid} member={member} />);

  return (
    <div>
      <p>
        Här kan du ge andra personer access till att ladda upp bilder - och i
        sin tur att ge andra personer access.
      </p>
      <h3>Fördefinierade roller</h3>
      <EligibleMembers members={eligibleUsers} />
      <h3>Medlemmar ({members.length} st)</h3>
      Sök:{' '}
      <input onChange={(e) => setRegularSearch(e.target.value)} type="text" />
      <table>
        <thead>
          <tr>
            <th> cid </th>
            <th> namn </th>
            <th> roll </th>
          </tr>
        </thead>
        <tbody>{members}</tbody>
      </table>
    </div>
  );
});

export default MembersView;
