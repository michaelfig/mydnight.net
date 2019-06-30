import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography';

export default function Bar({title}) {
  return (
    <AppBar color="primary" position="static" style={{flexGrow: 0}}>
      <Toolbar variant="regular">
        <Typography style={{flexGrow: 1}} color="inherit" variant="h6">{title}</Typography>
      </Toolbar>
    </AppBar>
  )
};