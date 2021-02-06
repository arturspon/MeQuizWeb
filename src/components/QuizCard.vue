<template>
  <div class="card bg-dark">
    <img :src="quizImgUrl" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">{{ quiz.name }}</h5>
      <p class="card-text">{{ quiz.description }}</p>
      <a href="#" class="btn btn-primary">Fazer quiz</a>
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
      storageRef: firebase.storage().ref(),
      quizImgUrl: ''
    }
  },

  created () {
    this.fetchImage()
  },

  methods: {
    async fetchImage () {
      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()
    }
  }
}
</script>

<style scoped>
</style>
