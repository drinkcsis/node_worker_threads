<template>
  <div class='round'>
    <textarea v-model="getLog" ></textarea>
  </div>
</template>

<script>

export default {
  name: 'RoundInfo',
  props:{
    socket:null,
  },
  data () {
    return {
      log: []
    }
  },

  computed:{
    getLog: function() {
      return this.log.join('\n')
    }
  },

  created: function () {
    this.socket.on('log', data => {
      this.log.push(data)
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
