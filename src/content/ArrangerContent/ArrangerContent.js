import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import EmptyState from '../../layout/EmptyState/EmptyState';

const styles = (theme) => ({
});

class ArrangerContent extends Component {
  render() {
    // Styling
    return <EmptyState>
      <p>Would arrange</p>
      </EmptyState>;
  }
}

export default withStyles(styles)(ArrangerContent);
