import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import EmptyState from '../../layout/EmptyState/EmptyState';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel'
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import PlusIcon from '@material-ui/icons/Add';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import IconButton from '@material-ui/core/IconButton/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

// Assign a priority to the entry.
export const assignPriority = ([id, item]) => {
  let priority;
  switch (item.preference) {
    case 'now':
      priority = -1000;
      break;
    case 'immediate':
      priority = 0;
      break;
    case 'beginning':
      priority = 1000;
      break;
    case 'any':
      priority = 2000;
      break;
    case 'end':
      priority = 3000;
      break;
    case 'closing':
      priority = 4000;
      break;
    case 'after':
      priority = 5000;
      break;
    case 'nogo':
      priority = 6000;
      break;
    default:
      priority = 2000;
  }
  const order = item.stamp ? item.stamp.seconds + item.stamp.nanoseconds / 10 ** 9: +Infinity;
  return [id, {...item, priority, order}];
};

export const getPreference = priority => {
  if (priority < 0) {
    return 'now';
  } else if (priority < 1000) {
    return 'immediate';
  } else if (priority < 2000) {
    return 'beginning';
  } else if (priority < 3000) {
    return 'any';
  } else if (priority < 4000) {
    return 'end';
  } else if (priority < 5000) {
    return 'closing';
  } else if (priority < 6000) {
    return 'after';
  }
  return 'nogo';
};

// Priority is low to high, order is low to high.
export const priorityOrder = ([aid, a], [bid, b]) => (
  a.priority < b.priority ? -1 :
    a.priority === b.priority ? (
      a.order < b.order ? -1 :
        a.order === b.order ? (
          aid < bid ? -1 :
            aid === bid ? 0 : 1
        ) : 1
      )   : 1
);

const styles = (theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  dialog: {
    width: "500px",
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(8),
    right: theme.spacing(2),
  },
  actions: {
    flexGrow: 0,
  },
  header: {
    flexGrow: 1,
  },
  card: {
    margin: theme.spacing(1),
  },
});

class RegisterContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profileRatio: [1, 1],
      presenting: {},
      editId: undefined,
      editing: false,
    };
  }

  componentDidMount() {
    this.unsubscribeAuth = firebase.auth().onAuthStateChanged(
      user => {
        if (this.unsubscribeParticipant) {
          this.unsubscribeParticipant();
        }
        if (!user) {
          return;
        }
        const participant = firebase.firestore().collection('participants').doc(user.uid);
        this.unsubscribeParticipant = participant.onSnapshot(
          ss => {
            const data = ss.exists ? ss.data() : {};
            let upper = 0, lower = 0;
            let home = data.home || '';
            for (const key of ['email', 'phone', 'name', 'home', 'relationship']) {
              if (data[key]) {
                upper ++;
              }
              lower ++;
            }
            this.setState({profileRatio: [upper, lower], home});
          });
        this.unsubscribePresenting = participant.collection('presenting').onSnapshot(
          docs => {
            const presenting = {};
            let add = this.defaultEditing();
            docs.forEach(ss => {
              presenting[ss.id] = ss.data();
              add = {};
            });
            this.setState({presenting, ...add});
          }
        );
      });
  }

  defaultEditing = () => {
    const user = firebase.auth().currentUser || {};
    return {editId: undefined, editing: {
      title: 'Reflections',
      name: user.displayName || 'Anonymous',
      relationship: 'Friend',
      preference: 'any',
      recorded: 'video',
      home: this.state.home || '',
      user: user.displayName || '',
      venue: 'oxbow',
    }};
  };

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.unsubscribeParticipant) {
      this.unsubscribeParticipant();
    }
    if (this.unsubscribePresenting) {
      this.unsubscribePresenting();
    }
  }

  onClose = () => {
    this.setState({editId: undefined, editing: false});
  };

  deleteItem = (id) => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('participants').doc(user.uid).collection('presenting').doc(id).delete();
  };

  onOkClick = () => {
    const { editing, editId } = this.state;
    const user = firebase.auth().currentUser;
    const toAdd = {stamp: firebase.firestore.FieldValue.serverTimestamp(), ...editing};
    let p = firebase.firestore().collection('participants').doc(user.uid).collection('presenting');
    if (editId) {
      p = p.doc(editId).set(toAdd);
    } else {
      p = p.add(toAdd);
    }
    p.then(this.onClose);
  };

  render() {
    // Properties
    const { cancelText, okText, isArranger } = this.props;

    // Events
    const { openProfile } = this.props;

    const { classes } = this.props;

    const { profileRatio, presenting, editing, editId, dismissed } = this.state;

    const { name, title, text, venue, home, recorded, relationship, preference, user } = editing || {};

    const disableOkButton = false;
    const highlightOkButton = true;

    const onCancelClick = this.onClose;
    const onOkClick = this.onOkClick;

    const percent = profileRatio[1] <= 0 ? 0 : Math.round(profileRatio[0] / profileRatio[1] * 100);
    const profile = percent < 100 && !dismissed && <Card>
      <CardContent>
        You have filled out {percent}% of your profile.
      </CardContent>
      <CardActions>
        <Button color="secondary" onClick={openProfile}>Edit profile</Button>
        <Button onClick={() => this.setState({dismissed: true})}>Dismiss</Button>
      </CardActions>
    </Card>

    const buildEditor = (pid, p) => (
      <Card key={pid || 'new'} className={classes.card}>
        <CardHeader title={!pid ? "New Presentation" : "Edit Presentation"} />
        <CardContent className={classes.content}>
          <Grid container spacing={1} alignItems='flex-start'>
          <Grid item xs={12} md={6}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-title">Your name</InputLabel>
            <Input id="present-id-title"
              onChange={e => this.setState({editing: {...this.state.editing, name: e.target.value, ...(user ? {} : {user: e.target.value})}})}
              value={name}/>
          </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-title">Title for presentation</InputLabel>
            <Input id="present-id-title"
              onChange={e => this.setState({editing: {...this.state.editing, title: e.target.value}})}
              value={title}/>
          </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-home">Your city/town</InputLabel>
            <Input id="present-id-home"
              onChange={e => this.setState({editing: {...this.state.editing, home: e.target.value}})}
              value={home}/>
          </FormControl>
          </Grid>

          <Grid item xs={6} sm={2}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-venue">Current location</InputLabel>
            <Select id="present-id-venue"
              onChange={e => this.setState({editing: {...this.state.editing, venue: e.target.value}})}
              value={venue}
            >
              <MenuItem value="oxbow">Oxbow</MenuItem>
              <MenuItem value="livestream">Live Stream</MenuItem>
            </Select>
          </FormControl>
          </Grid>

          <Grid item xs={6} sm={4}>
          <FormControl margin='normal' disabled={venue !== 'livestream'} style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-user">Live stream user name</InputLabel>
            <Input id="present-id-user"
              onChange={e => this.setState({editing: {...this.state.editing, user: e.target.value}})}
              value={user}/>

          </FormControl>
          </Grid>


          <Grid item xs={12}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-relationship">Relationship to Stewart</InputLabel>
            <Input id="present-id-relationship"
              onChange={e => this.setState({editing: {...this.state.editing, relationship: e.target.value}})}
              value={relationship}/>

          </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <FormLabel component="legend">Presentation order preference:</FormLabel>
            <RadioGroup
              aria-label="Order preference"
              name="preference"
              value={preference}
              onChange={ev => this.setState({editing: {...editing, preference: ev.target.value}})}
            >
    {isArranger && <FormControlLabel value="immediate" control={<Radio />} label="Immediate" />}
              <FormControlLabel value="any" control={<Radio />} label="Any" />
              <FormControlLabel value="beginning" control={<Radio />} label="Near the beginning of the service" />
              <FormControlLabel value="end" control={<Radio />} label="Near the end of the service" />
    {isArranger && <FormControlLabel value="veryEnd" control={<Radio />} label="At the very end" />}
              <FormControlLabel value="after" control={<Radio />} label="Record after the service" />
            </RadioGroup>
          </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <FormLabel component="legend">Recording preference:</FormLabel>
            <RadioGroup
              aria-label="Recording"
              name="recorded"
              value={recorded}
              onChange={ev => this.setState({editing: {...editing, recorded: ev.target.value}})}
            >
              <FormControlLabel value="video" control={<Radio />} label="Audio and video (Present at podium)" />
              <FormControlLabel value="audio" control={<Radio />} label="Audio only (Present from seat)" />
              <FormControlLabel value="proxy" control={<Radio />} label="Have someone read text for you" />
            </RadioGroup>
          </FormControl>
          </Grid>

          <Grid item xs={12}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-text">Presentation text (if any)</InputLabel>
            <Input id="present-id-text"
              onChange={e => this.setState({editing: {...this.state.editing, text: e.target.value}})}
              multiline={true}
              value={text}/>
          </FormControl>
          </Grid>

          </Grid>
        </CardContent>
        <CardActions style={{justifyContent: 'center'}}>
          {onCancelClick &&
            <Button color="primary" onClick={onCancelClick}>
              {cancelText || 'Cancel'}
            </Button>
          }

          {onOkClick &&
            <Button color="secondary" disabled={disableOkButton} variant={highlightOkButton && 'contained'} onClick={onOkClick}>
              {okText || 'OK'}
            </Button>
          }
        </CardActions>
      </Card>
    );

    const startEdit = (editId, editing) => {
      if (!editing) {
        return () => this.setState(this.defaultEditing());
      }
      return () => this.setState({editing, editId});
    };

    // console.log(presenting);
    let nowEditing;
    const cards = Object.entries(presenting).map(assignPriority).sort(priorityOrder).map(([pid, p]) => {
      if (pid === editId) {
        nowEditing = [pid, editing];
        return;
      }
        return <Card key={pid} className={classes.card}>
          <div style={{display: 'flex', direction: 'row'}}>
          <CardHeader className={classes.header} title={p.title} subheader={p.name} />
          <CardActions className={classes.actions}>
            <IconButton onClick={() => this.deleteItem(pid)}><DeleteIcon /></IconButton>
            <IconButton onClick={startEdit(pid, p)}><EditIcon /></IconButton>
          </CardActions>
          </div>
        </Card>;
    });

    if (editing && !editId) {
      nowEditing = [undefined, editing];
    }
    if (nowEditing) {
      cards.unshift(buildEditor(...nowEditing));
    }

    return (
      <EmptyState className={classes.top}>
        {'' && profile}
        {cards}
        {!editing && <Fab className={classes.fab} color="secondary" aria-label="Add"
          onClick={startEdit()}><PlusIcon/></Fab>}
      </EmptyState>
    );
  }
}

export default withStyles(styles)(RegisterContent);
