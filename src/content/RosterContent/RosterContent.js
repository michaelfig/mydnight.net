import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
// import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

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

  card: {
    flexShrink: 0,
    margin: theme.spacing(1),
  }
});

class RosterContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roster: [],
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
          roster[item.order] = item;
        });
        this.setState({roster});
      });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  render() {
    const { roster } = this.state;
    const { classes } = this.props;
    const toShow = [];
    const showAll = /(^\?|&)all($|=|&)/.test(window.location.search);
    for (const item of roster) {
      if (!item || (!showAll && item.finishStamp)) {
        continue;
      }
      const home = item.home ? ` (${item.home})` : '';
      if (item.startStamp) {
        const Title = <React.Fragment>{item.order}.&nbsp;<i>{item.title}</i></React.Fragment>;
        toShow.push(<Card raised={true} key={item.id} className={classes.card}>
          <CardHeader title={Title} subheader={item.name}
            classes={{title: classes.nowPlaying, subheader: classes.subheader}}/>
          <CardContent className={classes.details}>{item.relationship}{home}</CardContent>
          </Card>);
      } else {
        const Title = <React.Fragment>{item.order}.&nbsp;{item.name}</React.Fragment>;
        toShow.push(<Card raised={true} key={item.id} className={classes.card}>
          <CardHeader title={Title} classes={{title: classes.upcoming}}/>
          </Card>);
      }
    }
    return <div className={classes.container}>{toShow}</div>;
  }
}

export default withStyles(styles)(RosterContent);
