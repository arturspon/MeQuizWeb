<template>
  <div>
    <div class="actionBar py-2 pl-2 pr-2">
      <b>{{ quiz.name }}</b>
    </div>

    <div class="my-3 ml-3 mr-3">

      <div class="question bg-white rounded text-dark py-5 pl-1 pr-1" v-html="getQuestionText()">
      </div>

      <div class="alternatives mt-5">
        <div>
          <div v-for="(alternative, index) in getAlternatives()" :key="index">
            <Alternative :index="index" :text="alternative" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Alternative from '@/components/Alternative'

export default {
  name: 'AlternativesManager',

  components: {
    Alternative
  },

  props: {
    quiz: Object
  },

  data () {
    return {
      currentQuestionIndex: 0,
      quizOwnerName: ''
    }
  },

  created () {
    this.quizOwnerName = this.$store.state.quizOwnerUser.displayName
  },

  methods: {
    getQuestionText () {
      const question = this.quiz.questions[this.currentQuestionIndex]
      return question.replace('%1$s', `<b>${this.quizOwnerName}</b>`)
    },

    getAlternatives () {
      const alternatives = []
      const answerCount = this.quiz.answers_count[this.currentQuestionIndex]

      for (let i = 0; i < answerCount; i++) {
        const alternative = this.quiz.answers[i]
        alternatives.push(alternative)
      }

      return alternatives
    },

    nextQuestion () {
      this.currentQuestionIndex++
    }
  }
}
</script>

<style scoped lang="scss">

.actionBar {
  background-color: var(--colorPrimary);
}

.alternatives {
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
