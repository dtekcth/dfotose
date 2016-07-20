import React from "react";
import {Link} from "react-router";

export default class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="header-content">
          <img
            src="https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/10274074_505549666223770_604053247227379460_n.jpg?oh=cf4fae6e3e1889cb30f139bf74916687&oe=58278F8A"/>
          <ul>
            <li><Link to="/"> Album </Link></li>
            <li><Link to="/about"> Om DFoto </Link></li>
          </ul>
        </div>
      </div>
    );
  }
}