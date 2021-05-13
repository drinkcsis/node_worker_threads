<template>
  <div class="person" :class="getClass">
    <p>{{this.person.counter}}</p>
  </div>
</template>

<script>
export default {
  name: 'person',
  props: {
    person: {}
  },
  computed: {
    getClass: function() {
      return `${this.person.status} ${this.person.inRound && 'border'}`;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
p {
  margin: auto; /* Important */
  text-align: center;
}

.person{
  display: flex;
  width: 30px;
  height: 30px;
  padding: 5px;
  text-align: center;
  margin: 5px;
  float: left;
  border-radius:30px;
}
.new{
  background: gray;
}

.finding {
  background: blue;
  animation: blink 1s linear infinite;
}

.result{
  background: green;
}

.found{
  background: yellow;
}

.sit{
  background: #ff000017;
}

.border{
  border: 3px solid;
  padding: 2px;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
