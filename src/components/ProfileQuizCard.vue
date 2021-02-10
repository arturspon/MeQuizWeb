<template>
  <div class="col mb-4">
    <div class="card bg-dark text-white h-100">
      <img :src="quizImgUrl" class="card-img">
      <div class="card-img-overlay">
        <h5 class="card-title">{{ quiz.name }}</h5>
        <p class="card-text">{{ quiz.description }}</p>
        <router-link :to="{ name: 'DoQuiz', params: { quizId: quiz.id }}" class="btn btn-outline-success w-100">
          Ver respostas
        </router-link>
      </div>
    </div>
  </div>

  <!-- <div class="card bg-dark col-md-4">
    <img :src="quizImgUrl" class="card-img-top">
    <div class="card-body">
      <h5 class="card-title">{{ quiz.name }}</h5>
      <p class="card-text">{{ quiz.description }}</p>
      <router-link :to="{ name: 'DoQuiz', params: { quizId: quiz.id }}" class="btn btn-outline-success w-100">
        Ver respostas
      </router-link>
    </div>
  </div> -->
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'ProfileQuizCard',

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
.card-img {
  opacity: 0.3;
  height: 100%;
  object-fit: cover;
}
</style>
