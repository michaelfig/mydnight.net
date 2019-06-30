import React, { Component } from 'react';

import { Link as RouterLink } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

import EmptyState from '../../layout/EmptyState/EmptyState';

const styles = (theme) => ({
  emptyStateIcon: {
    fontSize: theme.spacing(12)
  },

  button: {
    marginTop: theme.spacing(1)
  },

  buttonIcon: {
    marginRight: theme.spacing(1)
  },
  
});

class HomeContent extends Component {
  when = new Date('2019-07-07T13:00-0600').toLocaleString();
  
  render() {
    // Styling
    return <EmptyState>
    <p>Our dear Stewart passed away unexpectedly Thursday, June 27, 2019 at the age of 33.</p>

<p>Reflecting the thoughtful and heartfelt spirit in which Stewart shared his many stories,
  we will be holding a memorial service where participants can reflect, and choose to share
  something from the heart.  You are free to prepare something to share (thoughts, feelings,
  a poem, some music, or other), to do something impromptu as you feel led, or just to listen.</p>

<p>You can consider whether you want to go up to the podium and be recorded or share audio only
from a microphone at your seat.  You will also have the option of having your name and
relationship to Stewart displayed on screen to the participants.</p>

<p>In honor of Stewart’s career, we will be live streaming the memorial service, and recording
and publishing it for the future. The live stream, recording and other contributions in
Stewart’s memory will be available from <Link href="https://mydnight.net/">mydnight.net</Link>.</p>

<p>The memorial will be held Sunday July 7th, at 1pm Central Standard Time (your time: {this.when}),
in the <Link target="_blank" rel="noreferrer" href="https://goo.gl/maps/9SdmvWqRDLo85dyz5">Oxbow (Saskatchewan) Seniors' Centre</Link>. A graveside committal at 
the <Link target="_blank" rel="noreferrer" href="https://goo.gl/maps/ESmHqLmF5zjdME5S9">Glen Ewen</Link> cemetery will occur following the memorial, with a brief lunch to
follow. If you are in need of assistance seating at the gravesite, please feel
free to bring your own chair.  Please
visit <Link href="https://mydnight.net/">https://mydnight.net</Link> for updated
information and <Link to="/rsvp" component={RouterLink}>to fill out the RSVP form</Link>.</p>

<p>As per <Link target="_blank" rel="noreferrer" href="https://www.redpathfuneralhome.com/notices/Stewart-Berntson?fbclid=IwAR3WLUKxbXjvX7QA6i4QoTDGbrexUSV0_ZWnJDvi_d4nu40t9VwAF6Lqi-U">the obituary</Link>,
donations in memory of Stewart may be given to:</p>
  <blockquote>Saskatchewan Epilepsy Society<br/>
  114 Maxwell Crescent<br/>
  Saskatoon, SK<br/>
  CANADA&nbsp;&nbsp;&nbsp;S7L 3Y2</blockquote>
  </EmptyState>;
  }
}

export default withStyles(styles)(HomeContent);
