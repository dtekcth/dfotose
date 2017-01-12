import _ from 'lodash';
import axios from 'axios';
import {computed, action, observable} from 'mobx';

export class User {
  @observable data;
  
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
    return axios.put(`/auth/user/${this.cid}`, this.data)
  }
}

class UserStore {
  static fetchAllUsers() {
    // Only allow if logged in as dfoto
    return axios.get('/auth/users')
      .then((response => {
        const users = _.map(response.data, userData => new User(userData));
        return Promise.resolve(users);
      }).bind(this));
  }
}

export default UserStore;
