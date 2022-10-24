import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Link,
  useNavigate,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import HomePage from './pages/HomePage';
import Tail from './pages/Tail';
import AddTail from './pages/AddTail';
import Header from './Header';

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
