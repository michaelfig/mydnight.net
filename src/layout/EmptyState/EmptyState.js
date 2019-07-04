import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

const styles = {
  center: {
    padding: '10px',
    minHeight: '20px',
    flexGrow: 1,
    flexShrink: 1,
    fontSize: '14pt',
    justifyContent: 'center',
    overflowY: 'auto',
    textAlign: 'center',
  }
};

class EmptyState extends Component {
  render() {
    // Styling
    const { classes } = this.props;

    // Properties
    const { children, icon, title, description, button } = this.props;

    return (
      <div className={classes.center}>
        {icon}
        {title && <Typography color="textSecondary" variant="h4">{title}</Typography>}
        {description && <Typography color="textSecondary" variant="subtitle1">{description}</Typography>}
        {children}
        {button}
      </div>
      );
  }
}

EmptyState.propTypes = {
  classes: PropTypes.object.isRequired,

  icon: PropTypes.element,
  title: PropTypes.string,
  description: PropTypes.string,
  button: PropTypes.element
};

export default withStyles(styles)(EmptyState);
