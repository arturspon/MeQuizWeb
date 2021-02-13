<template>
  <div>
    <Navbar :active-link="'friends'" />

    <div class="container mt-3">

      <div v-if="isLoading.friendQuizzes" class="text-center">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>

      <template v-if="friendQuizzes.length > 0">
        <FriendQuizzesCard
          v-for="(quizzes, index) in friendQuizzes"
          :key="index"
          :friendQuizzes="quizzes"
        />
      </template>

    </div>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import Navbar from '@/components/Navbar'
import FriendQuizzesCard from '@/components/FriendQuizzesCard'

export default {
  name: 'Profile',

  components: {
    Navbar,
    FriendQuizzesCard
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      isLoading: {
        friendQuizzes: false,
        loginCheck: false
      },
      isLoggedIn: false,

      userId: null,
      friendQuizzes: []
    }
  },

  created () {
    this.userId = localStorage.getItem('uid')
    this.authObserver()
    this.fetchFriendQuizzes()
  },

  methods: {
    async fetchFriendQuizzes () {
      this.isLoading.friendQuizzes = true

      const friends = (await this.db
        .collection('users')
        .doc(this.userId)
        .get()).data().friends

      const friendQuizzesPromises = friends.map(async friendId => {
        return await this.db.collection('activeQuizzes')
          .doc(friendId)
          .collection('userQuizzes')
          .orderBy('date', 'desc')
          .get()
      })

      const response = await Promise.all(friendQuizzesPromises)
      const friendQuizzes = response.map(friendQuizzes => {
        return friendQuizzes.docs.length > 0
          ? friendQuizzes.docs.map(friendQuiz => friendQuiz.data()) : null
      })
      this.friendQuizzes = friendQuizzes.filter(fq => fq != null)

      this.isLoading.friendQuizzes = false
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user

        if (user) {
          this.userId = user.uid
          this.$store.commit('setUser', user)
        }

        this.isLoading.loginCheck = false
      })
    }
  }
}
</script>