import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
// import EmptyState from '../../layout/EmptyState/EmptyState';

import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

export function getRosterIndex(roster) {
  let i = 0;
  let rosterIndex;
  while (i < roster.length) {
    if (!roster[i].finishStamp) {
      if (roster[i].startStamp) {
        // First playing.
        rosterIndex = i;
        break;
      }
      // Next not finished.
      rosterIndex = i;
    }
    i ++;
  }
    
  if (rosterIndex === undefined) {
    rosterIndex = roster.length;
  }
  return rosterIndex;
};

const styles = theme => ({
  nowPlaying: {
    color: 'yellow',
    fontSize: '12vmin',
  },
  details: {
    color: 'yellow',
    fontSize: '9vmin',
  },
  subheader: {
    color: 'yellow',
    fontSize: '9vmin',
  },
  upcoming: {
    fontSize: '8vmin',
  },
  container: {
    display: 'flex',
    minHeight: '20px',
    flexDirection: 'column',
    overflowY: 'hidden',
    height: '100%',
    padding: theme.spacing(1),
  },

  center: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    justifyContent: 'space-around',
    textAlign: 'center',
  },

  spread: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    flexShrink: 0,
    margin: theme.spacing(1),
  },

  time: {
    position: 'absolute',
    top: 'calc(100% - 14vmin)',
    fontSize: '9vmin',
    left: 'calc(100% - 42vmin)',
    color: 'yellow',
    margin: 0,
  },
});

const timeConv = (d) => d.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});

class RosterContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      now: new Date(),
      roster: [],
      MAX_ENTRIES: 3,
    };
  }

  componentDidMount() {
    this.unsubscribe = db.collection('roster')
      .orderBy('order')
      .onSnapshot(querySnapshot => {
        const roster = [];
        querySnapshot.forEach(doc => {
          const item = {
            ...doc.data(),
            id: doc.id,
          };
          roster.push(item);
        });
        this.setState({roster});
      });
    this.ticker = setInterval(() => this.setState({now: new Date()}), 900);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    clearInterval(this.ticker);
  }
  
  render() {
    const { roster, MAX_ENTRIES } = this.state;
    const { classes } = this.props;
    const showAll = /(^\?|&)all($|=|&)/.test(window.location.search);

    const rosterIndex = getRosterIndex(roster);
    const ended = roster.length > 0 && rosterIndex === roster.length && roster[roster.length - 1].finishStamp;

    const toShow = roster.slice(rosterIndex).map((item, i) => {
      if (!showAll && i >= MAX_ENTRIES) {
        return undefined;
      }
      const home = item.home ? ` (${item.home})` : '';
      if (item.startStamp && !item.finishStamp) {
        const Title = <React.Fragment>{item.order}.&nbsp;<i>{item.title}</i></React.Fragment>;
        const d = new Date();
        d.setTime(item.startStamp.seconds * 1000);
        const start = '' && timeConv(d);
        const Subh = <div className={classes.spread}><div>{item.name}</div> <div>{start}</div></div>;
        return (<Card raised={true} key={item.id} className={classes.card}>
          <CardHeader title={Title} subheader={Subh}
            classes={{title: classes.nowPlaying, subheader: classes.subheader}}/>
          <CardContent className={classes.details}>{item.relationship}{home}</CardContent>
          </Card>);
      } else {
        const Title = <React.Fragment>{item.order}.&nbsp;{item.name}{home}</React.Fragment>;
        return (<Card raised={true} key={item.id} className={classes.card}>
          <CardHeader title={Title} classes={{title: classes.upcoming}}/>
          </Card>);
      }
    });

    // this.state.now.setHours(12);
    const now = '' && <Typography className={classes.time}>{timeConv(this.state.now)}</Typography>;
    const Roster = ended ? <div className={classes.center}><Typography className={classes.upcoming}>The memorial has ended.</Typography></div> :
      <div className={classes.container}>{toShow}</div>;
    return <React.Fragment>{Roster}{now}</React.Fragment>;
  }
}

export default withStyles(styles)(RosterContent);
