import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Bar from './layout/Bar/Bar';
import Bottom from './layout/Bottom/Bottom';

import './firebaseInit';
// import * as firebaseui from 'firebaseui';

import ArrangerContent from './content/ArrangerContent/ArrangerContent';
import HomeContent from './content/HomeContent/HomeContent';
import RosterContent from './content/RosterContent/RosterContent';
import RSVPContent from './content/RSVPContent/RSVPContent';
import NotFoundContent from './content/NotFoundContent/NotFoundContent';
import PrivacyContent from './content/PrivacyContent/PrivacyContent';

import SettingsDialog from './dialogs/SettingsDialog/SettingsDialog';
import SignInDialog from './dialogs/SignInDialog/SignInDialog';

// import LaunchScreen from './layout/LaunchScreen/LaunchScreen';

import settings from './settings';

import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

import Hidden from '@material-ui/core/Hidden';
import Snackbar from '@material-ui/core/Snackbar';

import readingTime from 'reading-time';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/performance';
import 'firebase/messaging';
import LiveStreamContent from './content/LiveStreamContent/LiveStreamContent';

let messaging;
try {
  messaging = firebase.messaging();
} catch (e) {
  console.log(e);
}
const db = firebase.firestore();

// eslint-disable-next-line no-unused-vars
const performance = firebase.performance();

firebase.auth().useDeviceLanguage();

const theme = createMuiTheme({
    palette: {
      primary: settings.theme.primaryColor.import,
      secondary: settings.theme.secondaryColor.import,
      type: settings.theme.type,
    },
})

class App extends React.Component {
  _isMounted = false;
  _anonymousUser = undefined;

  constructor(props) {
    super(props);
    // const { history } = props;
    this.state = {
      isAuthReady: false,
      isPerformingAuthAction: false,
      isVerifyingEmailAddress: false,
      isSignedIn: false,
      isArranger: false,

      user: null,
      avatar: '',
      displayName: '',
      emailAddress: '',

      uiConfig: {
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          // firebase.auth.GithubAuthProvider.PROVIDER_ID,
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // forceSameDevice: true,
            // signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
          },
          {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            defaultCountry: 'CA',
          },
        ],
        autoUpgradeAnonymousUsers: true,
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        // tosUrl: '<your-tos-url>',
        // Privacy policy url/callback.
        signInFlow: 'popup',
        callbacks: {
          // Avoid redirects after sign-in.
          signInSuccessWithAuthResult: () => {
            this.closeSignInDialog();
            return false;
          },
          signInFailure: e => {
            if (e.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
              this.closeSignInDialog();
              this.openSnackbar(`${e.message} (${e.code})`);
              return;
            }
            let data;
            const participants = db.collection('participants');
            return participants
              .doc(firebase.auth().currentUser.uid).get()
              .then(snapshot => {
                data = snapshot.data();
                return firebase.auth().signInWithCredential(e.credential);
              })
              .then(userData => {
                //  Merge the data.
                const {user} = userData;
                const toUpdate = {};
                ['name', 'home', 'relationship']
                  .forEach(f => data[f] && (toUpdate[f] = data[f]));
                Object.entries(data.messageTokens || {})
                  .forEach(([key, val]) => toUpdate[`messageTokens.${key}`] = val);
                return participants.doc(user.uid).update(toUpdate);
              })
              .then(() => this._anonymousUser.delete())
              .then(() => {
                data = null;
                this.closeSignInDialog();
              })
              .catch(e => console.log(`Cannot merge`, e));
          }
        },
        privacyPolicyUrl: function() {
          window.location.assign('https://mydnight.net/privacy');
        },
      },
      
      signInDialog: {
        open: false,
      },

      settingsDialog: {
        open: false,
      },

      snackbar: {
        autoHideDuration: 0,
        message: '',
        open: false
      },
    }
  }

  signOut = () => {
    if (!this.state.isSignedIn) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      firebase.auth().signOut().then(() => {
        this.openSnackbar('Signed out');
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

  openSignInDialog = () => {
    const {uiConfig} = this.state;
    this.setState({
      signInDialog: {
        open: true,
        uiConfig,
      },
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

  openSettingsDialog = () => {
    const user = this.state.user;
    if (!user) {
      return;
    }
    firebase.firestore().collection('participants').doc(user.uid).get().then(
      ss => {
        const data = ss.data();
        this.setState({settingsDialog: {open: data}});
      });
  };

  saveSettings = (settings, callback) => {
    const user = this.state.user;
    firebase.firestore().collection('participants').doc(user.uid).update(settings).then(callback);
  };

  closeSettingsDialog = (callback) => {
    this.setState({
      settingsDialog: {
        open: false,
      },
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
      isArranger,
      isPerformingAuthAction,
      isSignedIn,
      user,
    } = this.state;

    const {
      signInDialog,
      settingsDialog,
    } = this.state;

    const { snackbar } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route path="/roster">
          <RosterContent/>
        </Route>
        <Route>
      <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
          <Bar
            title={settings.title}

            isSignedIn={isSignedIn}
            isPerformingAuthAction={isPerformingAuthAction}

            user={user}

            onSignInClick={this.openSignInDialog}
            onSignOutClick={this.signOut}
            onSettingsClick={this.openSettingsDialog}
          />
          <Switch>
            <Route exact path="/" render={() => (<HomeContent/>)} />
            <Route path="/arrange" render={() => (<ArrangerContent/>)} />
            <Route path="/rsvp" render={() => (<RSVPContent/>)} />
            <Route path="/livestream" render={() => (<LiveStreamContent/>)} />
            <Route path="/privacy" render={() => (<PrivacyContent/>)} />
            <Route component={NotFoundContent} />
          </Switch>
          <Bottom isArranger={isArranger} />

          <Hidden xsDown>
            {signInDialog.open && <SignInDialog
              open={signInDialog.open}
              uiConfig={signInDialog.uiConfig}

              onClose={this.closeSignInDialog}
            />}

            {settingsDialog.open && <SettingsDialog
              open={settingsDialog.open}
              onClose={this.closeSettingsDialog}
              onSave={this.saveSettings}
            />}
          </Hidden>

          <Hidden smUp>
            {signInDialog.open && <SignInDialog
              fullScreen
              open={signInDialog.open}
              uiConfig={signInDialog.uiConfig}

              onClose={this.closeSignInDialog}
            />}

            {settingsDialog.open && <SettingsDialog
              fullScreen
              open={settingsDialog.open}
              onClose={this.closeSettingsDialog}
              onSave={this.saveSettings}
            />}
          </Hidden>

          <Snackbar
            autoHideDuration={snackbar.autoHideDuration}
            message={snackbar.message}
            open={snackbar.open}
            onClose={this.closeSnackbar}
          />
      </div>
      </Route>
      </Switch>
      </MuiThemeProvider>
    );
  }

  componentDidMount() {
    this._isMounted = true;

    const auth = firebase.auth();
    this.removeArrangersObserver = db.collection('arrangers')
      .onSnapshot(querySnapshot => {
        if (!this._isMounted) {
          return;
        }
        const user = auth.currentUser;
        let exists = false;
        if (user) {
          querySnapshot.forEach(result => {
            if (result.id === user.uid) {
              exists = true;
            }
          });
        }
        this.setState({isArranger: exists});
      });

    this.removeAuthObserver = auth.onAuthStateChanged((user) => {
      if (user && user.isAnonymous) {
        this._anonymousUser = user;
      }
      if (this._isMounted) {
        const continuing = (/(^\?|&)mode=/.test(window.location.search) && !user);
        if (continuing) {
          this.openSignInDialog();
        }

        this.setState({
          isAuthReady: true,
          isSignedIn: !!user,
          user
        }, () => {
          if (user) {
            const p = db.collection('participants').doc(user.uid);
            p.get().then(
              ss => ss.data() || {},
              e => {},
            ).then(data => {
              const toUpdate = {};
              for (const [d, u] of [['email', 'email'], ['phone', 'phoneNumber'], ['name', 'displayName']]) {
                if (data[d] === undefined) {
                  toUpdate[d] = user[u];
                }
              }
              return p.update(toUpdate);
            });

            db.collection('arrangers').doc(user.uid).get().then(
              ss => this.setState({isArranger: ss.exists}),
            );
          } else {
            this.setState({isArranger: false});
          }
          if (!continuing && !this.state.isSignedIn) {
            auth.signInAnonymously();
          } else if (messaging && 'serviceWorker' in navigator) {
            messaging.requestPermission()
              .then(() => messaging.getToken())
              .then(token => {
                // Add our message token to the participants section.
                const doc = db.collection('participants')
                  .doc(user.uid);
                doc
                  .update({[`messageTokens.${token}`]: token})
                  .catch(() => doc.set({messageTokens: {[token]: token}}));
                navigator.serviceWorker.getRegistration()
                  .then(registration =>
                    navigator.serviceWorker.addEventListener('message', 
                      msg => {
                        // Pop up the message and the snackbar.
                        const data = msg.data['firebase-messaging-msg-data'].data;
                        console.log('showing', data);
                        registration.showNotification(data.title, {
                          data,
                          ...data,
                        });
                        let snack = '';
                        snack += (data.title || '');
                        if (snack) {
                          snack += ' - ';
                        }
                        snack += (data.body || '');
                        this.openSnackbar(snack);
                      }));
              })
              .catch(e => console.log('Cannot register for messages', e));
          }
        });
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;

    this.removeAuthObserver();
    this.removeArrangersObserver();
  }
}

export default withRouter(App);
