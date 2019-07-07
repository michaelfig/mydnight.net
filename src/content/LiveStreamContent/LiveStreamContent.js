import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import EmptyState from '../../layout/EmptyState/EmptyState';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import moment from 'moment';

import Button from '@material-ui/core/Button';
import { memorialDate } from '../HomeContent/HomeContent';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Link from '@material-ui/core/Link';

const styles = (theme) => ({
  card: {
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
  },
  hidden: {
    display: 'none',
    //visibility: 'hidden',
  },
  standout: {
    color: 'yellow',
  },
});

class LiveStreamContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attending: false,
      open: false,
    };
  }

  updateAttendance = attending => ev => {
    const user = firebase.auth().currentUser;
    if (!user) {
      return;
    }
    const db = firebase.firestore();
    const batch = db.batch();
    batch.set(db.collection('participants').doc(user.uid), {
      attending: attending || null,
    }, {merge: true});
    batch.set(db.collection('livestream').doc('publicInfo'), {
      sofar: firebase.firestore.FieldValue.increment(attending ? +1 : -1),
    }, {merge: true});
    batch.commit().catch(e => console.log(`Cannot update attendance`, e));
  };

  componentDidMount() {
    const col = firebase.firestore().collection('livestream');
    this.unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        return;
      }
      if (this.unsubscribePrivate) {
        this.unsubscribePrivate();
      }
      this.unsubscribePrivate = col.doc('privateInfo').onSnapshot(ss => {
        const data = ss.data();
        this.setState(data);
      });
      if (this.unsubscribeSelf) {
        this.unsubscribeSelf();
      }
      this.unsubscribeSelf = firebase.firestore().collection('participants').doc(user.uid).onSnapshot(ss => {
        const data = ss.data();
        if (data) {
          this.setState({attending: data.attending});
        }
      });
    });
    this.unsubscribePublic = col.doc('publicInfo').onSnapshot(ss => {
      const data = ss.data();
      this.setState(data);
    });
    this.minuteTimer = setInterval(() => this.setState({now: new Date()}), 30000);
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.unsubscribePublic) {
      this.unsubscribePublic();
    }
    if (this.unsubscribePrivate()) {
      this.unsubscribePrivate();
    }
    if (this.unsubscribeSelf) {
      this.unsubscribeSelf();
    }
    clearInterval(this.minuteTimer);
  }

  openPhone = () => {
    this.setState({open: true});
  };
  closePhone = () => {
    this.setState({open: false});
  };

  render() {
    // Styling
    const {classes} = this.props;

    const {attending, sofar, total, url} = this.state;
    let SubH, subclass;
    if (total !== undefined) {
      const remaining = total - (sofar || 0);
      if (remaining < 0) {
        let advice;
        if (attending) {
          advice = `; please consider giving up your spot`;
        }
        SubH = <b>{-remaining} spots are overbooked{advice}</b>;
        subclass = classes.standout;
      } else {
        SubH = <i>{remaining}/{total} spots remaining</i>;
      }
    } else if (sofar !== undefined) {
      SubH = <i>{sofar} spots are claimed</i>;
    } else {
      SubH = <i>??? spots remaining</i>;
    }

    const md = moment(memorialDate);
    return <EmptyState><Card className={classes.card}>
      <CardHeader title="Memorial Live Stream" subheader={SubH} classes={{subheader: subclass}}/>
      <CardContent>
        <p>The memorial begins {md.fromNow()}, {md.toString()} (Central Standard Time).</p>

        <p>Please try to use <span className={classes.standout}>as few spots as possible</span> by
        gathering with friends and family to participate in the Live Stream.</p>

        <p className={attending ? undefined : classes.hidden}>Please test your computer audio/video setup
          by <span className={classes.standout}>joining the live stream sometime before the memorial begins</span>.
          Right now is as good a time as any!</p>
        <Dialog open={this.state.open} onClose={this.closePhone}>
          <DialogTitle>Join by Phone</DialogTitle>
          <DialogContent>
            For telephone (long distance charges may apply) try:
            
            <p>Canada <Link target="_blank" href="tel:+16475580588">+1 647 558 0588</Link> (or <Link target="_blank" href="tel:+16475580588,,255772843#,#">one-touch mobile</Link>)</p>
            <p>United States <Link target="_blank" href="tel:+17207072699">+1 720 707 2699</Link>, (or <Link target="_blank" href="tel:+17207072699,,255772843#,#">one-touch mobile</Link>)</p>

            <p>The meeting ID is: <span className={classes.standout}>255 772 843 #</span>,
            then <span className={classes.standout}>press # again</span> when prompted for the participant ID.</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closePhone}>Cancel</Button>
          </DialogActions>
          </Dialog>
      </CardContent>
      <CardActions className={classes.center}>
      {attending && url && <Button color="secondary" variant="contained" target="_blank" href={url}>Join Internet</Button>}
      {attending && <Button color="secondary" variant="contained" onClick={this.openPhone}>Join Telephone</Button>}
      {!attending && <Button color="secondary" variant="contained"
          onClick={this.updateAttendance(true)}>Claim a spot</Button>}
      {attending && <Button variant="contained"
          onClick={this.updateAttendance(false)}>Give up your spot</Button>}
      </CardActions>
    </Card></EmptyState>;
  }
}

export default withStyles(styles)(LiveStreamContent);
