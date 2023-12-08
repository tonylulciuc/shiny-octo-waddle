import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { configure } from 'axios-hooks'
import { LRUCache } from 'lru-cache';
import Axios from 'axios'

const axios = Axios.create({
  baseURL: `http://${process.env.REACT_APP_SERVER_ADDRESS ?? 'localhost:8888'}`
})

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  config.headers.Authorization =  `Bearer ${token}`;
   
  return config;
});


const cache = new LRUCache({ max: 10 });

configure({ axios, cache })

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
