import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import EmptyState from '../../layout/EmptyState/EmptyState';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';

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
            for (const key of ['email', 'phone', 'name', 'home', 'relationship']) {
              if (data[key]) {
                upper ++;
              }
              lower ++;
            }
            this.setState({profileRatio: [upper, lower]});
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
      preference: 'any',
      recorded: 'video',
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
    const { cancelText, okText } = this.props;

    // Events
    const { openProfile } = this.props;

    const { classes } = this.props;

    const { profileRatio, presenting, editing, editId, dismissed } = this.state;

    const { name, title, text, recorded, preference } = editing || {};

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

    const asc = ([aid, a], [bid, b]) => (
      a.stamp === null && b.stamp !== null ? -1 :
        a.stamp === null && b.stamp === null ? (
      a.stamp.seconds < b.stamp.seconds ? -1 :
        a.stamp.seconds === b.stamp.seconds ? 
          (a.stamp.nanoseconds < b.stamp.nanoseconds ? -1 :
            a.stamp.nanoseconds === b.stamp.nanoseconds ? (
              aid < bid ? -1 : aid === bid ? 0 : 1
            ) : 1
          ) : 1
        ) : 1
    );
    const buildEditor = (pid, p) => (
      <Card key={pid || 'new'} className={classes.card}>
        <CardHeader title={!pid ? "New Presentation" : "Edit Presentation"} />
        <CardContent className={classes.content}>
          <Grid container spacing={1} alignItems='flex-start'>
          <Grid item xs={12} md={6}>
          <FormControl margin='normal' style={{width: '100%'}}>
            <InputLabel htmlFor="present-id-title">Your name</InputLabel>
            <Input id="present-id-title"
              onChange={e => this.setState({editing: {...this.state.editing, name: e.target.value}})}
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
          <FormControl margin='normal'>
            <FormLabel component="legend">Presentation order preference:</FormLabel>
            <RadioGroup
              aria-label="Order preference"
              name="preference"
              value={preference}
              onChange={ev => this.setState({editing: {...editing, preference: ev.target.value}})}
            >
              <FormControlLabel value="any" control={<Radio />} label="Any" />
              <FormControlLabel value="beginning" control={<Radio />} label="Near the beginning of the service" />
              <FormControlLabel value="end" control={<Radio />} label="Near the end of the service" />
              <FormControlLabel value="after" control={<Radio />} label="Record after the service" />
            </RadioGroup>
          </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
          <FormControl margin='normal'>
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
            <InputLabel htmlFor="present-id-text">Presentation text</InputLabel>
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
    const cards = Object.entries(presenting).sort(asc).map(([pid, p]) => {
      if (pid !== editId) {
        return <Card key={pid} className={classes.card}>
          <div style={{display: 'flex', direction: 'row'}}>
          <CardHeader className={classes.header} title={p.title} subheader={p.name} />
          <CardActions className={classes.actions}>
            <IconButton onClick={() => this.deleteItem(pid)}><DeleteIcon /></IconButton>
            <IconButton onClick={startEdit(pid, p)}><EditIcon /></IconButton>
          </CardActions>
          </div>
        </Card>;
      }
      return buildEditor(pid, editing);
    });

    if (editing && !editId) {
      cards.push(buildEditor(undefined, editing));
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
