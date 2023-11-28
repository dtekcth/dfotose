import { Link } from 'react-router-dom';

import TagSearchBar from './TagSearchBar';
import { User } from '../api/user';

const Header = ({ user }: { user: User }) => (
  <>
    <div className="header">
      <div className="header-content">
        <Link to="/">
          <img src="/assets/images/logo.png" />
        </Link>
        <ul>
          <li>
            <Link to="/"> Bilder </Link>
          </li>
          <li>
            <Link to="/about"> Om oss </Link>
          </li>
          {user?.role != 'None' ? (
            <li>
              <Link to="/admin">Admin </Link>
            </li>
          ) : null}
        </ul>
        <div className="info">
          <TagSearchBar />
        </div>
      </div>
    </div>
  </>
);

export default Header;
