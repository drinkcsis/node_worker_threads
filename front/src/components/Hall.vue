<template>
  <div class='hall'>
    <person :person="person" :key="index"  v-for="(person, index) in Object.values(persons)"></person>
  </div>
</template>

<script>

import Person from './Person.vue'

export default {
  name: 'hello',
  components: {
    Person
  },
  props:{
    socket:null,
  },
  data () {
    return {
      persons: {}
    }
  },

  mounted() {
    this.socket.on('run', data => {
      this.persons = {};
    });

    this.socket.on('NewPerson', data => {
      this.persons = Object.assign({}, {
      ...this.persons,
      [data.id]:{
        id: data.id,
        status: 'new',
        counter: 1,
        inRound: true
      }})
    })

    this.socket.on('changeStatus', data => {
      this.persons[data.id].status = data.status;
      this.persons = Object.assign({}, { ...this.persons })
    })

    this.socket.on('changeCounter', data => {
      this.persons[data.id].counter += data.counter;
      this.persons = Object.assign({}, { ...this.persons })
    })

    this.socket.on('reoundPersons', data => {
      Object.values(this.persons).map(person => {
        person.inRound = data.includes(person.id.toString())
      })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.hall{
  margin: 0 auto;
  width: 1300px;
  float:right
}
</style>
