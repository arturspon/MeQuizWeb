<template>
  <div class="h-100">
    <transition name="fade">
      <div class="d-flex justify-content-center align-items-center h-100" v-if="isLoading.quizAttemptCheck">
        <div>
          <div class="spinner-border text-white" style="width: 3rem; height: 3rem;" role="status">
            <span class="sr-only">Carregando...</span>
          </div>
          <p><b>Só um segundo...</b></p>
        </div>
      </div>
    </transition>

    <template v-if="!isLoading.quizAttemptCheck">

      <div class="actionBar py-3 pl-3 pr-3">
        <div class="pt-1">
          <b>{{ quiz.name }}</b>
        </div>
        <div class="pt-1">
          <b :class="countdownTextClass">
            {{ this.questionTimeLimit - this.questionSecondsElapsed }}''
          </b>
        </div>
      </div>

      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          :style="`width: ${getTimeRemainingPercentage()}%`"
          :aria-valuenow="getTimeRemainingPercentage()"
          aria-valuemin="0"
          aria-valuemax="100">
        </div>
      </div>

      <div class="my-3 ml-3 mr-3">

        <div class="question bg-white rounded text-dark py-5 pl-1 pr-1">
          <small class="text-muted">
            Questão {{ currentQuestionIndex + 1 }} de {{ quiz.questions.length }}
          </small>
          <div v-html="getQuestionText()"></div>
        </div>

        <div class="alternatives mt-5">
          <div class="w-100">
            <div v-for="(alternative, index) in getAlternatives()" :key="alternative.tempId">
              <Alternative :index="index" :text="alternative.text" :isCorrect="alternative.isCorrect" />
            </div>
          </div>
        </div>
      </div>

    </template>

    <audio ref="clockSound" src="@/assets/sounds/bip.wav"></audio>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import Alternative from '@/components/Alternative'
import Swal from 'sweetalert2'

export default {
  name: 'AlternativesManager',

  components: {
    Alternative
  },

  props: {
    quizId: String,
    quiz: Object,
    correctQuizAnswers: Array
  },

  data () {
    return {
      db: firebase.firestore(),

      isLoading: {
        quizAttemptCheck: false
      },

      countdownTextClass: '',

      currentQuestionIndex: 0,
      quizOwnerName: '',
      alternativeTimeoutCaseValue: -99,
      correctAnswersCount: 0,

      questionTimeLimit: 20,
      questionInterval: null,
      questionSecondsElapsed: 0
    }
  },

  created () {
    this.quizOwnerName = this.$store.state.quizOwnerUser.displayName
    this.registerEventHandlers()
  },

  methods: {
    registerEventHandlers () {
      this.$bus.$on(
        'alternativeSelected',
        alternativeIndex => {
          this.$bus.$emit('toggleInteraction', false)
          this.saveQuestionAnswer(alternativeIndex)
        }
      )
      this.$bus.$on('startAnsweringQuiz', () => {
        this.checkForExistingAttempt()
      })
    },

    async checkForExistingAttempt () {
      this.isLoading.quizAttemptCheck = true

      const attempt = await this.$store.state.quizAttemptRef.get()
      if (attempt.exists) {
        const data = attempt.data()

        this.currentQuestionIndex = data.answers.length - 1
        this.correctAnswersCount = data.rightAnswers

        clearInterval(this.questionInterval)
        this.prepareAndShowNextQuestion()
      } else {
        this.startQuestionTimer()
      }

      this.isLoading.quizAttemptCheck = false
    },

    getQuestionText () {
      const question = this.quiz.questions[this.currentQuestionIndex]
      return question.replace('%1$s', `<b>${this.quizOwnerName}</b>`)
    },

    getAlternatives () {
      const alternatives = []
      const answerCount = this.quiz.answers_count[this.currentQuestionIndex]

      let alternativeOffset = 0
      for (let i = 0; i < this.currentQuestionIndex; i++) {
        const answerCountForThatQuestion = this.quiz.answers_count[i]
        alternativeOffset += answerCountForThatQuestion
      }

      let aux = 0
      for (let index = this.currentQuestionIndex; index < (answerCount + this.currentQuestionIndex); index++) {
        const alternative = this.quiz.answers[aux + alternativeOffset]
        const isAlternativeCorrect =
          parseInt(this.correctQuizAnswers[this.currentQuestionIndex]) === parseInt(aux)

        // Vue render :key
        const alternativeTempId = `${this.currentQuestionIndex.toString()}_${index}`

        alternatives.push({
          tempId: alternativeTempId,
          text: alternative,
          isCorrect: isAlternativeCorrect
        })

        aux++
      }

      return alternatives
    },

    prepareAndShowNextQuestion () {
      this.toggleClockSound(false)
      this.countdownTextClass = ''

      const isQuizOver = this.currentQuestionIndex === this.quiz.questions.length - 1
      if (isQuizOver) {
        this.createNotification()
        this.showCompletedQuizDialog()
        return
      }

      this.questionSecondsElapsed = 0
      this.currentQuestionIndex++
      this.$bus.$emit('toggleInteraction', true)
      this.startQuestionTimer()
    },

    async saveQuestionAnswer (alternativeIndex) {
      clearInterval(this.questionInterval)

      const isAlternativeCorrect =
          parseInt(this.correctQuizAnswers[this.currentQuestionIndex]) === parseInt(alternativeIndex)
      this.correctAnswersCount += isAlternativeCorrect ? 1 : 0

      const attemp = (await this.$store.state.quizAttemptRef.get()).data()
      attemp.answers.push(alternativeIndex)

      this.$store.state.quizAttemptRef.set({
        answers: attemp.answers,
        rightAnswers: this.correctAnswersCount
      }, { merge: true })

      setTimeout(() => {
        if (alternativeIndex !== this.alternativeTimeoutCaseValue) {
          this.prepareAndShowNextQuestion()
        }
      }, 2000)
    },

    startQuestionTimer () {
      this.questionInterval = setInterval(() => {
        this.questionSecondsElapsed++

        if (this.questionSecondsElapsed >= this.questionTimeLimit) {
          this.countdownTextClass = ''
          this.toggleClockSound(false)
          clearInterval(this.questionInterval)
          this.showQuestionTimeoutDialog()
          this.saveQuestionAnswer(this.alternativeTimeoutCaseValue)
        } else if (this.questionTimeLimit - this.questionSecondsElapsed < 10) {
          this.toggleClockSound(true)
          this.countdownTextClass = this.questionTimeLimit - this.questionSecondsElapsed <= 5
            ? 'text-danger blink' : 'text-warning'
        }
      }, 1000)
    },

    toggleClockSound (play) {
      if (play) {
        this.$refs.clockSound.play()
      } else {
        this.$refs.clockSound.pause()
        this.$refs.clockSound.currentTime = 0
      }
    },

    showQuestionTimeoutDialog () {
      Swal.fire({
        title: 'Tempo esgotado',
        text: 'O tempo acabou e você não respondeu a última questão.',
        icon: 'warning',
        // showCancelButton: true,
        confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: 'Próxima pergunta',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.prepareAndShowNextQuestion()
        }
      })
    },

    showCompletedQuizDialog () {
      Swal.fire({
        title: 'Quiz finalizado',
        text: `Você acertou ${this.correctAnswersCount} de ${this.quiz.questions.length}!`,
        icon: 'success',
        // showCancelButton: true,
        confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      }).then(() => {
        setTimeout(() => {
          location.href = '/'
        }, 50)
      })
    },

    getTimeRemainingPercentage () {
      const secondsRemaining = this.questionTimeLimit - this.questionSecondsElapsed
      return ((100 * secondsRemaining) / this.questionTimeLimit)
    },

    createNotification () {
      this.db.collection('notifications').doc().set({
        originUserId: this.$store.state.user.uid,
        originUserName: this.$store.state.user.displayName || this.$store.state.userName,
        targetUserId: this.$store.state.quizOwnerUser.userId,
        targetUserName: this.quizOwnerName,
        notificationTitle: this.quiz.name,
        notificationBody: `${this.$store.state.user.displayName || this.$store.state.userName} acertou ${this.correctAnswersCount} de ${this.quiz.questions.length} questões!`,
        quizId: this.quizId,
        quizName: this.quiz.name,
        numberOfQuestions: this.quiz.questions.length,
        rightAnswers: this.correctAnswersCount,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isFromBrowser: true
      })
    }
  }
}
</script>

<style scoped lang="scss">

.actionBar {
  background-color: var(--colorPrimary);
  display: flex;
  justify-content: space-between;
}

.alternatives {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress {
  border-radius: 0;
  height: 0.5em;
}

.progress-bar {
  background-color: var(--colorAccent);
}

.question {
  border: 4px solid var(--colorPrimary);
}

.blink {
  animation: blinker 0.25s step-start infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

</style>
