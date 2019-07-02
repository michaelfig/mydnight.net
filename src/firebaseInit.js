import settings from './settings';
import firebase from 'firebase/app';
firebase.initializeApp(settings.credentials.firebase);
