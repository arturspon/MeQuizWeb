<template>
  <div>
    <Navbar :active-link="'friends'" />

    <div class="container mt-3">

      <div v-if="isLoading.friendQuizzes" class="text-center">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>

      <div v-if="!hasFriends" class="alert alert-warning text-center">
        Nenhum amigo respondeu seus quizzes ainda.
        <br>
        Faz um quiz e envie para ele responder 😀
        <br>
        <router-link to="/home" class="btn btn-info mt-1">
          Ver quizzes
        </router-link>
      </div>

      <div v-else-if="!isLoading.friendQuizzes" class="form-group mt-3">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Procure por algum amigo aqui..."
        >
      </div>

      <div v-if="areAllFriendsHidden()" class="alert alert-warning">
        Nenhum amigo encontrado com esse nome.
        <br>
        Tente refinar sua pesquisa.
      </div>

      <template v-if="friendQuizzes.length > 0">
        <FriendQuizzesCard
          v-for="(quizzes, index) in friendQuizzes"
          :key="index"
          :friendQuizzes="quizzes"
          :searchQuery="searchQuery"
          ref="friendQuizCard"
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
      hasFriends: true,

      userId: null,
      friendQuizzes: [],

      searchQuery: ''
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

      const friendsDoc = await this.db
        .collection('users')
        .doc(this.userId)
        .get()

      if (!friendsDoc.exists) {
        this.hasFriends = false
        this.isLoading.friendQuizzes = false
        return
      }

      const friends = friendsDoc.data().friends

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
    },

    areAllFriendsHidden () {
      const friendQuizCards = this.$refs.friendQuizCard

      if (!friendQuizCards) {
        return false
      }

      return friendQuizCards.every(quiz => !quiz.isVisible())
    }
  }
}
</script>
