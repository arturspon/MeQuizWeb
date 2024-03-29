<template>
  <div>
    <Navbar :active-link="'home'" />

    <div class="container mt-3">

      <div v-if="isLoading.quiz || isLoading.quizCreation" class="text-center">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>

      <div v-if="!isLoading.quiz && !isLoading.activeQuizCheck">

        <template v-if="!isQuizAlreadyAnswered && this.answers.length < this.quiz.questions.length">

          <div class="d-flex justify-content-center">
            <div class="question bg-white rounded text-dark text-center py-5 pl-1 pr-1 w-100">
                <small class="text-muted">
                  Questão {{ questionIndex + 1 }} de {{ quiz.questions.length }}
                </small>
                <div v-html="getQuestionText()"></div>

                <div v-if="questionIndex > 0" class="mt-3">
                  <button class="btn btn-sm btn-outline-info" @click="questionIndex--">
                    <i class="fas fa-chevron-left"></i>
                    Questão anterior
                  </button>
                </div>
            </div>
          </div>

          <div class="alternatives mt-1 w-100">
            <div class="w-100">
              <div v-for="(alternative, index) in getAlternatives()" :key="alternative.tempId">
                <OwnQuizAlternative :index="index" :text="alternative.text" :isOwnQuiz="true" />
              </div>
            </div>
          </div>

        </template>

        <div v-if="isQuizAlreadyAnswered">
          <div class="alert alert-info py-5" role="alert">
            <p>Você já fez esse quiz 😎</p>

            <div>
              <router-link to="/profile" class="btn btn-info mr-1">
                Ver meus quizzes feitos
              </router-link>
              <button
                class="btn btn-success"
                @click="shareQuiz()"
                :disabled="isLoading.shortLinkCreation"
              >
                <i class="fab fa-whatsapp"></i>
                {{ isLoading.shortLinkCreation ? 'Aguarde...' : 'Compartilhar' }}
              </button>
            </div>

            <router-link to="/" class="btn btn-outline-dark mt-2">
              Voltar
            </router-link>
          </div>
        </div>

        <!-- <div v-if="this.answers.length === this.quiz.questions.length">
          <div v-for="(question, index) in quiz.questions" :key="index" class="bg-info rounded py-3 mb-2">
            <b>{{ index + 1 }}) <span v-html="getQuestionText(index)"></span></b>
            <br>
            <b>Sua resposta:</b> {{ quiz.answers[getStartOfAnswersIndexByQuestion(index) + answers[index]] }}
          </div>
        </div> -->

      </div>

    </div>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import Navbar from '@/components/Navbar'
import OwnQuizAlternative from '@/components/OwnQuizAlternative'

export default {
  name: 'DoQuiz',

  components: {
    Navbar,
    OwnQuizAlternative
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      isLoading: {
        quiz: true,
        quizCreation: false,
        activeQuizCheck: true,
        shortLinkCreation: false
      },

      userId: null,
      quizId: null,
      quiz: null,
      isQuizAlreadyAnswered: false,

      questionIndex: 0,
      answers: []
    }
  },

  created () {
    this.userId = localStorage.getItem('uid')
    this.quizId = this.$route.params.quizId
    this.getQuiz()
    this.checkQuizAlreadyAnswered()

    this.$bus.$on(
      'alternativeSelected',
      alternativeIndex => {
        this.$bus.$emit('toggleInteraction', false)
        setTimeout(() => {
          this.$bus.$emit('toggleInteraction', true)
          this.answers[this.questionIndex] = alternativeIndex

          if (this.quiz.questions[this.questionIndex + 1]) {
            this.questionIndex++
          }

          this.$forceUpdate()

          const isFinished = this.answers.length === this.quiz.questions.length
          if (isFinished) {
            this.saveQuiz()
          }
        }, 1500)
      }
    )
  },

  methods: {
    async getQuiz () {
      this.quiz = await this.db.collection('quizzes').doc(this.quizId).get()
      this.quiz = this.quiz.data()
      this.isLoading.quiz = false
    },

    async checkQuizAlreadyAnswered () {
      const activeQuiz = await this.db.collection('activeQuizzes')
        .doc(this.userId)
        .collection('userQuizzes')
        .doc(this.quizId)
        .get()

      this.isQuizAlreadyAnswered = activeQuiz.exists
      this.isLoading.activeQuizCheck = false
    },

    getQuestionText (index) {
      const replaceText = index !== undefined ? 'Você' : '<b>Você</b>'
      index = index !== undefined ? index : this.questionIndex

      let question = this.quiz.questions[index]
      while (question.indexOf('%1$s') !== -1) {
        question = question.replace('%1$s', replaceText)
      }

      return question
    },

    getStartOfAnswersIndexByQuestion (questionIndex) {
      let startIndex = 0

      for (let i = 0; i < questionIndex; i++) {
        startIndex += this.quiz.answers_count[i]
      }

      return startIndex
    },

    getAlternatives () {
      const alternatives = []
      const answerCount = this.quiz.answers_count[this.questionIndex]

      let alternativeOffset = 0
      for (let i = 0; i < this.questionIndex; i++) {
        const answerCountForThatQuestion = this.quiz.answers_count[i]
        alternativeOffset += answerCountForThatQuestion
      }

      let aux = 0
      for (let index = this.questionIndex; index < (answerCount + this.questionIndex); index++) {
        const alternative = this.quiz.answers[aux + alternativeOffset]

        // Vue render :key
        const alternativeTempId = `${this.questionIndex.toString()}_${index}`

        alternatives.push({
          tempId: alternativeTempId,
          text: alternative
        })

        aux++
      }

      return alternatives
    },

    async saveQuiz () {
      this.isLoading.quizCreation = true

      await this.db.collection('activeQuizzes')
        .doc(this.userId)
        .collection('userQuizzes')
        .doc(this.quizId)
        .set({
          userId: this.userId,
          quizId: this.quizId,
          name: this.quiz.name,
          date: firebase.firestore.FieldValue.serverTimestamp(),
          correctAnswers: this.answers
        })

      this.isLoading.quizCreation = false
      this.isQuizAlreadyAnswered = true
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
.question {
  border: 4px solid var(--colorPrimary);
  width: 75%;
}
</style>
