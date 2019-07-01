import React, {Component} from 'react';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';
import EmptyState from '../EmptyState/EmptyState';

const styles = (theme) => ({
  circularProgress: {
    // marginTop: '50%',
    position: 'relative',
    top: '50%',
    marginTop: '-20px',
  }
});

class LaunchScreen extends Component {
  render() {
    // Styling
    const { classes } = this.props;

    return (
      <EmptyState>
        <CircularProgress className={classes.circularProgress} />
      </EmptyState>
    );
  }
}

LaunchScreen.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LaunchScreen);