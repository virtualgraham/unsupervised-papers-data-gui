<template>
  <div class="d-flex flex-column">
    <v-toolbar dense class="elevation-0 mb-4 px-0" color="#f9f9f9">
      <v-toolbar-title>Links</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        small
        color="primary"
        dark
        @click="add"
      >
        <v-icon>mdi-plus</v-icon>Add
      </v-btn>
    </v-toolbar>
    <div class="d-flex flex-column">
      <div v-for="(link, index) in links" :key="linkHash(link)" class="mb-5 mx-2">
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
    linkHash(link) {
      return link.title + link.resource + link.description + link.icon + link.url
    },
    add() {
      this.links.push({
        title: '',
        resource: '',
        description: '',
        url: '',
        icon: 'website'
      })
      this.$emit("input", this.links);
    },
    remove(e) {
      this.$delete(this.links, e.index)
      this.$emit("input", this.links);
    },
    up(e) {
      if(e.index == 0) return
      const a = this.links[e.index]
      const b = this.links[e.index - 1]
      this.$set(this.links, e.index, b)
      this.$set(this.links, e.index-1, a)
      this.$emit("input", this.links);
    },
    down(e) {
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