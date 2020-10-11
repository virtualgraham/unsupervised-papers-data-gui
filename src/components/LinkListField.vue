<template>
  <div class="d-flex flex-column">
    <v-toolbar dense class="elevation-0 mb-2 px-0">
      <v-toolbar-title>Links</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        tile
        dark
        small
        color="green"
        @click="add"
      >
        <v-icon>mdi-plus</v-icon>Add
      </v-btn>
    </v-toolbar>
    <div class="d-flex flex-column">
      <div v-for="(value, index) in value" :key="index" class="mb-5">
        <LinkField 
          :value="value" 
          @input="update" 
          @remove="remove" 
          @up="up" 
          @down="down"
          :index="index"
          :ref="`link-${index}`" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import LinkField from './LinkField.vue'

export default {
  props: ["value"],
  components: {
    LinkField
  },
  methods: {
    add() {
      const value = [...this.value, {
        title: '',
        url: '',
        type: 'website'
      }]
      this.$emit("input", value);
    },
    remove(e) {
      const value = [...this.value.slice(0, e.index), ...this.value.slice(e.index + 1)]
      this.$emit("input", value);
    },
    up(e) {
      if(e.index == 0) return
      const value = [...this.value.slice(0, e.index-1), this.value[e.index], this.value[e.index - 1], ...this.value.slice(e.index + 1)]
      this.$emit("input", value);
    },
    down(e) {
      if(e.index == this.value.length-1) return
      const value = [...this.value.slice(0, e.index), this.value[e.index + 1], this.value[e.index], ...this.value.slice(e.index + 2)]
      this.$emit("input", value);
    },
    update() {
      const value = [...Array(this.value.length).keys()].map((index) => this.$refs[`link-${index}`][0].value);
      this.$emit("input", value);
    },
  }
};
</script>

<style scoped>
  .v-toolbar__content {
    padding: 0 !important;
  }
</style>