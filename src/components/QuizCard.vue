<template>
  <div class="card bg-dark">
    <img :src="quizImgUrl" class="card-img-top" loading="lazy">
    <div class="card-body">
      <h5 class="card-title mb-0">{{ quiz.name }}</h5>
      <!-- <p class="card-text">{{ quiz.description }}</p> -->

      <div>
        <small v-if="isQuizAlreadyDone" class="text-warning">
          Você já fez este quiz
        </small>
      </div>

      <div class="mt-2">
        <button
          v-if="isQuizAlreadyDone"
          class="btn btn-success w-100"
          @click="shareQuiz()"
          :disabled="isLoading.shortLinkCreation"
        >
          <i class="fab fa-whatsapp"></i>
          {{ isLoading.shortLinkCreation ? 'Aguarde...' : 'Compartilhar' }}
        </button>

        <template v-else>
          <router-link v-if="isLoggedIn" :to="{ name: 'DoQuiz', params: { quizId: quiz.id }}" class="btn btn-info w-100">
            Fazer quiz
          </router-link>
          <button v-else class="btn btn-info w-100" @click="showLoginDialog()">
            Fazer quiz
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'QuizCard',

  props: {
    quiz: Object
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),
      isLoading: {
        shortLinkCreation: false
      },
      userId: null,
      quizImgUrl: '',
      isQuizAlreadyDone: false,
      isLoggedIn: false
    }
  },

  created () {
    this.userId = localStorage.getItem('uid')
    this.isLoggedIn = !!this.$store.state.user
    this.authObserver()
    this.fetchImage()
    this.checkQuizAlreadyDone()
  },

  methods: {
    async fetchImage () {
      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()
    },

    async checkQuizAlreadyDone () {
      if (!this.userId) {
        return
      }

      const activeQuiz = await this.db.collection('activeQuizzes')
        .doc(this.userId)
        .collection('userQuizzes')
        .doc(this.quiz.id)
        .get()

      this.isQuizAlreadyDone = activeQuiz.exists
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user
        this.$forceUpdate()
      })
    },

    showLoginDialog () {
      this.$bus.$emit('signIn', `/do-quiz/${this.quiz.id}`)
    },

    getWhatsAppLink (shortLink) {
      let message = `Eu fiz o quiz "${this.quiz.name}"\nVocê consegue adivinhar minhas respostas?\n${shortLink}`
      message = encodeURIComponent(message)
      return `https://api.whatsapp.com/send?text=${message}`
    },

    async shareQuiz () {
      this.isLoading.shortLinkCreation = true

      const longLink = await this.$store.dispatch('getLongLink', {
        userId: this.userId,
        quizId: this.quiz.id
      })
      const shortLink = await this.$store.dispatch('getShortLink', longLink)
      const wppLink = this.getWhatsAppLink(shortLink.shortLink)
      window.open(wppLink, '_blank')

      this.isLoading.shortLinkCreation = false
    }
  }
}
</script>

<style scoped>
</style>
