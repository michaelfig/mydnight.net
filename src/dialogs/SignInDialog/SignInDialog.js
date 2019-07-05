import React, { Component } from 'react';

import firebase from 'firebase/app';

import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import LaunchScreen from '../../layout/LaunchScreen/LaunchScreen';

const styles = (theme) => ({
  authContent: {
    height: '600px',
    width: '400px',
  },
  content: {
    minHeight: '150px',
  },
  spinner: {
    height: '100%',
  },
});

class SignInDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      FbAuth: undefined,
    };
  }

  componentDidMount() {
    import('react-firebaseui/StyledFirebaseAuth').then(module => {
      this.setState({FbAuth: module.default});
    });
  }

  render() {
    // Properties
    const { fullScreen, open, uiConfig } = this.props;

    const {classes } = this.props;

    // Events
    const { onClose } = this.props;

    const {FbAuth} = this.state;

    return (
      <Dialog fullScreen={fullScreen} open={open} onClose={onClose} onExited={this.handleExited} onKeyPress={this.handleKeyPress}>
        <DialogTitle>
          Sign in to your account
        </DialogTitle>

        <DialogContent className={classes.content}>
          {FbAuth ? <FbAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/> : <LaunchScreen className={classes.spinner} />}
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(SignInDialog);