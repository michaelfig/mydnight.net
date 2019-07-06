import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import PersonIcon from '@material-ui/icons/Person';
import { withStyles } from '@material-ui/styles';

const styles = (theme) => ({
  signUpButton: {
    marginRight: theme.spacing(1)
  }
});

class Bar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menu: {
        anchorEl: null
      }
    };
  }

  openMenu = (event) => {
    const anchorEl = event.currentTarget;

    this.setState({
      menu: {
        anchorEl
      }
    });
  };

  closeMenu = () => {
    this.setState({
      menu: {
        anchorEl: null
      }
    });
  };

  handleSignOutClick = () => {
    this.closeMenu();
    this.props.onSignOutClick();
  };

  handleSignInClick = () => {
    const { onSignInClick } = this.props;
    this.closeMenu();
    onSignInClick();
  };

  handleSettingsClick = () => {
    const { onSettingsClick } = this.props;
    this.closeMenu();
    onSettingsClick();
  };

  render() {
    // Properties
    const { title, isPerformingAuthAction, isSignedIn, user } = this.props;

    const { menu } = this.state;

    return (
    <AppBar color="primary" position="static" style={{flexGrow: 0}}>
      <Toolbar variant="regular">
        <Typography style={{flexGrow: 1}} color="inherit" variant="h6">{title}</Typography>
        {isSignedIn &&
            <React.Fragment>
              <IconButton color="inherit" disabled={isPerformingAuthAction} onClick={this.openMenu}>
                {user.photoURL ? <Avatar alt="Avatar" src={user.photoURL} /> : <PersonIcon />}
              </IconButton>

              <Menu anchorEl={menu.anchorEl} open={Boolean(menu.anchorEl)} onClose={this.closeMenu}>
                <MenuItem disabled={isPerformingAuthAction} onClick={this.handleSettingsClick}>Edit Profile...</MenuItem>
                {user.isAnonymous && 
                  <MenuItem disabled={isPerformingAuthAction} onClick={this.handleSignInClick}>Sign in...</MenuItem>
                }
                <MenuItem disabled={isPerformingAuthAction} onClick={this.handleSignOutClick}>Sign out</MenuItem>
              </Menu>
            </React.Fragment>
          }

          {!isSignedIn &&
            <React.Fragment>
              <Button color="secondary" disabled={isPerformingAuthAction} variant="contained" onClick={this.handleSignInClick}>Sign In</Button>
            </React.Fragment>
          }
      </Toolbar>
    </AppBar>
    );
  }
};

export default withStyles(styles)(Bar);