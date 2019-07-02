import React, { Component } from 'react';

import firebase from 'firebase/app';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const styles = (theme) => ({
  authContent: {
    height: '600px',
    width: '400px',
  }
});

class SignInDialog extends Component {
  render() {
    // Properties
    const { fullScreen, open, uiConfig } = this.props;

    // Events
    const { onClose } = this.props;

    return (
      <Dialog fullScreen={fullScreen} open={open} onClose={onClose} onExited={this.handleExited} onKeyPress={this.handleKeyPress}>
        <DialogTitle>
          Sign in to your account
        </DialogTitle>

        <DialogContent>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(SignInDialog);