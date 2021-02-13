<template>
  <div>
    <nav class="navbar navbar-dark navbar-expand-lg text-white">
      <div class="container">
        <a class="navbar-brand" href="#">
          <img src="@/assets/images/mequiz_logo.png" width="30" height="30" class="d-inline-block align-top" alt="">
          MeQuiz
        </a>

        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">

            <router-link to="/" class="nav-item" :class="{'active': activeLink == HOME_LINK}">
              <a class="nav-link" href="#">Quizzes</a>
            </router-link>

            <template v-if="isLoggedIn">

              <!-- <li class="nav-item" :class="{'active': activeLink == FRIENDS_LINK}">
                <a class="nav-link" href="#">Amigos</a>
              </li> -->

              <router-link to="/profile" class="nav-item" :class="{'active': activeLink == PROFILE_LINK}">
                <a class="nav-link" href="#">Meu perfil</a>
              </router-link>

            </template>

          </ul>

          <form class="form-inline">
            <a class="btn btn-outline-warning my-2 my-sm-0 mr-2" href="https://mequiz.page.link/baixar-app" target="_blank">
              Baixar app na Play Store
            </a>

            <button v-if="isLoggedIn" class="btn btn-outline-light my-2 my-sm-0" type="button" @click="logout()">Sair</button>
            <button v-else class="btn btn-primary my-2 my-sm-0" type="button" @click="signInWithGoogle()">Login</button>
          </form>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'Navbar',

  props: {
    activeLink: String
  },

  data () {
    return {
      HOME_LINK: 'home',
      FRIENDS_LINK: 'friends',
      PROFILE_LINK: 'profile',

      isLoading: {
        loginCheck: true
      },

      isLoggedIn: false
    }
  },

  created () {
    this.attachListeners()
    this.authObserver()
  },

  methods: {
    attachListeners () {
      this.$bus.$on('signIn', (redirectTo) => {
        console.log(redirectTo)
        this.$store.commit('setRedirectUrl', redirectTo)
        this.signInWithGoogle()
      })
    },

    signInWithGoogle () {
      const provider = new firebase.auth.GoogleAuthProvider()

      firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = result.credential

          var token = credential.accessToken
          console.log(token)
          var user = result.user
          this.$store.commit('setUser', user)

          localStorage.setItem('uid', user.uid)
        }).catch((error) => {
          console.log(error)
          localStorage.setItem('uid', null)
          // Handle Errors here.
          // var errorCode = error.code
          // var errorMessage = error.message
          // // The email of the user's account used.
          // var email = error.email
          // // The firebase.auth.AuthCredential type that was used.
          // var credential = error.credential
          // ...
        })
    },

    authObserver () {
      firebase.auth().onAuthStateChanged(async (user) => {
        this.isLoggedIn = !!user

        if (user) {
          this.$store.commit('setUser', user)
          localStorage.setItem('uid', user.uid)
          this.isLoggedIn = true

          if (this.$store.state.redirectUrl) {
            if (location.pathname === this.$store.state.redirectUrl) {
              this.$router.go()
            } else {
              this.$router.push(this.$store.state.redirectUrl)
            }

            this.$store.commit('setRedirectUrl', null)
          }
        } else {
          this.$store.commit('setUser', null)
          localStorage.setItem('uid', null)
        }

        this.$forceUpdate()

        this.isLoading.loginCheck = false
      })
    },

    logout () {
      firebase.auth().signOut().then(() => {
        this.isLoggedIn = false
        this.$store.commit('setUser', null)
        localStorage.setItem('uid', null)

        setTimeout(() => {
          location.reload()
        }, 50)
      }).catch(() => {
        console.error('Sign-out error')
      })
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: var(--colorPrimary) !important;
}
</style>
