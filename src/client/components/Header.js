import React from 'react';

export default class Header extends React.Component {
  render() {
    return (
      <div className="header pure-menu">
        <a href="#" className="pure-menu-heading pure-menu-link">DFoto</a>
        <ul className="pure-menu-list">
          <li className="pure-menu-item">Album</li>
          <li className="pure-menu-item">Om DFoto</li>
        </ul>
      </div>
    );
  }
}