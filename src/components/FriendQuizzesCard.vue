<template>
  <div v-show="isVisible()" class="mb-2">
    <div class="card bg-dark text-left">
      <div class="card-body">
        <div class="header d-flex justify-content-between">

          <div>
            <small class="text-muted">Quizzes</small>
            <br>
            <b>{{ friend ? friend.displayName : 'Seu amigo' }}</b>
            <br>
            <button class="btn btn-outline-primary btn-sm mt-2" @click="showQuizzes = !showQuizzes">
              {{ showQuizzes ? '🡡' : '🡣' }}
            </button>
          </div>
          <div class="text-right">
            <img v-if="friend && friend.photoUrl" :src="friend.photoUrl" class="rounded-circle w-75" loading="lazy">
            <img v-else src="@/assets/images/user.png" class="rounded-circle" width="72" loading="lazy">
          </div>
        </div>

        <div v-show="showQuizzes" class="mt-3">
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
    friendQuizzes: Array,
    searchQuery: String
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
      isLoggedIn: false,
      showQuizzes: true
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
    },

    isVisible () {
      const query = this.searchQuery.toLowerCase()
      return !this.friend || this.friend.displayName.toLowerCase().includes(query)
    }
  }
}
</script>
