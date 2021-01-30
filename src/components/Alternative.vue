<template>
  <div class="w-100">
    <div class="w-100">
      <button
        class="btn w-100 mt-3"
        :class="[isSelected || isHighlighted ? (isCorrect ? 'btn-success' : 'btn-danger') : 'btn-light']"
        type="button"
        v-html="getQuestionText()"
        @click="selectAlternative"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alternative',

  props: {
    index: Number,
    text: String,
    isCorrect: Boolean
  },

  data () {
    return {
      canClick: true,
      isSelected: false,
      isHighlighted: false
    }
  },

  created () {
    this.$bus.$on('toggleInteraction', isInteractionAllowed => {
      this.canClick = isInteractionAllowed
    })
    this.$bus.$on('alternativeSelected', alternativeIndex => {
      if (this.isCorrect) {
        this.isHighlighted = true
      }
    })
  },

  methods: {
    getQuestionText () {
      const quizOwnerName = this.$store.state.quizOwnerUser.displayName
      return this.text.replace('%1$s', `<b>${quizOwnerName}</b>`)
      // return this.text.replace(/%1\$s/g, `<b>${quizOwnerName}</b>`)
    },

    selectAlternative () {
      if (this.canClick) {
        this.isSelected = true
        this.$bus.$emit('alternativeSelected', this.index)
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
