<template>
  <div class="container col mb-4">
    <div class="card bg-dark text-white h-100">

      <img v-if="quizImgUrl" :src="quizImgUrl" class="card-img">
      <img v-else src="@/assets/images/black_wood.png" class="card-img">

      <div class="card-img-overlay">

        <div class="d-flex align-items-center justify-content-center h-100">
          <div class="w-100 h-100">

            <div class="text-left d-flex justify-content-between">
              <div>
                <h5 class="card-title mb-0">
                  {{ quiz.name }}
                </h5>
                <small class="card-text">
                  {{ attempts.length }} respostas
                </small>
              </div>
              <div>
                <a class="btn btn-info btn-sm mt-2" :href="getWhatsAppLink()" target="_blank">
                  Compartilhar
                </a>
              </div>
            </div>

            <div v-if="attempts.length > 0" class="attempts mt-3 w-100">
              <div v-for="attempt in attempts" :key="attempt.userId" class="card mb-2">
                <div class="card-body">

                  <div class="attempt d-flex  justify-content-center justify-content-between">

                    <div class="attempt__info text-left w-100">
                      <b>{{ attempt.user.displayName }}</b>
                      <p class="mb-1">
                        <small>
                          Acertou {{ attempt.rightAnswers }} de {{ attempt.numberOfQuestions }}
                        </small>
                      </p>

                      <div class="progress">
                        <div
                          class="progress-bar progress-bar-striped bg-success"
                          role="progressbar"
                          :style="`width: ${getAttemptPercentage(attempt)}%`"
                          :aria-valuenow="getAttemptPercentage(attempt)"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {{ getAttemptPercentage(attempt) }}%
                        </div>
                      </div>

                      <button
                        class="btn btn-outline-warning btn-sm mt-2"
                        data-toggle="modal"
                        :data-target="`#view-answer-modal-${attempt.tempId}`"
                      >
                        Ver respostas
                      </button>
                    </div>

                    <div v-if="attempt.user.photoUrl" class="text-right">
                      <img :src="attempt.user.photoUrl" class="rounded-circle w-75">
                    </div>

                    <ViewAnswersModal :quiz="quiz" :attempt="attempt" />

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

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
import ViewAnswersModal from '@/components/ViewAnswersModal'

export default {
  name: 'ProfileQuizCard',

  props: {
    quiz: Object
  },

  components: {
    ViewAnswersModal
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),
      quizImgUrl: null,
      userId: null,
      attempts: []
    }
  },

  created () {
    this.userId = this.$store.state.user.uid
    this.fetchImage()
    this.fetchAttempts()
  },

  methods: {
    async fetchImage () {
      this.quizImgUrl = await this.storageRef
        .root
        .child(`quizzes_banners/${this.quiz.imgName}`)
        .getDownloadURL()
    },

    async fetchAttempts () {
      const rawAttempts = await this.db.collection('activeQuizzes')
        .doc(this.userId)
        .collection('userQuizzes')
        .doc(this.quiz.id)
        .collection('attempts')
        .get()

      const promises = rawAttempts.docs.map(async attempt => {
        const attemptData = attempt.data()
        const user = (await this.db.collection('users').doc(attemptData.userId).get()).data()
        return {
          tempId: Math.random().toString(36).substr(2, 50),
          ...attemptData,
          user: { ...user }
        }
      })

      Promise.all(promises).then(result => {
        this.attempts = result
      })
    },

    getAttemptPercentage (attempt) {
      return Math.ceil((attempt.rightAnswers * 100) / attempt.numberOfQuestions)
    },

    getWhatsAppLink () {
      const url = `https://mequiz.app/answer/${this.$store.state.user.uid}/${this.quiz.id}`
      let message = `Eu fiz o quiz "${this.quiz.name}"\nVocê consegue adivinhar minhas respostas?\n${url}`
      message = encodeURIComponent(message)
      return `https://api.whatsapp.com/send?text=${message}`
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

.attempts {
  max-height: calc(100% - 100px);
  overflow-y: auto;
}

.attempts > .card {
  background-color: rgba(22, 160, 133, 0.75);
}

.container {
  height: 25em;
}
</style>
