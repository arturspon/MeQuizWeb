<template>
  <div>
    <Navbar :active-link="'profile'" />

    <div class="container mt-3">

      <div v-if="isLoading.quizzes || isLoading.loginCheck" class="text-center">
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Carregando...</span>
        </div>
      </div>

      <template v-else>
        <div class="form-group mt-3">
          <input
            v-model="searchQuery"
            @input="filterQuizzes"
            type="text"
            class="form-control"
            placeholder="Procure por algum quiz aqui..."
          >
        </div>

        <div v-if="areAllQuizzesHidden()" class="alert alert-warning">
          Nenhum quiz encontrado para este filtro.
          <br>
          Tente refinar sua pesquisa.
        </div>
      </template>

      <div v-if="!isLoading.quizzes" class="row row-cols-1 row-cols-md-2">
        <ProfileQuizCard
          v-show="!quiz.isHidden"
          v-for="quiz in quizzes"
          :key="quiz.id"
          :quiz="quiz"
        />
      </div>

    </div>

  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import Navbar from '@/components/Navbar'
import ProfileQuizCard from '@/components/ProfileQuizCard'

export default {
  name: 'Profile',

  components: {
    Navbar,
    ProfileQuizCard
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      isLoading: {
        quizzes: false,
        loginCheck: false
      },

      quizzes: [],

      searchQuery: ''
    }
  },

  created () {
    this.authObserver()
    // this.getQuizzes()
  },

  methods: {
    async getQuizzes () {
      this.isLoading.quizzes = true

      const quizDocs = await this.db.collection('activeQuizzes')
        .doc(this.$store.state.user.uid)
        .collection('userQuizzes')
        .get()

      const promises = quizDocs.docs.map(async (quiz) => {
        const quizData = (await this.db.collection('quizzes').doc(quiz.id).get()).data()
        return {
          id: quiz.id,
          ...quizData
        }
      })

      Promise.all(promises)
        .then(result => {
          this.quizzes = result
          this.isLoading.quizzes = false
        })
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user

        if (user) {
          // const uid = user.uid
          this.$store.commit('setUser', user)
          this.getQuizzes()
        }

        this.isLoading.loginCheck = false
      })
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

<style scoped>
.question {
  border: 4px solid var(--colorPrimary);
  width: 75%;
}
</style>
