<template>
  <div>
    <div>
      <button class="btn btn-light w-100 mt-3" type="button" v-html="getQuestionText()" />
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

    }
  },

  methods: {
    getQuestionText () {
      const quizOwnerName = this.$store.state.quizOwnerUser.displayName
      return this.text.replace('%1$s', `<b>${quizOwnerName}</b>`)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
