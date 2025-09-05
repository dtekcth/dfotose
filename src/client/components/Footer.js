import React from "react";
import {Link} from 'react-router-dom';
import {observer} from 'mobx-react';
import uiState from '../UiState';

@observer
class Footer extends React.Component {
  render() {
    return (
      <div className="footer" style={{
        backgroundColor: '#454545',
        color: '#ecf0f1',
        padding: '30px 0',
        marginTop: 'auto',
        width: '100%'
      }}>
        <div className="footer-content" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ecf0f1' }}>DFoto</h3>
            <p style={{ margin: '5px 0' }}>Datateknologsektionens Fotoförening</p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '30px',
            flexWrap: 'wrap',
            marginBottom: '20px' 
          }}>
            <a href="mailto:dfoto@dtek.se" style={{ color: '#3498db', textDecoration: 'none' }}>
              dfoto@dtek.se
            </a>
            <a href="https://github.com/dtekcth/dfotose" style={{ color: '#3498db', textDecoration: 'none' }}>
              GitHub
            </a>
            { !uiState.user.isLoggedIn ? 
              <Link to="/login" style={{ color: '#3498db', textDecoration: 'none' }}>Logga in</Link>
              : 
              <span style={{ color: '#95a5a6' }}>Inloggad som {uiState.user.cid}</span>
            }
          </div>
          
          <p style={{ margin: '0', fontSize: '14px', color: '#95a5a6' }}>
            © {new Date().getFullYear()} DFoto
          </p>
        </div>
      </div>
    );
  }
}

export default Footer;