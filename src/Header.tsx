import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo-light.png';

const SyncStatus = () => {
    const [synced, setSynced] = useState(true);

    useEffect(() => {
        setInterval(() => {
            window.taildatabase.synced()
                .then(syncstatus => setSynced(syncstatus));
        }, 2500);
    }, []);

    return (<button type="button" className={`btn btn-${synced ? 'success' : 'danger'}`}>{synced ? 'Synced' : 'Not-synced'}</button>);
};


function Header() {
    const navigate = useNavigate();

    return (
        <header className="App-header">
            <div className="sync-status">
                <SyncStatus />
            </div>
            <div className="menu-container">
                <input type="button" value="Add CAT TAIL" className="menu-button" onClick={() => navigate('/add/tail')} />
            </div>
            <a href='/'><img src={logo} className="App-logo" alt="logo" onClick={() => navigate('/')} /></a>
        </header>
    );
}

export default Header;
