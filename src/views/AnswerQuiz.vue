template<template>
  <div class="custom-container h-100">
    <Navbar v-show="false" :active-link="'home'" />

    <transition name="fade">
      <div class="loading" v-if="isLoading.quiz || isLoading.getQuizOwnerUser">
        <div>
          <div class="spinner-border text-white" style="width: 3rem; height: 3rem;" role="status">
            <span class="sr-only">Carregando...</span>
          </div>
          <p><b>Caregando Quiz...</b></p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="errors.length > 0" class="errors">
        <div class="alert alert-danger" role="alert">
          <span v-for="error in errors" :key="error">
            {{ error }}
            <br>
          </span>
        </div>
      </div>
    </transition>

    <div v-if="isUserOwnQuiz()" class="errors">
      <div class="alert alert-warning" role="alert">
        <p>
          Oops, este quiz é seu!
          Somente seus amigos podem responder seu quiz 🙈
        </p>
        <router-link to="/profile" class="btn btn-success">
          Voltar
        </router-link>
      </div>
    </div>

    <div v-if="existingAttempt" class="errors">
      <div class="alert alert-info" role="alert">
        <div v-if="quiz && quizOwnerUser" class="mb-4">
          <h3>{{ quiz.name }}</h3>
          <h5>de {{ quizOwnerUser.displayName }}</h5>
        </div>

        <div class="mb-4">
          <p>
            Você já respondeu este quiz 😎
            <br>
            Deseja ver suas respostas?
          </p>
        </div>

        <router-link to="/friends" class="btn btn-info mr-1">
          Voltar
        </router-link>
        <button
          class="btn btn-warning"
          data-toggle="modal"
          :data-target="`#view-answers-to-friend-quiz-modal-${existingAttempt.tempId}`"
        >
          Ver minhas respostas
        </button>
      </div>
    </div>

    <!-- <transition name="fade"> -->
      <template v-if="!existingAttempt && !isUserOwnQuiz() && errors.length == 0 && !isLoading.quiz && !isLoading.getQuizOwnerUser">

        <template v-if="!isQuizStarted">
          <div class="banner">
            <img :src="quizImgUrl" alt="Imagem do Quiz" class="w-100 h-100" loading="lazy">
            <div class="banner__fade">
              <div class="banner__title pl-2">
                <h3>
                  <b>{{ quiz ? quiz.name : 'Responder Quiz' }}</b>
                </h3>
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
                <div v-if="!anonymousSignIn" class="form-group mt-4">
                  <button class="btn btn-success" @click="showSignInPopup()">
                    Fazer login e iniciar quiz
                  </button>
                  <div class="mt-5">
                    <u class="text-info clickable" @click="anonymousSignIn = true">
                      <small>Não quero me identificar</small>
                    </u>
                  </div>
                </div>

                <div v-else class="form-group mt-4">
                  <label>
                    <b>Digite nome ou apelido</b>
                  </label>
                  <div class="d-flex justify-content-center">
                    <input
                      v-model="displayName"
                      class="form-control w-50"
                      type="text"
                      maxlength="20">
                  </div>
                  <div class="mt-3">
                    <button
                      class="btn btn-info"
                      @click="showSignInPopup()"
                      :disabled="isLoading.accountCreation"
                    >
                      Fazer login com Google
                    </button>
                    <button
                      class="btn btn-success ml-2"
                      @click="beginQuiz"
                      :disabled="isLoading.accountCreation"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </template>

              <button
                v-if="isLoggedIn"
                class="btn btn-primary btn-lg"
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
          <AlternativesManager
            v-show="isQuizStarted"
            :quizId="quizId"
            :quiz="quiz"
            :correct-quiz-answers="correctQuizAnswers"
          />
        </template>

      </template>
    <!-- </transition> -->

    <template v-if="existingAttempt">
      <ViewAnswersToFriendQuizModal
        :friendId="quizOwnerUserId"
        :friend="quizOwnerUser"
        :quizId="quizId"
        :quiz="quiz"
        :attempt="existingAttempt"
      />
    </template>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import AlternativesManager from '@/components/AlternativesManager'
import Navbar from '@/components/Navbar'
import ViewAnswersToFriendQuizModal from '@/components/ViewAnswersToFriendQuizModal'

export default {
  name: 'AnswerQuiz',

  components: {
    AlternativesManager,
    Navbar,
    ViewAnswersToFriendQuizModal
  },

  data () {
    return {
      isLoading: {
        quiz: true,
        quizOwnerUser: true,
        loginCheck: true,
        accountCreation: false
      },

      errors: [],

      isLoggedIn: false,
      anonymousSignIn: false,
      isNewUser: false,
      currentUser: null,

      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      existingAttempt: null,
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
    this.startFlow()
  },

  methods: {
    async startFlow () {
      this.authObserver()
      await this.getQuiz()
      await this.getQuizOwnerUser()
      this.checkQuizAlreadyDone()
    },

    async getQuiz () {
      this.quiz = await this.db.collection('quizzes')
        .doc(this.quizId)
        .get()

      if (!this.quiz.exists) {
        this.setInvalidLinkError()
        this.isLoading.quiz = false
        return
      }

      this.quiz = this.quiz.data()

      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()

      this.correctQuizAnswers = await this.db.collection('activeQuizzes')
        .doc(this.quizOwnerUserId)
        .collection('userQuizzes')
        .doc(this.quizId)
        .get()

      if (!this.correctQuizAnswers.exists) {
        this.setInvalidLinkError()
        this.isLoading.quiz = false
        return
      }

      this.correctQuizAnswers = this.correctQuizAnswers.data().correctAnswers
      this.$store.commit('setQuizCorrectAnswers', this.correctQuizAnswers)

      this.isLoading.quiz = false
    },

    async getQuizOwnerUser () {
      this.quizOwnerUser = await this.db.collection('users').doc(this.quizOwnerUserId).get()

      if (!this.quizOwnerUser.exists) {
        this.setInvalidLinkError()
        this.isLoading.quizOwnerUser = false
        return
      }

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
          this.currentUser = user

          if (this.isNewUser) {
            this.isNewUser = false
            await this.db.collection('users')
              .doc(uid)
              .set({
                userId: uid,
                anonymous: true,
                displayName: this.displayName.trim(),
                email: null,
                friends: this.isUserOwnQuiz() ? [] : [this.quizOwnerUserId],
                photoUrl: null
              })
            this.beginQuiz()
          } else {
            if (!this.isUserOwnQuiz()) {
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
        }

        this.isLoading.loginCheck = false
      })
    },

    signInAnonymously () {
      this.isLoading.accountCreation = true
      firebase.auth().signInAnonymously()
        .then(() => {
          this.isNewUser = true
          this.isLoading.accountCreation = false
          this.$store.commit('setUserName', this.displayName)
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

      const existingAttempt = await quizAttemptRef.get()
      if (!existingAttempt.exists) {
        await quizAttemptRef.set({
          answers: [],
          numberOfQuestions: this.quiz.questions.length,
          quizId: this.quizId,
          rightAnswers: 0,
          userId: this.$store.state.user.uid
        }, { merge: true })
      }

      this.showQuestions()
    },

    showQuestions () {
      this.isQuizStarted = true

      this.$nextTick(() => {
        setTimeout(() => {
          this.$bus.$emit('startAnsweringQuiz')
        }, 50)
      })
    },

    setInvalidLinkError () {
      this.errors = [
        'Desculpe, este link é inválido.',
        'Peça para seu amigo lhe enviar o link novamente via WhatsApp.'
      ]
    },

    showSignInPopup () {
      this.$bus.$emit('signIn', `${location.pathname}`)
    },

    isUserOwnQuiz () {
      return this.currentUser && this.currentUser.uid === this.quizOwnerUserId
    },

    async checkQuizAlreadyDone () {
      if (!this.currentUser || !this.currentUser.uid) {
        return
      }

      const attempt = await this.db.collection('activeQuizzes')
        .doc(this.quizOwnerUserId)
        .collection('userQuizzes')
        .doc(this.quizId)
        .collection('attempts')
        .doc(this.currentUser.uid)
        .get()

      if (attempt.exists) {
        const attemptData = attempt.data()
        const isDone = attemptData.answers.length >= attemptData.numberOfQuestions
        const tempId = Math.random().toString(36).substr(2, 50)
        this.existingAttempt = isDone ? { tempId, ...attemptData } : null
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@media only screen and (min-width: 992px) {
  .custom-container {
    max-width: 960px;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }
}

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

.errors {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.clickable {
  cursor: pointer;
}
</style>
