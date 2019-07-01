/* eslint-disable no-unused-vars */

import red from '@material-ui/core/colors/red';
import pink from '@material-ui/core/colors/pink';
import purple from '@material-ui/core/colors/purple';
import deepPurple from '@material-ui/core/colors/deepPurple';
import indigo from '@material-ui/core/colors/indigo';
import blue from '@material-ui/core/colors/blue';
import lightBlue from '@material-ui/core/colors/lightBlue';
import cyan from '@material-ui/core/colors/cyan';
import teal from '@material-ui/core/colors/teal';
import green from '@material-ui/core/colors/green';
import lightGreen from '@material-ui/core/colors/lightGreen';
import lime from '@material-ui/core/colors/lime';
import yellow from '@material-ui/core/colors/yellow';
import amber from '@material-ui/core/colors/amber';
import orange from '@material-ui/core/colors/orange';
import deepOrange from '@material-ui/core/colors/deepOrange';
import brown from '@material-ui/core/colors/brown';
import gray from '@material-ui/core/colors/grey';
import blueGray from '@material-ui/core/colors/blueGrey';

/* eslint-enable no-unused-vars */

const settings = {
  title: 'Stewart Berntson Memorial',
  
  theme: {
    primaryColor: {
      name: 'blueGray',
      import: blueGray,
    },
    secondaryColor: {
      name: 'red',
      import: red,
    },
    type: 'dark',
  },

  credentials: {
    firebase: {
      apiKey: "AIzaSyDp36Leow_QvszwMGaYqB4EuD7grh3bO_g",
      authDomain: "mydnight.firebaseapp.com",
      databaseURL: "https://mydnight.firebaseio.com",
      projectId: "mydnight",
      storageBucket: "mydnight.appspot.com",
      messagingSenderId: "513832891425",
      appId: "1:513832891425:web:37b28f31abe17549",
    }
  }
};

export default settings;
