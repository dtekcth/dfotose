import _ from 'lodash';
import {observable, action, computed} from 'mobx';

import axios from 'axios';

class User {
  @observable data = { user: null };
  
  constructor() {
    this.firstCheck();
  }
  
  @action firstCheck() {
    axios.get('/auth/user', null, { responseType: 'json' })
      .then((response => {
        this.data.user = response.data;
      }).bind(this))
      .catch((err) => {
        console.log(err);
      });
  }

  @action login(cid, password) {
    return axios.post('/auth/login', { cid: cid, password: password }, { responseType: 'json' })
      .then((response => {
        this.data.user = response.data;
      }).bind(this));
  }
  
  @computed get current() {
    return this.data.user;
  }
  
  @computed get isLoggedIn() {
    return this.data.user != null;
  }
  
  @computed get dfotoMember() {
    return _.get(this.data, 'user.dfotoMember', false);
  }
  
  @computed get cid() {
    return _.get(this.data, 'user.cid', '');
  }
  
  @computed get fullName() {
    return _.get(this.data, 'user.fullname');
  }
}

export default User;

