import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo-light.png';

function Header() {
    const navigate = useNavigate();

    return (
        <header className="App-header">
            <div className="menu-container">
                <input type="button" value="Add CAT TAIL" className="menu-button" onClick={() => navigate('/add/tail')} />
            </div>
            <a href='/'><img src={logo} className="App-logo" alt="logo" onClick={() => navigate('/')} /></a>
        </header>
    );
}

export default Header;
