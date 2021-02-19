<template>
  <div>
    <div class="container text-left mt-3">
      <h1>Novo quiz</h1>

      <div class="my-4">
        <div class="form-group">
          <b>ID</b>
          <input v-model="quizId" class="form-control" type="text">
        </div>
        <div class="form-group">
          <b>Nome</b>
          <input v-model="quizName" class="form-control" type="text">
        </div>
      </div>

      <h2>Questões</h2>
      <div v-for="(question, questionIndex) in questions" :key="questionIndex" class="form-group" :class="[questionIndex > 0 ? 'mt-5' : 'mt-3']">
        <b>Questão {{ questionIndex + 1 }}</b>
        <input class="form-control" type="text" v-model="questions[questionIndex].text">

        <div class="mt-3">
          <div v-for="(answer, answerIndex) in question.answers" :key="answerIndex" class="ml-4 mt-3">
            <b class="text-warning">Alternativa {{ answerIndex + 1 }}</b>
            <input class="form-control" type="text" v-model="questions[questionIndex].answers[answerIndex]">
          </div>
        </div>
        <button class="btn btn-warning mt-4 ml-4" @click="addAlternative(questionIndex)">Adicionar alternativa</button>
      </div>

      <button class="btn btn-primary w-100 mt-4" @click="addQuestion()">Adicionar questão</button>
      <button class="btn btn-success w-100 mt-2" @click="saveQuiz()">Salvar e criar quiz</button>

    </div>
  </div>
</template>

<script>
import firebase from '../firebaseConfig'

export default {
  name: 'CreateQuiz',

  components: {
  },

  data () {
    return {
      db: firebase.firestore(),
      storageRef: firebase.storage().ref(),

      isLoading: {
        saving: false
      },

      quizId: '',
      quizName: '',
      questions: [
        {
          text: '',
          answers: ['', '']
        }
      ]
    }
  },

  methods: {
    addQuestion () {
      this.questions.push(
        {
          text: '',
          answers: ['', '']
        }
      )
    },

    addAlternative (questionIndex) {
      this.questions[questionIndex].answers.push('')
    },

    async saveQuiz () {
      this.isLoading.saving = true

      const quiz = {
        id: this.quizId,
        name: this.quizName,
        creation_date: firebase.firestore.FieldValue.serverTimestamp(),
        questions: [],
        answers: [],
        answers_count: [],
        isActive: true,
        imgName: 'bbb.jpeg'
      }

      this.questions.forEach(question => {
        quiz.questions.push(question.text.trim())
        quiz.answers_count.push(question.answers.length)
        quiz.answers = quiz.answers.concat(question.answers)
      })

      quiz.answers.map(answer => {
        return answer.trim()
      })

      await this.db.collection('quizzes')
        .doc(this.quizId)
        .set(quiz)

      this.isLoading.saving = false
    }
  }
}
</script>
