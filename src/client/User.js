import {observable, action, computed, makeObservable} from 'mobx';

import axios from 'axios';
import UiState from './UiState';

const isBrowser = typeof window !== 'undefined';

class User {
  @observable data = null;

  constructor() {
    makeObservable(this);
    if (isBrowser) {
      this.firstCheck();
    }
  }

  @action firstCheck() {
    return axios
        .get('/auth/user', { responseType: 'json' })
        .then(action((response) => {
          this.data = response.data;
        }))
        .catch(action((err) => {
          if (err.response?.status === 403 || err.response?.status === 401) {
            this.data = null;
            return;
          }

          console.log(err);
        }));
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
    return this.data?.dfotoMember || false;
  }

  @computed get cid() {
    return this.data?.cid || '';
  }

  @computed get fullName() {
    return this.data?.fullname;
  }

  @computed get role() {
    return this.data?.role || 'None';
  }
}

export default User;

