import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import { withStyles } from '@material-ui/core/styles';
// import EmptyState from '../../layout/EmptyState/EmptyState';

import {getRosterIndex} from '../RosterContent/RosterContent';
import {assignPriority, priorityOrder} from '../RegisterContent/RegisterContent';

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
          roster.push(item);
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

      let pss;
      if (to) {
        const presentRef = db.collection('participants').doc(to.participant).collection('presenting').doc(to.id);
        pss = await presentRef.get();
      }
      await db.runTransaction(tx => {
        if (to) {
          const rosterRef = db.collection('roster').doc(to.id);
          const stamps = {
            startStamp: firebase.firestore.FieldValue.serverTimestamp(),
            finishStamp: null,
          };
          if (to.addToRoster) {
            const docInfo = db.collection('roster').doc('info');
            const ss = tx.get(docInfo);
            const data = ss.exists ? ss.data() : {};
            const order = (data.lastOrder || 0) + 1;
            const pdata = pss.exists ? pss.data() : {};
            tx.update(rosterRef, {
              ...pdata,
              order,
              ...stamps,
            });
            tx.set(docInfo, {...data, lastOrder: order});
          } else {
            tx.update(rosterRef, stamps);
          }
        }
        if (from) {
          tx.update(db.collection('roster').doc(from.id), {
            finishStamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
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
      pool.push({...participant, ...item, id});
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
