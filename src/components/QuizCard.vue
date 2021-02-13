<template>
  <div class="card bg-dark">
    <img :src="quizImgUrl" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">{{ quiz.name }}</h5>
      <p class="card-text">{{ quiz.description }}</p>

      <router-link v-if="isLoggedIn" :to="{ name: 'DoQuiz', params: { quizId: quiz.id }}" class="btn btn-outline-success w-100">
        Fazer quiz
      </router-link>
      <button v-else class="btn btn-outline-success w-100" @click="showLoginDialog()">
        Fazer quiz
      </button>
    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'
// import Swal from 'sweetalert2'

export default {
  name: 'QuizCard',

  props: {
    quiz: Object
  },

  data () {
    return {
      storageRef: firebase.storage().ref(),
      quizImgUrl: '',
      isLoggedIn: false
    }
  },

  created () {
    this.isLoggedIn = !!this.$store.state.user
    this.authObserver()
    this.fetchImage()
  },

  methods: {
    async fetchImage () {
      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user
        this.$forceUpdate()
      })
    },

    showLoginDialog () {
      this.$bus.$emit('signIn', `/do-quiz/${this.quiz.id}`)

      // Swal.fire(
      //   'Efetue login',
      //   'Faça login para fazer seu quiz',
      //   'warning'
      // )
      // Swal.fire({
      //   title: 'Efetue login',
      //   text: 'Faça login para fazer seu quiz',
      //   icon: 'warning',
      //   showCancelButton: true,
      //   confirmButtonColor: '#3085d6',
      //   cancelButtonColor: '#d33',
      //   confirmButtonText: 'Efetuar login'
      // }).then((result) => {
      //   if (result.isConfirmed) {
      //     Swal.fire(
      //       'Deleted!',
      //       'Your file has been deleted.',
      //       'success'
      //     )
      //   }
      // })
    }
  }
}
</script>

<style scoped>
</style>
