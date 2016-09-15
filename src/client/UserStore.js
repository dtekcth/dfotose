import _ from 'lodash';
import axios from 'axios';
import {computed, action, observable} from 'mobx';

import UiState from './UiState';

class User {
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
  
  @computed get dfotoMember() {
    return this.data.dfotoMember;
  }
  
  @action setDfotoMember(isMember) {
    this.data.dfotoMember = isMember;
    return this.save();
  }
  
  @action save() {
    return axios.put(`/auth/user/${this.cid}`, this.data)
  }
}

class UserStore {
  @observable users = [];
  
  constructor() {
    // Only load if we're logged in as dfoto
    if (UiState.user.dfotoMember) {
      axios.get('/auth/users')
        .then((response => {
          this.loadUsers(response.data);
        }).bind(this));
    }
  }
  
  @action loadUsers(userDatas) {
    this.users = _.map(userDatas, data => {
      return new User(data)
    });
  }
}

export default UserStore;
