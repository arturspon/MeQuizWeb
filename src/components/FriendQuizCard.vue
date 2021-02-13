<template>
  <div class="mb-2">
    <div class="card bg-dark text-left">
      <img :src="quizImgUrl" class="card-img">
      <div class="card-img-overlay">

        <div v-if="isLoading.quiz" class="d-flex justify-content-center">
          <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
            <span class="sr-only">Carregando...</span>
          </div>
        </div>

        <div v-else>
          <h5 class="card-title mr-2">
            {{ quiz.name }}
            <small v-if="isQuizAlreadyDone" class="text-warning">
              Você já fez este quiz
            </small>
          </h5>
          <div class="mt-2">
            <router-link v-if="isQuizAlreadyDone" :to="`/answer/${friendQuiz.userId}/${friendQuiz.quizId}`" class="btn btn-warning">
              Ver minhas respostas
            </router-link>
            <router-link v-else :to="`/answer/${friendQuiz.userId}/${friendQuiz.quizId}`" class="btn btn-success">
              Responder quiz
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'FriendQuizCard',

  props: {
    friendQuiz: Object
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),
      isLoading: {
        quiz: false
      },
      userId: null,
      quiz: null,
      quizImgUrl: '',
      isQuizAlreadyDone: false,
      isLoggedIn: false
    }
  },

  created () {
    this.userId = localStorage.getItem('uid')
    this.fetchImage()
    this.checkQuizAlreadyDone()
    console.log(this.friendQuiz)
  },

  methods: {
    async fetchImage () {
      this.isLoading.quiz = true

      this.quiz = (await this.db
        .collection('quizzes')
        .doc(this.friendQuiz.quizId)
        .get()).data()
      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()

      this.isLoading.quiz = false
    },

    async checkQuizAlreadyDone () {
      if (!this.userId) {
        return
      }

      const attempt = await this.db.collection('activeQuizzes')
        .doc(this.friendQuiz.userId)
        .collection('userQuizzes')
        .doc(this.friendQuiz.quizId)
        .collection('attempts')
        .doc(this.userId)
        .get()

      this.isQuizAlreadyDone = attempt.exists
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user
        this.$forceUpdate()
      })
    }
  }
}
</script>

<style scoped>
.card {
  height: 7em;
}

.card-img {
  opacity: 0.3;
  height: inherit;
  object-fit: cover;
}
</style>
