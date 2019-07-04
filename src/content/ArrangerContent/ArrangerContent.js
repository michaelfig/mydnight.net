import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import { withStyles } from '@material-ui/core/styles';
import EmptyState from '../../layout/EmptyState/EmptyState';

import firebase from 'firebase/app';
import 'firebase/firestore';
import IconButton from '@material-ui/core/IconButton';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ReplayIcon from '@material-ui/icons/Redo';
import CancelIcon from '@material-ui/icons/Cancel';
import FinishIcon from '@material-ui/icons/AlarmOff';
import StartIcon from '@material-ui/icons/AlarmOn';

const styles = (theme) => ({
  container: {
    display: 'flex',
    minHeight: '20px',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%',
    padding: theme.spacing(1),
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
      poolOrder: [],
      roster: [],
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
          };
          roster[item.order] = item;
        });
        this.setState({roster});
      });
    this.unsubscribeOrder = firebase.firestore().collection('order')
      .onSnapshot(querySnapshot => {
        const pool = {};
        querySnapshot.forEach(ss => {
          const data = ss.data();
          if (data.pool !== undefined) {
            pool[ss.id] = data.pool;
          }
        });
        const asc = ([aid, aorder], [bid, border]) =>
          aorder < border ? -1 :
          (aorder === border ?
            (aid < bid ? -1 :
              (aid === bid ? 0 : 1))
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
  
  render() {
    // Styling
    const {classes} = this.props;

    const {roster, poolOrder, all, participants} = this.state;

    const pool = [];
    const inPool = {...all};
    roster.forEach(item => {
      delete inPool[item.id];
    });

    let rosterIndex = 0;
    while (rosterIndex < roster.length && roster[rosterIndex] && roster[rosterIndex].finishStamp) {
      rosterIndex ++;
    }

    let middleIndex;
    poolOrder.forEach(([id, order]) => {
      const item = inPool[id];
      const participant = item && participants[item.participant];
      if (participant) {
        if (middleIndex === undefined && item.preference !== 'first') {
          middleIndex = pool.length;
        }
        pool.push({...participant, ...item, id, order});
        delete(inPool[id]);
      }
    });

    middleIndex = middleIndex || 0;

    const getOrder = (index) => poolOrder[index] ? poolOrder[index][1] : 0;
    const middleOrder = getOrder(middleIndex);
    const firstOrder = getOrder(0);
    const lastOrder = getOrder(poolOrder.length - 1);

    for (const id of Object.keys(inPool)) {
      const item = inPool[id];
      const participant = (item && participants[item.participant]) || {};
      if (item.preference === 'first') {
        pool.unshift({...participant, ...item, order: firstOrder, id});
      } else if (item.preference === 'last') {
        pool.push({...participant, ...item, order: middleOrder, id});
      } else {
        pool.splice(middleIndex, 0, {...participant, ...item, order: lastOrder, id});
      }
    }
    
    const makeCard = pool => item => {
      const order = pool ? '' : <React.Fragment>{item.order}.&nbsp;</React.Fragment>
      const Title = <React.Fragment>{order}{item.name} - <i>{item.title}</i></React.Fragment>;
      const home = item.home ? ` (${item.home})` : '';
      const SubH = <React.Fragment>{item.relationship}{home}</React.Fragment>;
      const running = !pool && item.startStamp && !item.finishStamp;
      const color = running ? classes.pending : pool ? classes.pool : item.finishStamp ? classes.finished : classes.roster;
      return <Card key={item.id} className={classes.card}>
        <div style={{display: 'flex', direction: 'row'}}>
        <CardHeader title={Title} subheader={SubH} classes={{title: color, subheader: color}} 
          className={classes.header} />
        <CardActions className={classes.actions}>
          {!pool && !item.startStamp &&
            <IconButton title="Start" size="small"><StartIcon /></IconButton>}
          {!pool && item.finishStamp &&
            <IconButton title="Replay" size="small"><ReplayIcon /></IconButton>}
          {!pool && !item.startStamp &&
            <IconButton title="Cancel" size="small"><CancelIcon /></IconButton>}
          {running &&
            <IconButton title="Finish" size="small"><FinishIcon /></IconButton>}
          {pool &&
            <IconButton title="Schedule" size="small"><ScheduleIcon /></IconButton>}
        </CardActions>
        </div>
      </Card>;
    };
    
    const poolItems = pool.map(makeCard(true));
    const comingItems = roster.slice(Math.max(rosterIndex - 1, 0)).map(makeCard())
    return <React.Fragment>
      <EmptyState className={classes.container}>
        {comingItems}
      </EmptyState>
      <EmptyState className={classes.container}>
        {poolItems}
      </EmptyState>
      </React.Fragment>;
  }
}

export default withStyles(styles)(ArrangerContent);
