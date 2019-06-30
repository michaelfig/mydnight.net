import React from 'react';
import {withRouter} from 'react-router-dom';

import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';

import HomeIcon from '@material-ui/icons/Home';
import RSVPIcon from '@material-ui/icons/Email';

function Bottom({history, location}) {
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
        showLabels
        >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="RSVP" icon={<RSVPIcon />} />
      </BottomNavigation>);
}

export default withRouter(Bottom);

