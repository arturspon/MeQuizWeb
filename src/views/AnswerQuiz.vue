template<template>
  <div>
    <div class="loading" v-if="isLoading.quiz || isLoading.getQuizOwnerUser">
      <div>
        <div class="spinner-border text-white" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
        <p><b>Caregando Quiz...</b></p>
      </div>
    </div>

    <template>

      <template v-if="!isQuizStarted">
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

            <template v-if="!isLoggedIn">
              <div class="form-group mt-4">
                <label>
                  <b>Digite nome ou apelido</b>
                </label>
                <input v-model="displayName" class="form-control" type="text" maxlength="20">
              </div>
            </template>

            <button
              class="btn btn-primary"
              type="button"
              @click="beginQuiz"
              :disabled="isLoading.accountCreation"
            >
              <template v-if="isLoading.accountCreation">
                <button class="btn btn-primary" type="button" disabled>
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span class="sr-only">Carregando...</span>
                </button>
              </template>
              <template v-else>
                Começar a responder
              </template>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <AlternativesManager v-show="isQuizStarted" :quiz="quiz" :correct-quiz-answers="correctQuizAnswers" />
      </template>

    </template>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import AlternativesManager from '@/components/AlternativesManager'

export default {
  name: 'AnswerQuiz',

  components: {
    AlternativesManager
  },

  data () {
    return {
      isLoading: {
        quiz: true,
        quizOwnerUser: true,
        loginCheck: true,
        accountCreation: false
      },

      isLoggedIn: false,
      isNewUser: false,

      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      quizId: null,
      quiz: null,
      quizImgUrl: null,
      correctQuizAnswers: null,

      quizOwnerUserId: null,
      quizOwnerUser: null,

      displayName: '',

      isQuizStarted: false
    }
  },

  mounted () {
    this.quizId = this.$route.params.quizId
    this.quizOwnerUserId = this.$route.params.userId
    this.authObserver()
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

      this.correctQuizAnswers = (await this.db.collection('activeQuizzes')
        .doc(this.quizOwnerUserId)
        .collection('userQuizzes')
        .doc(this.quizId)
        .get())
        .data()
        .correctAnswers
      this.$store.commit('setQuizCorrectAnswers', this.correctQuizAnswers)

      this.isLoading.quiz = false
    },

    async getQuizOwnerUser () {
      this.quizOwnerUser = await this.db.collection('users').doc(this.quizOwnerUserId).get()
      this.quizOwnerUser = this.quizOwnerUser.data()
      this.$store.commit('setQuizOwnerUser', this.quizOwnerUser)
      this.isLoading.quizOwnerUser = false
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user

        if (user) {
          const uid = user.uid
          this.$store.commit('setUser', user)
          console.log(uid)

          if (this.isNewUser) {
            this.isNewUser = false
            await this.db.collection('users')
              .doc(uid)
              .set({
                userId: uid,
                anonymous: true,
                displayName: this.displayName.trim(),
                email: null,
                friends: [this.quizOwnerUserId],
                photoUrl: null
              })
            this.showQuestions()
          } else {
            await this.db.collection('users')
              .doc(uid)
              .update({
                friends: firebase.firestore.FieldValue.arrayUnion(this.quizOwnerUserId)
              })
              .catch(() => {
                firebase.auth().signOut().then(() => {
                  console.log('Sign-out successful')
                }).catch(() => {
                  console.error('Sign-out error')
                })
              })
          }
        }

        this.isLoading.loginCheck = false
      })
    },

    signInAnonymously () {
      this.isLoading.accountCreation = true
      console.log('Logging in...')
      firebase.auth().signInAnonymously()
        .then(() => {
          this.isNewUser = true
          console.log('User signed in')
          this.isLoading.accountCreation = false
        })
        .catch((error) => {
          console.log(error)
          this.isLoading.accountCreation = false
          // var errorCode = error.code
          // var errorMessage = error.message
          // ...
        })
    },

    beginQuiz () {
      if (this.isLoggedIn) {
        this.createQuizAttempt()
      } else {
        this.signInAnonymously()
      }
    },

    async createQuizAttempt () {
      const quizAttemptRef = this.db.collection('activeQuizzes')
        .doc(this.quizOwnerUserId)
        .collection('userQuizzes')
        .doc(this.quizId)
        .collection('attempts')
        .doc(this.$store.state.user.uid)

      this.$store.commit('setQuizAttemptRef', quizAttemptRef)

      await quizAttemptRef.set({
        answers: [],
        numberOfQuestions: this.quiz.questions.length,
        quizId: this.quizId,
        rightAnswers: 0,
        userId: this.$store.state.user.uid
      }, { merge: true })

      this.showQuestions()
    },

    showQuestions () {
      this.isQuizStarted = true

      this.$nextTick(() => {
        setTimeout(() => {
          this.$bus.$emit('startAnsweringQuiz')
        }, 50)
      })
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