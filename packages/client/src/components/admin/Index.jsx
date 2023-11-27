import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { get } from 'lodash-es';

@observer
class AdminIndex extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fullname: props.user.fullName,
    };
  }

  componentWillReceiveProps(newProps, oldProps) {
    this.setState({ fullname: newProps.user.fullName });
  }

  changeNameSubmit(event) {
    this.props.user.setFullName(this.state.fullname).then(
      (() => {
        this.setState({ saveSuccess: true });
      }).bind(this)
    );

    event.preventDefault();
  }

  changeFullname(event) {
    this.setState({ fullname: event.target.value });
  }

  logout(event) {
    this.props.user.logout();
  }

  render() {
    if (!this.props.user.isLoggedIn || this.props.user.role == 'None') {
      return <p>Du får inte vara här.</p>;
    }

    const saveSuccess = get(this.state, 'saveSuccess');
    const fullname = get(this.state, 'fullname', this.props.user.fullName);

    return (
      <div>
        <p> Välkommen {this.props.user.cid}. </p>

        <form onSubmit={this.changeNameSubmit.bind(this)}>
          <label>Ditt namn:</label>
          <input
            type="text"
            value={fullname}
            onChange={this.changeFullname.bind(this)}
          />
          <button type="submit">Spara</button>
          {saveSuccess ? <span>Sparat!</span> : null}
          <p>
            {' '}
            Det är detta namnet som syns på dina bilder, om du inte har satt
            något namn syns ditt cid.
          </p>
        </form>
        <button onClick={this.logout.bind(this)}>Logga ut</button>
        <hr />
        <Link to="/admin/gallery">
          <button type="button">Hantera gallerier</button>
        </Link>
        <Link to="/admin/members">
          <button type="button">Hantera medlemmar</button>
        </Link>
      </div>
    );
  }
}

export default AdminIndex;
