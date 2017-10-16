import _ from 'lodash';
import {observable, action, computed} from 'mobx';

import axios from 'axios';
import UiState from './UiState';

class User {
  @observable data = null;

  constructor() {
    this.firstCheck();
  }

  @action firstCheck() {
    axios.get('/auth/user', null, { responseType: 'json' })
      .then((response => {
        this.data = response.data;
      }).bind(this))
      .catch((err) => {
        console.log(err);
      });
  }

  @action login(cid, password) {
    return axios.post('/auth/login', { cid: cid, password: password }, { responseType: 'json' })
      .then((response => {
        this.data = response.data;
        UiState.refresh();
      }).bind(this));
  }

  @action logout() {
    if (this.data == null) {
      return Promise.reject();
    }

    return axios.get('/auth/logout')
      .then((response => {
        this.data = null;
        UiState.refresh();
      }).bind(this));
  }

  @computed get current() {
    return this.data;
  }

  @action setFullName(fullName) {
    return axios.put(`/auth/user/${this.cid}`, {
      fullname: fullName
    }).then((() => {
      this.data.fullname = fullName;
    }).bind(this));
  }

  @computed get isLoggedIn() {
    return this.data != null;
  }

  @computed get dfotoMember() {
    return _.get(this.data, 'dfotoMember', false);
  }

  @computed get cid() {
    return _.get(this.data, 'cid', '');
  }

  @computed get fullName() {
    return _.get(this.data, 'fullname');
  }
}

export default User;

