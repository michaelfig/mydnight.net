import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import EmptyState from '../../layout/EmptyState/EmptyState';

const styles = (theme) => ({
  frame: {
    minHeight: '20px',
    margin: '0px',
    padding: '0px',
    width: '100%',
    height: '8000px',
  },
});

class RSVPContent extends Component {
  render() {
    const {classes} = this.props;
    return <EmptyState>
    <iframe className={classes.frame}
      title="Stewart Berntson Memorial Privacy Policy"
      src="https://www.termsfeed.com/privacy-policy/1e1fbb92592f98f1a4a148bf22a09fc7"
      frameBorder="0">Loading...</iframe>
    </EmptyState>
  }
}

export default withStyles(styles)(RSVPContent);
