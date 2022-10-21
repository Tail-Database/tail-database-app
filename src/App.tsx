import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

declare global {
  interface Window {
    taildatabase? : any
  }
}

function App() {
  const [tails, setTails] = useState([]);

  useEffect(() => {
    window.taildatabase.getTails().then((res: any) => setTails(res))
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <ul>
            {tails.map((tail: any) => (
              <li key={tail.hash}>
                0x{tail.hash} - {tail.name}
              </li>
            ))}
          </ul>
        </p>
      </header>
    </div>
  );
}

export default App;
