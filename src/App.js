import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Bar from './layout/Bar/Bar';
import Bottom from './layout/Bottom/Bottom';

import HomeContent from './content/HomeContent/HomeContent';
import RSVPContent from './content/RSVPContent/RSVPContent';
import NotFoundContent from './content/NotFoundContent/NotFoundContent';
import PrivacyContent from './content/PrivacyContent/PrivacyContent';

import ConfirmationDialog from './dialogs/ConfirmationDialog/ConfirmationDialog';
import SignUpDialog from './dialogs/SignUpDialog/SignUpDialog';
import SignInDialog from './dialogs/SignInDialog/SignInDialog';
import ResetPasswordDialog from './dialogs/ResetPasswordDialog/ResetPasswordDialog';

// import LaunchScreen from './layout/LaunchScreen/LaunchScreen';

import constraints from './constraints.json';
import settings from './settings';

import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

import Hidden from '@material-ui/core/Hidden';
import Snackbar from '@material-ui/core/Snackbar';

import validate from 'validate.js';
import readingTime from 'reading-time';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/performance';

firebase.initializeApp(settings.credentials.firebase);

const auth = firebase.auth();

// eslint-disable-next-line no-unused-vars
const performance = firebase.performance();

auth.useDeviceLanguage();

const theme = createMuiTheme({
    palette: {
      primary: settings.theme.primaryColor.import,
      secondary: settings.theme.secondaryColor.import,
      type: settings.theme.type,
    },
})

class App extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      isAuthReady: false,
      isPerformingAuthAction: false,
      isVerifyingEmailAddress: false,
      isSignedIn: false,

      user: null,
      avatar: '',
      displayName: '',
      emailAddress: '',

      signUpDialog: {
        open: false
      },

      signInDialog: {
        open: false
      },

      resetPasswordDialog: {
        open: false
      },

      signOutDialog: {
        open: false
      },

      snackbar: {
        autoHideDuration: 0,
        message: '',
        open: false
      },
    }
  }

  signUp =  (emailAddress, password, passwordConfirmation) => {
    if (this.state.isSignedIn) {
      return;
    }

    if (!emailAddress || !password || !passwordConfirmation) {
      return;
    }

    const errors = validate({
      emailAddress: emailAddress,
      password: password,
      passwordConfirmation: passwordConfirmation
    }, {
      emailAddress: constraints.emailAddress,
      password: constraints.password,
      passwordConfirmation: constraints.passwordConfirmation
    });

    if (errors) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      auth.createUserWithEmailAndPassword(emailAddress, password).then((value) => {
        this.closeSignUpDialog();
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          case 'auth/email-already-in-use':
          case 'auth/invalid-email':
          case 'auth/operation-not-allowed':
          case 'auth/weak-password':
            this.openSnackbar(message);
            return;

          default:
            this.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  signIn = (emailAddress, password) => {
    if (this.state.isSignedIn) {
      return;
    }

    if (!emailAddress || !password) {
      return;
    }

    const errors = validate({
      emailAddress: emailAddress,
      password: password,
    }, {
      emailAddress: constraints.emailAddress,
      password: constraints.password
    });

    if (errors) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      auth.signInWithEmailAndPassword(emailAddress, password).then((value) => {
        this.closeSignInDialog(() => {
          const user = value.user;
          const displayName = user.displayName;
          const emailAddress = user.email;

          this.openSnackbar(`Signed in as ${displayName || emailAddress}`);
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          case 'auth/invalid-email':
          case 'auth/user-disabled':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            this.openSnackbar(message);
            return;

          default:
            this.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  signInWithProvider = (provider) => {
    if (this.state.isSignedIn) {
      return;
    }

    if (!provider) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      auth.signInWithPopup(provider).then((value) => {
        this.closeSignUpDialog(() => {
          this.closeSignInDialog(() => {
            const user = value.user;
            const displayName = user.displayName;
            const emailAddress = user.email;

            this.openSnackbar(`Signed in as ${displayName || emailAddress}`);
          });
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          case 'auth/account-exists-with-different-credential':
          case 'auth/auth-domain-config-required':
          case 'auth/cancelled-popup-request':
          case 'auth/operation-not-allowed':
          case 'auth/operation-not-supported-in-this-environment':
          case 'auth/popup-blocked':
          case 'auth/popup-closed-by-user':
          case 'auth/unauthorized-domain':
            this.openSnackbar(message);
            return;

          default:
            this.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  resetPassword = (emailAddress) => {
    if (this.state.isSignedIn) {
      return;
    }

    if (!emailAddress) {
      return;
    }

    const errors = validate({
      emailAddress: emailAddress
    }, {
      emailAddress: constraints.emailAddress
    });

    if (errors) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      auth.sendPasswordResetEmail(emailAddress).then(() => {
        this.closeResetPasswordDialog(() => {
          this.openSnackbar(`Password reset e-mail sent to ${emailAddress}`);
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          case 'auth/invalid-email':
          case 'auth/missing-android-pkg-name':
          case 'auth/missing-continue-uri':
          case 'auth/missing-ios-bundle-id':
          case 'auth/invalid-continue-uri':
          case 'auth/unauthorized-continue-uri':
          case 'auth/user-not-found':
            this.openSnackbar(message);
            return;

          default:
            this.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  verifyEmailAddress = (callback) => {
    const { user, isSignedIn } = this.state;

    if (!user || !user.email || !isSignedIn) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      user.sendEmailVerification().then(() => {
        this.setState({
          isVerifyingEmailAddress: true
        }, () => {
          const emailAddress = user.email;

          this.openSnackbar(`Verification e-mail sent to ${emailAddress}`);

          if (callback && typeof callback === 'function') {
            callback();
          }
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          case 'auth/missing-android-pkg-name':
          case 'auth/missing-continue-uri':
          case 'auth/missing-ios-bundle-id':
          case 'auth/invalid-continue-uri':
          case 'auth/unauthorized-continue-uri':
            this.openSnackbar(message);
            return;

          default:
            this.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  signOut = () => {
    if (!this.state.isSignedIn) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      auth.signOut().then(() => {
        this.closeSignOutDialog(() => {
          this.openSnackbar('Signed out');
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          default:
            this.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };
  openSignUpDialog = () => {
    this.setState({
      signUpDialog: {
        open: true
      }
    });
  };

  closeSignUpDialog = (callback) => {
    this.setState({
      signUpDialog: {
        open: false
      }
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  openSignInDialog = () => {
    this.setState({
      signInDialog: {
        open: true
      }
    });
  };

  closeSignInDialog = (callback) => {
    this.setState({
      signInDialog: {
        open: false
      }
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  openResetPasswordDialog = () => {
    this.setState({
      resetPasswordDialog: {
        open: true
      }
    });
  };

  closeResetPasswordDialog = (callback) => {
    this.setState({
      resetPasswordDialog: {
        open: false
      }
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  openSignOutDialog = () => {
    this.setState({
      signOutDialog: {
        open: true
      }
    });
  };

  closeSignOutDialog = (callback) => {
    this.setState({
      signOutDialog: {
        open: false
      }
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  openSnackbar = (message) => {
    this.setState({
      snackbar: {
        autoHideDuration: readingTime(message).time * 2,
        message,
        open: true
      }
    });
  };

  closeSnackbar = (clearMessage = false) => {
    const { snackbar } = this.state;

    this.setState({
      snackbar: {
        message: clearMessage ? '' : snackbar.message,
        open: false
      }
    });
  };

  render() {
    const {
      isAuthReady,
      isPerformingAuthAction,
      isVerifyingEmailAddress,
      isSignedIn,
      user,
    } = this.state;

    const {
      signUpDialog,
      signInDialog,
      resetPasswordDialog,
      signOutDialog
    } = this.state;

    const { snackbar } = this.state;

    return (
    <React.Fragment>
    <Router>
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
          <Bar
            title={settings.title}

            isSignedIn={isSignedIn}
            isPerformingAuthAction={isPerformingAuthAction}

            user={user}

            onSignUpClick={this.openSignUpDialog}
            onSignInClick={this.openSignInDialog}

            onSettingsClick={this.openSettingsDialog}
            onSignOutClick={this.openSignOutDialog}
          />
          <Switch>
            <Route exact path="/" render={() => (<HomeContent/>)} />
            <Route path="/rsvp" render={() => (<RSVPContent/>)} />
            <Route path="/privacy" render={() => (<PrivacyContent/>)} />
            <Route component={NotFoundContent} />
          </Switch>
          <Bottom/>

          {isSignedIn &&
            <ConfirmationDialog
              open={signOutDialog.open}

              title="Sign out?"
              contentText="While signed out you are unable to manage your profile and conduct other activities that require you to be signed in."
              okText="Sign Out"
              disableOkButton={isPerformingAuthAction}
              highlightOkButton

              onClose={this.closeSignOutDialog}
              onCancelClick={this.closeSignOutDialog}
              onOkClick={this.signOut}
            />
          }

          {!isSignedIn &&
                  <React.Fragment>
                    <Hidden only="xs">
                      <SignUpDialog
                        open={signUpDialog.open}

                        isPerformingAuthAction={isPerformingAuthAction}

                        signUp={this.signUp}

                        onClose={this.closeSignUpDialog}
                        onAuthProviderClick={this.signInWithProvider}
                      />

                      <SignInDialog
                        open={signInDialog.open}

                        isPerformingAuthAction={isPerformingAuthAction}

                        signIn={this.signIn}

                        onClose={this.closeSignInDialog}
                        onAuthProviderClick={this.signInWithProvider}
                        onResetPasswordClick={this.openResetPasswordDialog}
                      />
                    </Hidden>

                    <Hidden only={['sm', 'md', 'lg', 'xl']}>
                      <SignUpDialog
                        fullScreen
                        open={signUpDialog.open}

                        isPerformingAuthAction={isPerformingAuthAction}

                        signUp={this.signUp}

                        onClose={this.closeSignUpDialog}
                        onAuthProviderClick={this.signInWithProvider}
                      />

                      <SignInDialog
                        fullScreen
                        open={signInDialog.open}

                        isPerformingAuthAction={isPerformingAuthAction}

                        signIn={this.signIn}

                        onClose={this.closeSignInDialog}
                        onAuthProviderClick={this.signInWithProvider}
                        onResetPasswordClick={this.openResetPasswordDialog}
                      />
                    </Hidden>

                    <ResetPasswordDialog
                      open={resetPasswordDialog.open}

                      isPerformingAuthAction={isPerformingAuthAction}

                      resetPassword={this.resetPassword}

                      onClose={this.closeResetPasswordDialog}
                    />
                  </React.Fragment>
                }


                <Snackbar
                  autoHideDuration={snackbar.autoHideDuration}
                  message={snackbar.message}
                  open={snackbar.open}
                  onClose={this.closeSnackbar}
                />
      </div>
      </MuiThemeProvider>
    </Router>
    </React.Fragment>
    );
  }

  componentDidMount() {
    this._isMounted = true;

    this.removeAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (this._isMounted) {
        this.setState({
          isAuthReady: true,
          isSignedIn: !!user,
          user
        });
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;

    this.removeAuthObserver();
  }
}

export default App;
