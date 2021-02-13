<template>
  <div class="mb-2">
    <div class="card bg-dark text-left">
      <div class="card-body">
        <div class="header d-flex justify-content-between">

          <div>
            <small class="text-muted">Quizzes</small>
            <br>
            <b>{{ friend ? friend.displayName : 'Seu amigo' }}</b>
          </div>
          <div class="text-right">
            <img v-if="friend && friend.photoUrl" :src="friend.photoUrl" class="rounded-circle w-75">
            <img v-else src="@/assets/images/user.png" class="rounded-circle" width="72">
          </div>
        </div>

        <div class="mt-3">
          <FriendQuizCard
            v-for="(quiz, index) in friendQuizzes"
            :key="index"
            :friendQuiz="quiz"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'
import FriendQuizCard from '@/components/FriendQuizCard'

export default {
  name: 'FriendQuizzesCard',

  props: {
    friendQuizzes: Array
  },

  components: {
    FriendQuizCard
  },

  data () {
    return {
      db: firebase.firestore(),
      userId: null,
      friend: null,
      quizImgUrl: '',
      isQuizAlreadyDone: false,
      isLoggedIn: false
    }
  },

  created () {
    this.userId = localStorage.getItem('uid')
    this.fetchFriendProfile()
  },

  methods: {
    async fetchFriendProfile () {
      this.friend = await this.db
        .collection('users').doc(this.friendQuizzes[0].userId).get()
      this.friend = this.friend.data()
    },

    async checkQuizAlreadyDone () {
      if (!this.userId) {
        return
      }

      const activeQuiz = await this.db.collection('activeQuizzes')
        .doc(this.userId)
        .collection('userQuizzes')
        .doc(this.quiz.id)
        .get()

      this.isQuizAlreadyDone = activeQuiz.exists
    }
  }
}
</script>
