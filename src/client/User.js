import _ from 'lodash';
import {observable, action, computed} from 'mobx';

import axios from 'axios';

class User {
  @observable data = { user: null };
  
  constructor() {
    axios.get('/auth/user', null, { responseType: 'json' })
      .then((response => {
        this.data.user = response.data;
      }).bind(this))
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
}

export default User;

