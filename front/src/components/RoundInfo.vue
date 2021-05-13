<template>
  <div class='round'>
    <button class='run-btn' @click="run" :disabled="disabled">RUN</button>
    <textarea v-model="getLog" ></textarea>
  </div>
</template>

<script>
// @ts-nocheck

export default {
  name: 'RoundInfo',
  props:{
    socket:null,
  },
  data () {
    return {
      log: [],
      disabled: true
    }
  },

  computed:{
    getLog: function() {
      return this.log.join('\n')
    }
  },

  methods: {
    run() {
      this.socket.emit('run')
      this.disabled = true
    }
  },

  created: function () {
    this.socket.on('log', data => {
      this.log.push(data)
    });

    this.socket.on('connect', () => {
        this.disabled = false
    });

    this.socket.on('disconnect', () => {
        this.disabled = true
    });

    this.socket.on('Finish', () => {
        this.disabled = false
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.round{
  float:left
}
textarea {
  margin: 0px;
  height: 500px;
  width: 400px;
  padding-left: 20px;
}
</style>
