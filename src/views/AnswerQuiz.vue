<template>
  <div>
    <div class="loading" v-if="isLoading.quiz || isLoading.getQuizOwnerUser">
      <div>
        <div class="spinner-border text-white" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
        <p><b>Caregando Quiz...</b></p>
      </div>
    </div>

    <template v-else>
      <div class="banner">
        <img :src="quizImgUrl" alt="Imagem do Quiz" class="w-100 h-100">
        <div class="banner__fade">
          <div class="banner__title pl-2">
            <h3>{{ quiz ? quiz.name : 'Responder Quiz' }}</h3>
          </div>
        </div>
      </div>

      <div class="login mt-2">
        <div class="my-3 ml-4 mr-4 w-100">
          <div>
            <p>
              <b>{{ quizOwnerUser ? quizOwnerUser.displayName : 'Seu amigo(a)' }}</b>
              convidou você.
              <br>
              Responda esse Quiz sobre ele.
            </p>
          </div>

          <div class="form-group mt-4">
            <label>
              <b>Digite nome ou apelido</b>
            </label>
            <input class="form-control" type="text">
          </div>
          <button class="btn btn-primary" type="button">
            Começar a responder
          </button>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'AnswerQuiz',

  data () {
    return {
      isLoading: {
        quiz: true,
        quizOwnerUser: true
      },

      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      quizId: null,
      quiz: null,
      quizImgUrl: null,

      quizOwnerUserId: null,
      quizOwnerUser: null
    }
  },

  mounted () {
    this.quizId = this.$route.params.quizId
    this.quizOwnerUserId = this.$route.params.userId
    console.log({ quizId: this.quizId, userId: this.quizOwnerUserId })

    this.getQuiz()
    this.getQuizOwnerUser()
  },

  methods: {
    async getQuiz () {
      this.quiz = await this.db.collection('quizzes')
        .doc(this.quizId)
        .get()
      this.quiz = this.quiz.data()
      console.log(this.quiz)
      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()
      this.isLoading.quiz = false
    },

    async getQuizOwnerUser () {
      this.quizOwnerUser = await this.db.collection('users').doc(this.quizOwnerUserId).get()
      this.quizOwnerUser = this.quizOwnerUser.data()
      console.log(this.quizOwnerUser)
      this.isLoading.quizOwnerUser = false
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.banner {
  position: relative;
  height: 30vh;
}
.banner img {
  object-fit: cover;
}
.banner__fade {
  background-color: rgba(0, 0, 0, 0.35);
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  position: absolute;
}
.banner__title {
  position: relative;
  display: flex;
  height: 100%;
  // justify-content: center;
  align-items: flex-end;
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
}

input {
  text-align: center;
}
</style>
