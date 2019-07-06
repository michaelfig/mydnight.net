import React from 'react';
import {withRouter} from 'react-router-dom';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { withStyles } from '@material-ui/core/styles';

import ArrangeIcon from '@material-ui/icons/CompareArrows';
import HomeIcon from '@material-ui/icons/Home';
import RegisterIcon from '@material-ui/icons/PanTool';
import LiveStreamIcon from '@material-ui/icons/Visibility';

const style = {
  stickyBottom: {
    position: 'sticky',
    bottom: 0,
  },
};

const buttonUrl = [
  '/',
  '/livestream',
  '/present',
  '/arrange',
];

const urlOffset = {};
buttonUrl.forEach((url, i) => urlOffset[url] = i);

function Bottom({history, location, classes, isArranger}) {
  const [value, setValue] = React.useState(0);

  const actualValue = urlOffset[location.pathname] || value;
  return (<BottomNavigation
        value={actualValue}
        onChange={(event, newValue) => {
          const url = buttonUrl[newValue] || '/';
          history.push(url);
          setValue(newValue);
        }}
        className={classes.stickyBottom}
        showLabels
        >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Live Stream" icon={<LiveStreamIcon />} />
        <BottomNavigationAction label="Present" icon={<RegisterIcon />} />
      { isArranger && <BottomNavigationAction label="Arrange" icon={<ArrangeIcon />} /> }
      </BottomNavigation>);
}

export default withStyles(style)(withRouter(Bottom));
