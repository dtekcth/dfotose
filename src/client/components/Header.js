import _ from 'lodash';
import React from "react";
import {Link} from "react-router";

import {observer} from 'mobx-react';
import uiState from '../UiState';

const LiExt = ({showCondition, conditionalClasses, children}) => {
  const classNames = _.map(conditionalClasses, conditionalClass => {
    const {condition, className} = conditionalClass;

    return condition ? className : "";
  });

  return (
    (showCondition) ?
      <li className={ classNames.join(' ') }>
        {children}
      </li>
      :
      null
  )
};

@observer
class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="header-content">
          <img src="/assets/images/logo.png"/>
          <ul>
            <li>
              <Link to="/"> Bilder </Link>
            </li>
            <li>
              <Link to="/about"> Om oss </Link>
            </li>
            { !uiState.user.isLoggedIn ?
              <li>
                <Link to="/login"> Logga in </Link>
              </li>
            : null }
            { uiState.user.isLoggedIn && uiState.user.dfotoMember ?
              <li>
                <Link to="/admin">Admin </Link>
              </li>
            : null }
          </ul>
          
          <div className="info">
            { uiState.user.isLoggedIn ? <span>Du är inloggad som { uiState.user.cid }</span> : null }
          </div>
        </div>
      </div>
    );
  }
}

export default Header;