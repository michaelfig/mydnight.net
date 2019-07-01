import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import EmptyState from '../../layout/EmptyState/EmptyState';

const styles = (theme) => ({
  frame: {
    minHeight: '20px',
    margin: '0px',
    padding: '0px',
    width: '100%',
    height: '100%',
    flexGrow: 1,
    flexShrink: 1,
    overflowY: 'auto',
  },
});

class RSVPContent extends Component {
  render() {
    const {classes} = this.props;
    return <iframe className={classes.frame}
      title="Stewart Berntson Memorial RSVP"
      src="https://docs.google.com/forms/d/e/1FAIpQLSf8ue-sMmm1rhS_Njr2OqwkPqnvYO9wN50gPeSc6ntX9EvDSQ/viewform?embedded=true"
      frameBorder="0">Loading...</iframe>;
  }
}

export default withStyles(styles)(RSVPContent);
