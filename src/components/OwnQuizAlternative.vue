<template>
  <div class="w-100">
    <div class="w-100">
      <button
        class="btn w-75 mt-3"
        :class="[isSelected || isHighlighted ? 'btn-info' : 'btn-light']"
        type="button"
        v-html="getQuestionText()"
        @click="selectAlternative"
      />

      <audio ref="successSound" src="@/assets/sounds/snd_sucess.mp3"></audio>
      <audio ref="errorSound" src="@/assets/sounds/snd_error.wav"></audio>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alternative',

  props: {
    index: Number,
    text: String
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
      if (this.index === alternativeIndex) {
        this.isHighlighted = true
      }
    })
  },

  methods: {
    getQuestionText () {
      return this.text.replace('%1$s', 'Você')
    },

    selectAlternative () {
      if (this.canClick) {
        this.isSelected = true
        this.$refs.successSound.play()
        this.$bus.$emit('alternativeSelected', this.index)
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
