import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import { withStyles } from '@material-ui/core/styles';
// import EmptyState from '../../layout/EmptyState/EmptyState';

import {getRosterIndex} from '../RosterContent/RosterContent';

import firebase from 'firebase/app';
import 'firebase/firestore';
import IconButton from '@material-ui/core/IconButton';
import PostponeIcon from '@material-ui/icons/Redo';

import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const styles = (theme) => ({
  container: {
    display: 'flex',
    minHeight: '20px',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%',
  },

  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  card: {
    flexShrink: 0,
    margin: theme.spacing(1),
  },

  header: {
    flexGrow: 1,
  },

  pending: {
    color: 'yellow',
  },

  playIcon: {
    height: 38,
    width: 38,
  },

  roster: {},

  finished: {
    color: 'gray',
  },

  pool: {
    color: 'gray',
  },

  actions: {
    flexGrow: 0,
  },
});

class ArrangerContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      replenish: true,
      poolOrder: [],
      roster: [],
      rosterIndex: 0,
      all: {},
      participants: {},
    };
  }

  componentDidMount() {
    this.unsubscribePool = firebase.firestore().collection('pool')
      .onSnapshot(querySnapshot => {
        const pool = {};
        querySnapshot.forEach(ss => {
          pool[ss.id] = ss.data();
        });
        this.setState({all: pool});
      }, err => console.log('cannot listen to pool', err));
    this.unsubscribeParticipants = firebase.firestore().collection('participants')
      .onSnapshot(querySnapshot => {
        const participants = {};
        querySnapshot.forEach(ss => {
          participants[ss.id] = ss.data();
        });
        this.setState({participants});
      }, err => console.log('cannot listen to participants', err));
    this.unsubscribeRoster = firebase.firestore().collection('roster')
      .orderBy('order')
      .onSnapshot(querySnapshot => {
        const roster = [];
        querySnapshot.forEach(doc => {
          const item = {
            ...doc.data(),
            id: doc.id,
            index: roster.length,
          };
          roster.push(item);
        });

        const rosterIndex = getRosterIndex(roster);
        this.setState({roster, rosterIndex});
      });
    this.unsubscribeOrder = firebase.firestore().collection('order')
      .onSnapshot(querySnapshot => {
        const pool = {};
        querySnapshot.forEach(ss => {
          const data = ss.data();
          if (data.pool !== undefined) {
            pool[ss.id] = data;
          }
        });
        const asc = ([aid, a], [bid, b]) =>
          a.priority < b.priority ? -1 :
          (a.priority === b.priority ?
            (a.order < b.order ? -1 :
              (a.order === b.order ?
                (aid < bid ? -1 :
                  (aid === bid ? 0 : 1))
                : 1))
            : 1);
        const poolOrder = Object.entries(pool).sort(asc);
        this.setState({poolOrder});
      }, err => console.log('cannot listen to order', err));
  }

  componentWillUnmount() {
    if (this.unsubscribeOrder) {
      this.unsubscribeOrder();
    }
    if (this.unsubscribeParticipants) {
      this.unsubscribeParticipants();
    }
    if (this.unsubscribeRoster) {
      this.unsubscribeRoster();
    }
    if (this.unsubscribePool) {
      this.unsubscribePool();
    }
  }

  handleReplenish = event => {
    this.setState({replenish: event.target.checked});
  };

  reset = item => {
    firebase.firestore().collection('roster').doc(item.id).update({
      startStamp: null,
      finishStamp: null,
    });
  };

  goto = async (to) => {
    const { roster, rosterIndex } = this.state;
    const from = roster[rosterIndex];
    const db = firebase.firestore();
    try {
      if (to && from && to.id === from.id) {
        return;
      }

      const batch = db.batch();
      if (to && to.addToRoster) {
        const toSet = {...to};
        const ss = await firebase.firestore().collection('participants').doc(to.id).get();
        const data = ss.data();
        for (const key of ['home', 'name', 'relationship']) {
          if (data[key]) {
            toSet[key] = data[key];
          }
        }
        batch.set(db.collection('roster').doc(toSet.id), toSet);
        to = toSet;
      }

      if (to) {
        batch.update(db.collection('roster').doc(to.id), {
          // startStamp: to.startStamp || firebase.firestore.Timestamp.now(),
          startStamp: firebase.firestore.Timestamp.now(),
          finishStamp: null,
        });
      }
      if (from) {
        batch.update(db.collection('roster').doc(from.id), {
          finishStamp: firebase.firestore.Timestamp.now(),
        });
      }
      await batch.commit();
    } catch (e) {
      console.log(`Error goto from`, from, 'to', to, e);
    }
  };

  render() {
    // Styling
    const {classes} = this.props;

    const {replenish, roster, poolOrder, all, participants, rosterIndex} = this.state;

    const pool = [];
    const inPool = {...all};
    roster.forEach(item => {
      delete inPool[item.id];
    });

    poolOrder.forEach(([id, order]) => {
      const item = inPool[id];
      const participant = item && participants[item.participant];
      if (participant) {
        pool.push({...participant, ...item, id, order});
        delete(inPool[id]);
      }
    });

    const makeCard = pool => item => {
      const order = pool ? '' : <React.Fragment>{item.order}.&nbsp;</React.Fragment>
      const Title = <React.Fragment>{order}{item.name} - <i>{item.title}</i></React.Fragment>;
      const home = item.home ? ` (${item.home})` : '';
      const SubH = <React.Fragment>{item.relationship}{home}</React.Fragment>;
      const running = !pool && item.startStamp && !item.finishStamp;
      const color = running ? classes.pending : pool ? classes.pool : item.index < rosterIndex ? classes.finished : classes.roster;
      return <Card key={item.id} className={classes.card}
        onDoubleClickCapture={() => this.goto(pool ? item : roster[item.index])}>
        <div style={{display: 'flex', direction: 'row'}}>
        <CardHeader title={Title} subheader={SubH} classes={{title: color, subheader: color}} 
          className={classes.header} />
        <CardActions className={classes.actions}>
          <IconButton title="Postpone"><PostponeIcon /></IconButton>
          <IconButton aria-label="Play"
            onClick={() => this.goto(pool ? item : roster[item.index])}
          ><PlayArrowIcon />
          </IconButton>
        </CardActions>
        </div>
      </Card>;
    };
    
    const poolItems = pool.map(makeCard(true));
    const comingItems = roster.slice(Math.max(rosterIndex - 1, 0)).map(makeCard())
    console.log(roster, pool);
    return <React.Fragment>
      <FormGroup className={classes.controls}>
        <IconButton aria-label="Previous"
          disabled={!roster[rosterIndex - 1]}
          onClick={() => this.goto(roster[rosterIndex - 1])}
        >
          <SkipPreviousIcon />
        </IconButton>
        <IconButton aria-label="Next"
          disabled={!roster[rosterIndex]}
          onClick={() => {
            let next = roster[rosterIndex + 1];
            if (!next) {
              if (replenish && pool[0]) {
                next = {...pool[0], addToRoster: true};
              }
            }
            this.goto(next);
          }}
        >
          <SkipNextIcon />
        </IconButton>
        <FormControlLabel
          control={
            <Switch checked={replenish} onChange={this.handleReplenish} value={true} />
          }
          label="Take from pool"
          disabled={!pool[0]}
          labelPlacement="bottom"
        />
      </FormGroup>
      <div className={classes.container}>
      {comingItems}
      {poolItems}
      </div>
      </React.Fragment>;
  }
}

export default withStyles(styles)(ArrangerContent);
