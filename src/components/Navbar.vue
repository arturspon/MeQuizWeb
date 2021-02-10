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

            <li class="nav-item" :class="{'active': activeLink == HOME_LINK}">
              <a class="nav-link" href="#">Quizzes <span class="sr-only">(current)</span></a>
            </li>

            <template v-if="isLoggedIn">

              <li class="nav-item" :class="{'active': activeLink == FRIENDS_LINK}">
                <a class="nav-link" href="#">Amigos</a>
              </li>

              <router-link to="/profile" class="nav-item" :class="{'active': activeLink == PROFILE_LINK}">
                <a class="nav-link" href="#">Meu perfil</a>
              </router-link>

              <li class="nav-item">
                <a class="nav-link" href="#" @click="logout()">Sair</a>
              </li>

            </template>
            <template v-else>

              <li class="nav-item">
                <a class="nav-link" href="#" @click="signInWithGoogle()">Login</a>
              </li>

            </template>

            <li class="nav-item ml-2">
              <a class="btn btn-outline-warning" href="https://mequiz.page.link/baixar-app" target="_blank">
                Baixar app
              </a>
            </li>

          </ul>

          <form class="form-inline">
            <input class="form-control mr-sm-2" type="search" placeholder="Procurar quiz..." aria-label="Search">
            <button class="btn btn-outline-light my-2 my-sm-0" type="submit">Procurar</button>
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
    this.authObserver()
  },

  methods: {
    signInWithGoogle () {
      const provider = new firebase.auth.GoogleAuthProvider()

      firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
          /** @type {firebase.auth.OAuthCredential} */
          var credential = result.credential

          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = credential.accessToken
          console.log(token)
          // The signed-in user info.
          var user = result.user
          console.log(user)
          // ...
        }).catch((error) => {
          console.log(error)
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
        console.log({ isLoggedIn: this.isLoggedIn })

        if (user) {
          // const uid = user.uid
          this.$store.commit('setUser', user)

          this.isLoggedIn = true

          // if (this.isNewUser) {
          //   this.isNewUser = false
          //   await this.db.collection('users')
          //     .doc(uid)
          //     .set({
          //       userId: uid,
          //       anonymous: true,
          //       displayName: this.displayName.trim(),
          //       email: null,
          //       friends: [this.quizOwnerUserId],
          //       photoUrl: null
          //     })
          //   this.beginQuiz()
          // } else {
          //   await this.db.collection('users')
          //     .doc(uid)
          //     .update({
          //       friends: firebase.firestore.FieldValue.arrayUnion(this.quizOwnerUserId)
          //     })
          //     .catch(() => {
          //       firebase.auth().signOut().then(() => {
          //         console.log('Sign-out successful')
          //       }).catch(() => {
          //         console.error('Sign-out error')
          //       })
          //     })
          // }
        }

        this.isLoading.loginCheck = false
      })
    },

    logout () {
      firebase.auth().signOut().then(() => {
        console.log('Sign-out successful')
        this.isLoggedIn = false
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
