<template>
  <div id="app">
    <header>
      <span>How many people in the Hall</span>
    </header>
    <main>
      <button @click="run">RUN</button>
      <div class='wrapper'>
        <round-info :socket="socket"></round-info>
        <hall :socket="socket"></hall>
      </div>
    </main>
  </div>
</template>

<script>
import Hall from './components/Hall'
import RoundInfo from './components/RoundInfo'
import io from 'socket.io-client';

export default {

  name: 'app',

  components: {
    Hall,
    RoundInfo
  },

  data: function () {
    return {
      socket: null,
    }
  },

  methods: {
    run() {
      this.socket.emit('run')
    }
  },

  created: function () {
    console.log('Starting Connection to socket server')
    this.socket = io('ws://localhost:3000', { transports: ["websocket"] })

    this.socket.on('connect', () => {
        console.log('connected')
    });
  }
}
</script>

<style>
.wrapper{
  padding: 20px 20px;
}

body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
  text-align: center;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}

.round {
  margin: 20px;
}
</style>
