import _ from "lodash";
import React from "react";
import {Link} from "react-router";
import {observer} from "mobx-react";

@observer
class AdminIndex extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fullname: props.user.fullName
    };
  }
  
  componentWillReceiveProps(newProps, oldProps) {
    this.setState({ fullname: newProps.user.fullName });
  }

  changeNameSubmit(event) {
    this.props.user.setFullName(this.state.fullname)
      .then((() => {
        this.setState({saveSuccess: true});
      }).bind(this));

    event.preventDefault();
  }

  changeFullname(event) {
    this.setState({fullname: event.target.value});
  }

  render() {
    if (!this.props.user.isLoggedIn || !this.props.user.dfotoMember) {
      return (<p>Du får inte vara här.</p>);
    }

    const saveSuccess = _.get(this.state, 'saveSuccess');
    const fullname = _.get(this.state, 'fullname', this.props.user.fullName);

    return (
      <div>
        <p> Välkommen {this.props.user.cid}. </p>

        <form onSubmit={ this.changeNameSubmit.bind(this) }>
          <label>Ditt namn:</label>
          <input type="text" value={ fullname } onChange={ this.changeFullname.bind(this) }/>
          <button type="submit">Spara</button>
          { saveSuccess ? <span>Sparat!</span> : null }
          <p> Det är detta namnet som syns på dina bilder, om du inte har satt något namn syns ditt cid.</p>
        </form>
        <hr/>
        <Link to="/admin/gallery">
          <button type="button">Hantera gallerier</button>
        </Link>
        <Link to="/admin/members">
          <button type="button">Hantera dfoto medlemmar</button>
        </Link>
      </div>
    );
  }
}

export default AdminIndex;
