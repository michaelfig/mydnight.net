import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import AppRouter from './AppRouter';
// import * as serviceWorker from './serviceWorker';

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`)
    .then(function(registration) {
      console.log("Registration successful, scope is:", registration.scope);
    })
    .catch(function(err) {
      console.log("Service worker registration failed, error:", err);
    });
}

ReactDOM.render(<AppRouter />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
