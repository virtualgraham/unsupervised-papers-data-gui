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
      <div v-for="(link, index) in links" :key="link.url" class="mb-5">
        <LinkField 
          :value="link" 
          @input="update($event, index)" 
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
  data() {
    return {
      links: this.value
    }
  },
  components: {
    LinkField
  },
  methods: {
    add() {
      console.log('add')
      this.links.push({
        title: '',
        url: '',
        type: 'website'
      })
      this.$emit("input", this.links);
    },
    remove(e) {
      console.log('remove', e.index)
      this.$delete(this.links, e.index)
      this.$emit("input", this.links);
    },
    up(e) {
      console.log('up', e.index)
      if(e.index == 0) return
      const a = this.links[e.index]
      const b = this.links[e.index - 1]
      this.$set(this.links, e.index, b)
      this.$set(this.links, e.index-1, a)
      this.$emit("input", this.links);
    },
    down(e) {
      console.log('down', e.index)
      if(e.index == this.links.length-1) return
      const a = this.links[e.index]
      const b = this.links[e.index + 1]
      this.$set(this.links, e.index, b)
      this.$set(this.links, e.index+1, a)
      this.$emit("input", this.links);
    },
    update(e, index) {
      this.$set(this.links, index, e)
      this.$emit("input", this.links);
    },
  }
};
</script>

<style scoped>
  .v-toolbar__content {
    padding: 0 !important;
  }
</style>