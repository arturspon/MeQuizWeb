<template>
  <div>
    <Navbar :active-link="'home'" />

    <div class="container">

      <div v-if="isLoading.quizzes" class="text-center mt-4">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>

      <div v-else class="form-group mt-3">
        <input
          v-model="searchQuery"
          @input="filterQuizzes"
          type="text"
          class="form-control"
          placeholder="Procure por algum quiz aqui..."
        >
      </div>

      <div v-if="quizzes.length > 0" class="mt-4">
        <div v-if="areAllQuizzesHidden()" class="alert alert-warning">
          Nenhum quiz encontrado para este filtro.
          <br>
          Tente refinar sua pesquisa.
        </div>

        <div class="card-columns">
          <QuizCard
            v-show="!quiz.isHidden"
            v-for="quiz in quizzes"
            :key="quiz.id"
            :quiz="quiz"
          />
        </div>
      </div>

      <div v-else-if="!isLoading.quizzes">
        Não há nenhum quiz disponível
      </div>

    </div>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import Navbar from '@/components/Navbar'
import QuizCard from '@/components/QuizCard'

export default {
  name: 'Home',

  components: {
    Navbar,
    QuizCard
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      isLoading: {
        quizzes: true
      },

      quizzes: [],

      searchQuery: ''
    }
  },

  created () {
    this.fetchQuizzes()
  },

  methods: {
    async fetchQuizzes () {
      const rawQuizzes = await this.db.collection('quizzes').get()

      this.quizzes = rawQuizzes.docs.map(rawQuiz => {
        return {
          id: rawQuiz.id,
          ...rawQuiz.data()
        }
      })

      this.isLoading.quizzes = false
    },

    filterQuizzes () {
      const query = this.searchQuery.toLowerCase()

      this.quizzes.forEach(quiz => {
        const matchesQuery = quiz.name.toLowerCase().includes(query)
        quiz.isHidden = !matchesQuery
      })
    },

    areAllQuizzesHidden () {
      return this.quizzes.every(quiz => quiz.isHidden)
    }
  }
}
</script>
