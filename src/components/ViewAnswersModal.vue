<template>
  <div class="modal fade" :id="`view-answer-modal-${attempt.tempId}`" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content bg-dark">
        <div class="modal-header">
          <h5 class="modal-title text-left" id="exampleModalLongTitle">
            <b>{{ quiz.name }}</b>
            <br>
            <small>Respostas de <u>{{ attempt.user.displayName }}</u></small>
          </h5>
          <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div
            v-for="(answer, index) in answers"
            :key="index"
            class="card mb-2"
            :class="[
              answer.numeric == alternativeTimeoutCaseValue
              ? 'bg-warning text-dark' : (answer.isCorrect ? 'bg-correct-answer' : 'bg-danger')
            ]"
          >
            <div class="card-body text-left">
              <div>
                <b>
                  {{ index + 1 }}) {{ getQuestionText(answer.question) }}
                </b>
              </div>

              <div v-if="answer.numeric != alternativeTimeoutCaseValue">
                Resposta: {{ answer.text }}
              </div>
              <div v-else>
                Resposta: O tempo acabou e seu amigo(a) não respondeu.
              </div>

              <div>
                Resposta correta: {{ answer.correctAnswerText }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'ViewAnswersModal',

  props: {
    quiz: Object,
    attempt: Object
  },

  data () {
    return {
      db: firebase.firestore(),
      correctAnswers: [],
      answers: [],
      alternativeTimeoutCaseValue: -99
    }
  },

  created () {
    this.fetchCorrectAnswers()
  },

  methods: {
    async fetchCorrectAnswers () {
      this.correctAnswers = (
        await this.db.collection('activeQuizzes')
          .doc(this.$store.state.user.uid)
          .collection('userQuizzes')
          .doc(this.quiz.id)
          .get()
      ).data().correctAnswers
      this.parseAnswers()
    },

    parseAnswers () {
      const answers = []

      this.quiz.questions.forEach((question, index) => {
        const alternatives = this.getAlternatives(index)
        answers.push({
          question: question,
          alternatives: alternatives,
          numeric: this.attempt.answers[index],
          text: alternatives[this.attempt.answers[index]],
          correctAnswerText: alternatives[this.correctAnswers[index]],
          isCorrect: this.attempt.answers[index] === this.correctAnswers[index]
        })
      })

      this.answers = answers
    },

    getAlternatives (questionIndex) {
      const alternatives = []
      const answerCount = this.quiz.answers_count[questionIndex]

      let alternativeOffset = 0
      for (let i = 0; i < questionIndex; i++) {
        const answerCountForThatQuestion = this.quiz.answers_count[i]
        alternativeOffset += answerCountForThatQuestion
      }

      let aux = 0
      for (let index = questionIndex; index < (answerCount + questionIndex); index++) {
        alternatives.push(this.quiz.answers[aux + alternativeOffset])
        aux++
      }

      return alternatives
    },

    getQuestionText (question) {
      return question.replace('%1$s', 'Você')
    }
  }
}
</script>

<style scoped>
.bg-correct-answer {
  background-color: var(--colorPrimary);
}
</style>
