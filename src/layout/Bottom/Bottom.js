import React from 'react';
import {withRouter} from 'react-router-dom';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { withStyles } from '@material-ui/core/styles';

import HomeIcon from '@material-ui/icons/Home';
import RSVPIcon from '@material-ui/icons/Email';

const style = {
  stickyBottom: {
    position: 'sticky',
    bottom: 0,
  },
};

function Bottom({history, location, classes}) {
  const [value, setValue] = React.useState(0);

  const actualValue = location.pathname === '/rsvp' ? 1 : value;
  return (<BottomNavigation
        value={actualValue}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 1:
              history.push('/rsvp');
              break;
            default:
              history.push('/');
          }
          setValue(newValue);
        }}
        className={classes.stickyBottom}
        showLabels
        >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="RSVP" icon={<RSVPIcon />} />
      </BottomNavigation>);
}

export default withStyles(style)(withRouter(Bottom));

