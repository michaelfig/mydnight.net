import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel'

const styles = (theme) => ({
  dialog: {
    width: "500px",
  },
});

class SettingsDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {},
    };
  }

  onOkClick = () => {
    const {onSave, onClose} = this.props;
    onSave(this.state.settings);
    onClose();
  };

  MyInput = ({name, label, placeholder, type}) => {
    const id = `settings-input-${name}`;
    return (
      <FormControl margin='normal'>
        <InputLabel htmlFor={id}>{label}</InputLabel>
        <Input id={id} placeholder={placeholder} type={type || 'text'}
          onChange={e => this.setState({settings: {...this.state.settings, [name]: e.target.value}})}
          value={this.state.settings[name]}
          onKeyPress={e => (e.key === 'Enter') && this.onOkClick()}/>
      </FormControl>
    );
  };
  
  componentDidMount() {
    this.setState({settings: this.props.open});
  }

  render() {
    // Properties
    const { fullScreen, open, cancelText, okText } = this.props;

    // Events
    const { onClose } = this.props;
    const onOkClick = this.onOkClick;

    const { classes } = this.props;

    const disableOkButton = false;
    const highlightOkButton = true;

    const onCancelClick = () => {
      onClose();
    };

    return (
      <Dialog fullScreen={fullScreen} open={!!open}
        onClose={onClose} onExited={this.handleExited} onKeyPress={this.handleKeyPress}>
        <DialogTitle>
          Please fill out your profile details
        </DialogTitle>

        <DialogContent className={classes.dialog}>
          <FormGroup>
          <this.MyInput label="Full name" placeholder="Sally Smith" name="name" />
          <this.MyInput label="E-mail address" placeholder="sally@gmail.com" name="email" type="email"/>
          <this.MyInput label="Phone number" placeholder="1-306-555-1212" name="phone" type="tel"/>
          <this.MyInput label="City/town" placeholder="Oxbow" name="home" />
          <this.MyInput label="Relationship to Stewart" placeholder="Friend" name="relationship" />
          </FormGroup>
        </DialogContent>

        {(onCancelClick || onOkClick) &&
          <DialogActions>
            {onCancelClick &&
              <Button color="primary" onClick={onCancelClick}>
                {cancelText || 'Cancel'}
              </Button>
            }

            {onOkClick &&
              <Button color="primary" disabled={disableOkButton} variant={highlightOkButton && 'contained'} onClick={onOkClick}>
                {okText || 'OK'}
              </Button>
            }
          </DialogActions>
        }
      </Dialog>
    );
  }
}

export default withStyles(styles)(SettingsDialog);
