import React from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

class RosterContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roster: [],
    };
  }

  componentDidMount() {
    this.unsubscribe = db.collection('locked')
      .orderBy('order')
      .onSnapshot(querySnapshot => {
        const roster = [];
        querySnapshot.forEach(doc => {
          const item = {
            ...doc.data(),
            id: doc.id,
          };
          roster.push(item);
        });
        this.setState({roster});
      });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  render() {
    const roster = this.state.roster.map((item, i) => (
      i === 0 ? <div key={item.id}>{item.participant} - <i>{item.title}</i><br/>
        {item.relationship} ({item.home})</div> :
      <div key={item.id}>{item.participant} ({item.home})</div>
    ));
    return (
      <div>
        Would show roster.
        {roster}
      </div>
    )
  }
}

export default RosterContent;
