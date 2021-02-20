<template>
  <div>
    <div class="container text-left mt-3">

      <h4>Últimas {{ notificationResultLimit }} notificações</h4>
      <div v-for="noti in notifications" :key="noti.id" class="card bg-dark mb-2">
        <div class="card-body">
          <b>{{ noti.data().notificationTitle }}</b>
          <div>{{ noti.data().notificationBody }}</div>
          <div>
            <small class="text-muted">{{ noti.data().createdAt.toDate().toLocaleString() }}</small>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'Admin',

  components: {
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      isLoading: {
        notifications: false
      },

      notifications: [],
      notificationResultLimit: 16
    }
  },

  created () {
    this.fetchNotifications()
  },

  methods: {
    async fetchNotifications () {
      const data = await this.db.collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(this.notificationResultLimit)
        .get()
      this.notifications = data.docs
    }
  }
}
</script>
