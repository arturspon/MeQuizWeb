<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>
  </div>
</template>

<style lang="scss">
:root {
  --colorPrimary: #16A085;
  --colorAccent: #FF6600;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  height: 100vh;
}

body {
  background-color: #3D454E;
  background-image: url(assets/images/bg.png);
  background-size: 128px;
}
</style>
