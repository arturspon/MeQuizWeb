<template>
  <div>
    <div class="container text-left mt-3">

      <h4>Últimas {{ notificationResultLimit }} notificações</h4>

      <div v-if="isLoading.notifications" class="text-center mt-4">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>

      <div v-else v-for="noti in notifications" :key="noti.id" class="card bg-dark mb-2">
        <div class="card-body">
          <b>{{ noti.data().notificationTitle }}</b>
          <br>
          <code>{{ noti.data().notificationBody }}</code>
          <div>
            <small>Para: {{ noti.data().targetUserName }}</small>
            <br>
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
      this.isLoading.notifications = true

      const data = await this.db.collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(this.notificationResultLimit)
        .get()
      this.notifications = data.docs

      this.isLoading.notifications = false
    }
  }
}
</script>
