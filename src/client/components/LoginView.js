import React from "react";
import {withRouter} from "react-router-dom";
import {observer} from "mobx-react";
import PropTypes from "prop-types";

import uiState from '../UiState';

@observer class LoginView extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired
  };

  constructor() {
    super();

    this.state = {
      cid: '',
      password: ''
    };
  }

  login(event) {
    event.preventDefault();

    this.props.user.login(this.state.cid, this.state.password)
      .then(() => {
        uiState.refresh();

        if (uiState.user.role != 'None') {
          this.props.history.push('/admin');
        } else {
          this.props.history.push('/');
        }
      });
  }

  onChangeCid(event) {
    this.setState({ cid: event.target.value });
  }

  onChangePassword(event) {
    this.setState({ password: event.target.value });
  }

  render() {
    const loginForm = (
      <form onSubmit={ this.login.bind(this) }>
        <input type="text" className="u-full-width" name="username" placeholder="CID"
               onChange={ this.onChangeCid.bind(this) }/>
        <input type="password" className="u-full-width" name="password" placeholder="Lösenord"
               onChange={ this.onChangePassword.bind(this) }/>

        <button type="submit">Logga In</button>
      </form>
    );

    const user = this.props.user;
    return (
      <div className="login-content">
        { user.isLoggedIn ? <p>Redan inloggad som { user.current.cid } </p> : loginForm }
      </div>
    );
  }
}

export default withRouter(LoginView);
