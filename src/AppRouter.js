import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import LaunchScreen from './layout/LaunchScreen/LaunchScreen';

export default class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      App: undefined,
    }
  }
  
  componentWillMount() {
    import('./App').then(module => {
      this.setState({App: module.default});
    });
  }

  render() {
    const {App} = this.state;
    if (!App) {
      return <div style={{background: '#607d8b', display: 'flex', flexDirection: 'column', height: '100vh'}}><LaunchScreen/></div>;
    }
    return <Router><App/></Router>
  }
}
