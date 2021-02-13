import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    quizOwnerUser: null,
    quizAttemptRef: null,
    correctQuizAnswers: null,
    redirectUrl: null
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
    },
    setRedirectUrl (state, url) {
      state.redirectUrl = url
    }
  },
  actions: {
    getLongLink (context, data) {
      return new Promise((resolve, reject) => {
        const link = `https://mequiz.app/answer/${data.userId}/${data.quizId}`
        resolve(link)
        // resolve(`https://mequiz.page.link/?link=${link}&apn=net.ddns.artspon.mequiz`)
      })
    },
    getShortLink (context, url) {
      return new Promise((resolve, reject) => {
        fetch(
          'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyDgFfSSDYLCYMDAUvzLq_5WxaKbaAjy2I8',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              dynamicLinkInfo: {
                domainUriPrefix: 'https://mequiz.app/invite',
                link: url,
                androidInfo: {
                  androidPackageName: 'net.ddns.artspon.mequiz'
                }
              },
              suffix: {
                option: 'SHORT'
              }
            })
          }
        ).then(response => response.json())
          .then(response => resolve(response))
      })
    }
  },
  modules: {
  }
})
