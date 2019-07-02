import settings from './settings';
import firebase from 'firebase/app';
import 'firebase/messaging';
firebase.initializeApp(settings.credentials.firebase);
try {
  firebase.messaging().usePublicVapidKey(settings.credentials.firebase.vapidKey);
} catch (e) {
  console.log(e);
}
