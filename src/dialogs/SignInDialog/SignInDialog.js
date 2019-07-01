import React, { Component } from 'react';

import firebase from 'firebase/app';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

class SignInDialog extends Component {
  render() {
    // Properties
    const { fullScreen, open, uiConfig } = this.props;

    // Events
    const { onClose, onOpen } = this.props;

    return (
      <Dialog fullScreen={fullScreen} open={open} onClose={onClose} onExited={this.handleExited} onKeyPress={this.handleKeyPress}>
        <DialogTitle>
          Sign in to your account
        </DialogTitle>

        <DialogContent>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </DialogContent>
      </Dialog>
    );
  }
}

export default SignInDialog;