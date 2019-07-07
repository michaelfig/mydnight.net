import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
// import EmptyState from '../../layout/EmptyState/EmptyState';

import {getRosterIndex} from '../RosterContent/RosterContent';
import {assignPriority, getPreference, priorityOrder} from '../RegisterContent/RegisterContent';

import firebase from 'firebase/app';
import 'firebase/firestore';
import IconButton from '@material-ui/core/IconButton';
import PostponeIcon from '@material-ui/icons/Redo';
import SoonerIcon from '@material-ui/icons/Undo';

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
      roster: [],
      rosterIndex: 0,
      all: {},
      rawPool: {},
      participants: {},
    };
  }

  componentDidMount() {
    const part = firebase.firestore().collection('participants');
    this.unsubscribePresenting = {};
    this.unsubscribeParticipants = part
      .onSnapshot(querySnapshot => {
        const participants = this.state.participants;
        const remove = {...participants};
        querySnapshot.forEach(ss => {
          delete remove[ss.id];
          if (participants[ss.id]) {
            return;
          }
          participants[ss.id] = {...ss.data(), presenting: {}};
          this.unsubscribePresenting[ss.id] = part.doc(ss.id).collection('presenting')
            .onSnapshot(pquery => {
              const participants = this.state.participants;
              const premove = participants[ss.id].presenting;
              const presenting = {};
              let changed = false;
              const rawPool = this.state.rawPool;
              pquery.forEach(pss => {
                changed = true;
                presenting[pss.id] = pss.data();
                rawPool[pss.id] = {...pss.data(), participant: ss.id};
                delete premove[pss.id];
              });
              participants[ss.id].presenting = presenting;
              Object.keys(premove).forEach(pkey => {
                changed = true;
                delete rawPool[pkey];
              });
              this.setState({participants, ...(changed ? {rawPool} : {})});
            });
          const rawPool = this.state.rawPool;
          let changed = false;
          Object.keys(remove).forEach(key => {
            if (!participants[key]) {
              return;
            }
            this.unsubscribePresenting[key]();
            delete this.unsubscribePresenting[key];
            Object.keys(participants[key].presenting).forEach(pkey => {
              changed = true;
              delete rawPool[pkey];
            });
            delete participants[key];
          });
          this.setState({participants, ...(changed ? {rawPool} : {})})
        });
      });

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
          roster.push({...item, isPool: false});
        });

        const rosterIndex = getRosterIndex(roster);
        this.setState({roster, rosterIndex});
      });
  }

  componentWillUnmount() {
    if (this.unsubscribeParticipants) {
      this.unsubscribeParticipants();
    }
    if (this.unsubscribePresenting) {
      for (const p of Object.values(this.unsubscribePresenting)) {
        p();
      }
    }
    if (this.unsubscribeRoster) {
      this.unsubscribeRoster();
    }
  }

  handleReplenish = event => {
    this.setState({replenish: event.target.checked});
  };

  reset = item => {
    firebase.firestore().collection('roster').doc(item.id).set({
      startStamp: null,
      finishStamp: null,
    }, {merge: true});
  };

  reschedule = async (item, postpone) => {
    if (this.state.roster.includes(item)) {
      if (postpone) {
        firebase.firestore().collection('roster').doc(item.id).delete();
      }
    } else {
      const priority = Math.max(-1000, item.priority + (postpone ? 1000 : -1000));
      const preference = getPreference(priority);
      if (preference === 'now') {
        this.goto(false, item);
      }
      firebase.firestore().collection('participants').doc(item.participant)
        .collection('presenting').doc(item.id).set({
        preference,
      }, {merge: true});
    }
  };

  goto = async (to, toPool) => {
    const { roster, rosterIndex } = this.state;
    const from = roster[rosterIndex];
    const db = firebase.firestore();
    try {
      if (to === undefined && toPool) {
        to = toPool;
      }

      if (to && from && to.id === from.id) {
        return;
      }

      let pss, ss;
      const target = to || toPool || {};
      if (target.participant) {
        ss = await db.collection('participants').doc(target.participant).get();
      }
      if (toPool) {
        const presentRef = db.collection('participants').doc(toPool.participant).collection('presenting').doc(toPool.id);
        pss = await presentRef.get();
      }
      await db.runTransaction(async tx => {
        const rosterRef = db.collection('roster');
        const stamps = {
          startStamp: firebase.firestore.FieldValue.serverTimestamp(),
          finishStamp: null,
        };
        if (pss) {
          // Take something from the pool.
          const lastSnap = await rosterRef.orderBy('order', 'desc').limit(1).get();
          const lastData = (lastSnap.size > 0 && lastSnap.docs[0].data()) || {};
          const order = (lastData.order || 0) + 1;
          const data = ss && ss.exists ? ss.data() : {};
          const pdata = pss.exists ? pss.data() : {};
          tx.set(rosterRef.doc(toPool.id), {
            ...data,
            ...pdata,
            order,
          }, {merge: true});
        }
        if (to) {
          tx.set(rosterRef.doc(to.id), stamps, {merge: true});
        }
        if (from) {
          tx.set(db.collection('roster').doc(from.id), {
            finishStamp: firebase.firestore.FieldValue.serverTimestamp(),
          }, {merge: true});
        }
      });
    } catch (e) {
      console.log(`Error goto from`, from, 'to', to, e);
    }
  };

  render() {
    // Styling
    const {classes} = this.props;

    const {replenish, roster, rawPool, participants, rosterIndex} = this.state;

    const pool = [];
    const inPool = {...rawPool};
    roster.forEach(item => {
      delete inPool[item.id];
    });

    Object.entries(inPool).map(assignPriority).sort(priorityOrder).forEach(([id, item]) => {
      const participant = (item && participants[item.participant]) || {};
      pool.push({...participant, ...item, id, isPool: true});
      delete(inPool[id]);
    });

    console.log('pool', pool);

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
        <CardContent>{item.isPool && item.preference}</CardContent>
        <CardActions className={classes.actions}>
          <IconButton disabled={!item.isPool} title="Sooner"
            onClick={() => this.reschedule(item, false)}><SoonerIcon /></IconButton>
          <IconButton title="Postpone"
            onClick={() => this.reschedule(item, true)}><PostponeIcon /></IconButton>
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
    // console.log(roster, pool);
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
            const next = roster[rosterIndex + 1];
            this.goto(next, replenish && pool[0]);
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
