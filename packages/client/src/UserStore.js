import axios from 'axios';
import { map } from 'lodash-es';
import { computed, action, observable } from 'mobx';

export class User {
  @observable accessor data;

  constructor(userData) {
    this.data = userData;
  }

  @computed get cid() {
    return this.data.cid;
  }

  @computed get fullname() {
    return this.data.fullname;
  }

  @computed get role() {
    return this.data.role;
  }

  @action setRole(roleName) {
    this.data.role = roleName;
    return this.save();
  }

  @action save() {
    return axios.put(`/auth/user/${this.cid}`, this.data);
  }
}

// Used to elevate users who has yet to login
export class EligibleUser {
  @observable accessor data;

  constructor(userData) {
    this.data = userData;
  }

  @computed get cid() {
    return this.data.cid;
  }

  @computed get role() {
    return this.data.role;
  }

  @action save() {
    return axios.post('/v1/user/eligible', this.data);
  }

  @action remove() {
    return axios.delete(`/v1/user/eligible/${this.data.cid}`);
  }

  static create(cid, role) {
    const user = new EligibleUser({ cid: cid, role: role });
    return user.save();
  }
}

class UserStore {
  static fetchAllUsers() {
    // Only allow if logged in as dfoto
    return axios
      .get('/auth/users')
      .then((response) => map(response.data, (userData) => new User(userData)));
  }

  static fetchEligibleUsers() {
    return axios
      .get('/v1/user/eligible')
      .then((response) =>
        map(response.data, (userData) => new EligibleUser(userData))
      );
  }
}

export default UserStore;
