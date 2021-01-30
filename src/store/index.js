import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    quizOwnerUser: null,
    quizAttemptRef: null,
    correctQuizAnswers: null
  },
  mutations: {
    setUser (state, user) {
      state.user = user
    },
    setQuizOwnerUser (state, user) {
      state.quizOwnerUser = user
    },
    setQuizAttemptRef (state, ref) {
      state.quizAttemptRef = ref
    },
    setQuizCorrectAnswers (state, correctAnswers) {
      state.correctQuizAnswers = correctAnswers
    }
  },
  actions: {
  },
  modules: {
  }
})
