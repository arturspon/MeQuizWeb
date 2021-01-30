<template>
  <div>
    <div class="actionBar py-3 pl-2 pr-2">
      <b>{{ quiz.name }}</b>
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

      <div class="question bg-white rounded text-dark py-5 pl-1 pr-1" v-html="getQuestionText()">
      </div>

      <div class="alternatives mt-5">
        <div class="w-100">
          <div v-for="(alternative, index) in getAlternatives()" :key="alternative.tempId">
            <Alternative :index="index" :text="alternative.text" :isCorrect="alternative.isCorrect" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Alternative from '@/components/Alternative'
import Swal from 'sweetalert2'

export default {
  name: 'AlternativesManager',

  components: {
    Alternative
  },

  props: {
    quiz: Object,
    correctQuizAnswers: Array
  },

  data () {
    return {
      currentQuestionIndex: 0,
      quizOwnerName: '',
      alternativeOffset: 0,
      alternativeTimeoutCaseValue: -99,

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
        console.log('starting')
        this.startQuestionTimer()
      })
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
          parseInt(this.correctQuizAnswers[this.currentQuestionIndex]) === parseInt(index)

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
      this.questionSecondsElapsed = 0
      this.currentQuestionIndex++
      this.$bus.$emit('toggleInteraction', true)
      this.startQuestionTimer()
    },

    async saveQuestionAnswer (alternativeIndex) {
      this.lastAlternativeSelected = alternativeIndex
      clearInterval(this.questionInterval)

      const updatedAnswers = (await this.$store.state.quizAttemptRef.get()).data().answers
      updatedAnswers.push(alternativeIndex)

      this.$store.state.quizAttemptRef.set({
        answers: updatedAnswers
      }, { merge: true })

      setTimeout(() => {
        if (alternativeIndex !== this.alternativeTimeoutCaseValue) {
          this.prepareAndShowNextQuestion()
        }
      }, 2500)
    },

    startQuestionTimer () {
      this.questionInterval = setInterval(() => {
        this.questionSecondsElapsed++
        if (this.questionSecondsElapsed >= this.questionTimeLimit) {
          clearInterval(this.questionInterval)
          this.showQuestionTimeoutDialog()
          this.saveQuestionAnswer(this.alternativeTimeoutCaseValue)
        }
      }, 1000)
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

    getTimeRemainingPercentage () {
      const secondsRemaining = this.questionTimeLimit - this.questionSecondsElapsed
      return ((100 * secondsRemaining) / this.questionTimeLimit)
    }
  }
}
</script>

<style scoped lang="scss">

.actionBar {
  background-color: var(--colorPrimary);
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

</style>
