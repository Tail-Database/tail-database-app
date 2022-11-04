import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import './index.css';
import reportWebVitals from './reportWebVitals';
import HomePage from './pages/HomePage';
import Tail from './pages/Tail';
import AddTail from './pages/AddTail';
import { InsertResponse, RpcResponse } from './datalayer/rpc/data_layer';
import { TailRecord } from './models/tail/record';

declare global {
  interface Window {
    taildatabase: {
      addTail: (tailRecord: TailRecord) => Promise<InsertResponse>;
      getTails: () => Promise<TailRecord[]>;
      getTail: (hash: string) => Promise<TailRecord>;
      getNftUri: (launcherId: string) => Promise<string>;
      getTailReveal: (coin_id: string) => Promise<string>;
      synced: () => Promise<boolean>;
      subscribe: () => Promise<RpcResponse>;
    }
  }
}


TimeAgo.addDefaultLocale(en)


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/tail/:hash",
    element: <Tail />,
  },
  {
    path: "/add/tail",
    element: <AddTail />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

(async() => {
  window.taildatabase.subscribe().then(() => console.log('Subscribed to data store'));
})();

root.render(
  <React.StrictMode>
    <div className="App">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
