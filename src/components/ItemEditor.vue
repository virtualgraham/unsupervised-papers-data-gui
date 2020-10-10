<template>
  <v-form class="settings">
    <v-container>
      <v-row>
        <v-col cols="12">
          {{itemType}}
        </v-col>
      </v-row>

      <!-- Area (Need to also add new area) -->
      <v-row v-if="itemType == 'task' || itemType == 'category'">
        <v-col cols="12">
          <v-autocomplete
            label="Area"
            :items="areas"
            v-model="area"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Title -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="title"
            label="Title"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>
     
      <!-- Date -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12">
          <v-text-field
            v-model="date"
            label="Date"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Year -->
      <v-row v-if="itemType == 'method'">
        <v-col cols="12">
          <v-text-field
            v-model="year"
            label="Year"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Categories -->
      <v-row v-if="itemType == 'method'">
        <v-col cols="12">
          <v-autocomplete
            chips
            deletable-chips
            multiple
            label="Categories"
            v-model="categories"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Components -->
      <v-row v-if="itemType == 'method'">
        <v-col cols="12">
          <v-autocomplete
            chips
            deletable-chips
            multiple
            label="Categories"
            v-model="components"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Introduced By -->
      <v-row v-if="itemType == 'method'">
        <v-col cols="12">
           <v-autocomplete
            label="Categories"
            v-model="introduced_by"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Parent Task -->
      <v-row v-if="itemType == 'task'">
        <v-col cols="12">
          <v-autocomplete
            label="Parent Task"
            v-model="parent_task"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Authors -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12" >
          Authors
        </v-col>
      </v-row>

      <!-- Abstract -->
      <v-row v-if="itemType == 'paper'"> 
        <v-col cols="12">
          <v-textarea
            label="Abstract"
            v-model="abstract"
          ></v-textarea>
        </v-col>
      </v-row>

      <!-- Links -->
      <v-row>
        <v-col cols="12">
          Links
        </v-col>
      </v-row>

      <!-- Supervision -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12">
          <v-autocomplete
            label="Supervision"
            v-model="supervision"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Tasks -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12">
          <v-autocomplete
            chips
            deletable-chips
            multiple
            label="Tasks"
            v-model="tasks"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Methods -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12">
          <v-autocomplete
            chips
            deletable-chips
            multiple
            label="Methods"
            v-model="methods"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Thumbnail -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="thumbnail"
            label="Thumbnail"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Card -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="card"
            label="Card"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- s2_paper_id -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12">
           <v-text-field
            v-model="s2_paper_id"
            label="S2 Paper ID"
            type="text"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- content -->
      <v-row>
        <v-col cols="12">
          <v-textarea
            label="Content"
            v-model="content"
          ></v-textarea>
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

    itemType: function() {
        console.log('this.$store.state.openItems[this.name]', this.$store.state.openItems[this.name])
        return this.$store.state.openItems[this.name].type
    },

    area: computeFrontmatterProperty('area'),
    title: computeFrontmatterProperty('title'),
    date: computeFrontmatterProperty('date'),
    year: computeFrontmatterProperty('year'),
    categories: computeFrontmatterProperty('categories'),
    components: computeFrontmatterProperty('components'),
    introduced_by: computeFrontmatterProperty('introduced_by'),
    parent_task: computeFrontmatterProperty('parent_task'),
    authors: computeFrontmatterProperty('authors'),
    abstract: computeFrontmatterProperty('abstract'),
    links: computeFrontmatterProperty('links'),
    supervision: computeFrontmatterProperty('supervision'),
    tasks: computeFrontmatterProperty('tasks'),
    methods: computeFrontmatterProperty('methods'),
    thumbnail: computeFrontmatterProperty('thumbnail'),
    card: computeFrontmatterProperty('card'),
    s2_paper_id: computeFrontmatterProperty('s2_paper_id'),
    
    content: {
      get: function(){ 
          return this.$store.state.openItems[this.name].content; 
      }, 
      set: function(value){ 
          this.$store.commit('setContent', {name: this.name, value}); 
      }
    }

  }
}
</script>


<style scoped>

</style>
