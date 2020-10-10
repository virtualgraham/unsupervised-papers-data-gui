<template>
  <v-form class="settings">
    <v-container>
      <v-row>
        <v-col cols="12">
          {{itemType}}
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="title"
            label="Title"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>
     

      <v-row v-if="itemType == 'task' || itemType == 'category'">
        <v-col cols="12">
          <v-autocomplete
            label="Area"
            :items="areas"
            v-model="area"
            solo
          ></v-autocomplete>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-btn block
            @click="close"
          >
            Close
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn block
            @click="save"
          >
            Save
          </v-btn>
        </v-col>
      </v-row>

    </v-container>
  </v-form>
</template>


<script>

function computeFrontmatterProperty(field) {
    return {
      get: function(){ 
          return this.$store.state.openItems[this.name].frontmatter[field]; 
      }, 
      set: function(value){ 
          this.$store.commit('setFrontmatterField', {name: this.name, field, value}); 
      }
    }
}

function decodeKebobCase(str) {
    if (!str) {
        return ''
    }
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

export default {
  name: 'ItemEditor',
  components: {
  },
  props: {
      name: {
        type: String,
        required: true
      }
  },
  methods: {
    close() {
      this.$store.commit('closeItem', this.name);
    },
    save() {
      this.$store.dispatch('saveItem', this.name)
    }
  },
  computed:{
    areas() {
      return this.$store.state[this.type == 'category' ? 'methodAreas' : 'taskAreas'].map(area => ({
        text: decodeKebobCase(area),
        value: area
      }))
    },
    content: {
      get: function(){ 
          return this.$store.state.openItems[this.name].content; 
      }, 
      set: function(value){ 
          this.$store.commit('setContent', {name: this.name, value}); 
      }
    },
    itemType: function() {
        console.log('this.$store.state.openItems[this.name]', this.$store.state.openItems[this.name])
        return this.$store.state.openItems[this.name].type
    },
    area: computeFrontmatterProperty('area'),
    parent_task: computeFrontmatterProperty('parent_task'),
    year: computeFrontmatterProperty('year'),
    categories: computeFrontmatterProperty('categories'),
    components: computeFrontmatterProperty('components'),
    introduced_by: computeFrontmatterProperty('introduced_by'),
    title: computeFrontmatterProperty('title'),
    date: computeFrontmatterProperty('date'),
    authors: computeFrontmatterProperty('authors'),
    abstract: computeFrontmatterProperty('abstract'),
    thumbnail: computeFrontmatterProperty('thumbnail'),
    card: computeFrontmatterProperty('card'),
    links: computeFrontmatterProperty('links'),
    supervision: computeFrontmatterProperty('supervision'),
    tasks: computeFrontmatterProperty('tasks'),
    methods: computeFrontmatterProperty('methods'),
    s2_paper_id: computeFrontmatterProperty('s2_paper_id'),
  }
}
</script>


<style scoped>

</style>
