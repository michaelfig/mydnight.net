import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Bar from './layout/Bar/Bar';
import Bottom from './layout/Bottom/Bottom';

import HomeContent from './content/HomeContent/HomeContent';
import RSVPContent from './content/RSVPContent/RSVPContent';
import NotFoundContent from './content/NotFoundContent/NotFoundContent';

import settings from './settings';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
      primary: settings.theme.primaryColor.import,
      secondary: settings.theme.secondaryColor.import,
      type: settings.theme.type,
    },
})

function App() {
  return (
    <React.Fragment>
    <Router>
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Bar title={settings.title} />

      <Switch>
      <Route exact path="/" render={() => (<HomeContent/>)} />
      <Route path="/rsvp" render={() => (<RSVPContent/>)} />
      <Route component={NotFoundContent} />
      </Switch>

      <Bottom/>
      </div>
      </MuiThemeProvider>
    </Router>
    </React.Fragment>
  );
}

export default App;
