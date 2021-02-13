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

  ::-webkit-scrollbar {
    width: 12px;
    background-color: transparent;
  }

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: var(--colorAccent);
  }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}

body {
  background-color: #3E454D;
  // background-image: url(assets/images/bg.png);
  // background-size: 128px;
}
</style>
