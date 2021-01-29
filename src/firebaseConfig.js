import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyDgFfSSDYLCYMDAUvzLq_5WxaKbaAjy2I8',
  authDomain: 'mequiz-d903c.firebaseapp.com',
  databaseURL: 'https://mequiz-d903c.firebaseio.com',
  projectId: 'mequiz-d903c',
  storageBucket: 'mequiz-d903c.appspot.com',
  messagingSenderId: '235480948836',
  appId: '1:235480948836:web:c122f15c55b2642eadff71',
  measurementId: 'G-65LXEEZPNP'
}

firebase.initializeApp(firebaseConfig)
firebase.analytics()
export default firebase
