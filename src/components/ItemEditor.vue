<template>
  <v-form class="settings" ref="form" v-model="valid" lazy-validation>
    <!-- <v-container class="px-6 pb-0">
      <v-toolbar dense class="elevation-0">
        <v-toolbar-title>{{itemTypeLabel}}</v-toolbar-title>

        <v-spacer></v-spacer>

        <div>
          <span v-if="saved">Saved</span>
          <span v-if="!saved">Not Saved</span>
        </div>

        <v-btn 
          v-if="hasPdf"
          class="ml-4"
          small
          outlined
          color="primary"
          dark
          @click="pdf"
        >
          PDF
        </v-btn>

        <v-btn
          class="ml-4"
          small
          outlined
          color="primary"
          dark
          @click="remove"
        >
          Remove
        </v-btn>

        <v-btn
          class="ml-4"
          small
          outlined
          color="primary"
          dark
          @click="close"
        >
          Close
        </v-btn>

        <v-btn
          class="ml-4"
          small
          outlined
          color="primary"
          dark
          @click="save"
        >
          Save
        </v-btn>

        <v-btn
          class="ml-4"
          small
          outlined
          color="primary"
          dark
          @click="saveAndClose"
        >
          Save &amp; Close
        </v-btn>
      </v-toolbar>
    </v-container> -->

    <v-container class="px-10 pt-0 pb-10" >


      <!-- Title -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="title"
            :rules="titleRules"
            label="Title"
            type="text"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Name -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="titleKebob"
            label="Name"
            type="text"
            readonly
            append-outer-icon="mdi-content-copy"
            @click:append-outer="copyName"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Also Known As -->
      <v-row v-if="itemType == 'task' || itemType == 'category' || itemType == 'method'">
        <v-col cols="12" >
          <v-text-field
            v-model="also_known_as"
            label="Also Known As"
            type="text"            
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Area (Need to also add new area) -->
      <v-row v-if="itemType == 'task' || itemType == 'category' || itemType == 'method'">
        <v-col cols="12">
          <v-combobox
            label="Area"
            :rules="areaRules"
            :items="areaItems"
            v-model="area"
            required
          ></v-combobox>
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
            :items="categoryItems"
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
            label="Components"
            v-model="components"
            :items="methodItems"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Introduced By -->
      <v-row v-if="itemType == 'method'">
        <v-col cols="12">
           <v-autocomplete
            label="Introduced By"
            v-model="introduced_by"
            :items="paperItems"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Parent Task -->
      <v-row v-if="itemType == 'task'">
        <v-col cols="12">
          <v-autocomplete
            label="Parent Task"
            v-model="parent_task"
            :items="taskItems"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Authors -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12" >
          <v-text-field
            v-model="authors"
            label="Authors"
            type="text"
          ></v-text-field>
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
      <v-row v-if="itemType != 'category'">
        <v-col cols="12">
          <LinkListField v-model="links" />
        </v-col>
      </v-row>

      <!-- Supervision -->
      <v-row v-if="itemType == 'paper'">
        <v-col cols="12">
          <v-autocomplete
            label="Supervision"
            v-model="supervision"
            chips
            deletable-chips
            multiple
            :items="supervisionItems"
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
            :items="taskItems"
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
            :items="methodItems"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- Thumbnail -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="thumbnail"
            label="Thumbnail Path"
            type="text"
            append-outer-icon="mdi-pencil-box-outline"
            @click:append-outer="fillThumbnail"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Card -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="card"
            label="Card Path"
            type="text"
            append-outer-icon="mdi-pencil-box-outline"
            @click:append-outer="fillCard"
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
            @keyup.ctrl.76="console.log('ctrl-v')"
            style="font-family: 'Lucida Console', Monaco, monospace"
            outlined
            label="Content"
            v-model="content"
          ></v-textarea>
        </v-col>
      </v-row>



    </v-container>




  </v-form>

  
</template>


<script>

import LinkListField from './LinkListField.vue'
import utils from '../utils.js'

function computeFrontmatterProperty(field, {get, set}={get: undefined, set: undefined}) {
    return {
      get: function() { 
          const v = this.$store.state.openItems[this.name].frontmatter[field]; 
          return get ? get(v) : v
      }, 
      set: function(value) { 
          
          const v = set ? set(value) : value
          this.$store.commit('setFrontmatterField', {name: this.name, field, value: v}); 
      }
    }
}

// function decodeKebobCase(str) {
//     if (!str) {
//         return ''
//     }
//     return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
// }

// function encodeKebobCase(str) {
//     return str.replace(/[^0-9a-zA-Z]+/g, ' ').trim().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[-\s]+/g, '-').toLowerCase()
// }

export default {
  name: 'ItemEditor',
  components: {
    LinkListField
  },
  props: {
      name: {
        type: String,
        required: true
      }
  },
  data() {
    return {
      valid: true,
      titleRules: [
        v => !(!v || v.trim().length == 0) || 'Title is required',
      ],
      areaRules: [
        value => 
        {
          let valid = false
          if (typeof value === 'object') {
            valid = value.value && value.value.trim().length > 0
          } else {
            valid = value && value.trim().length > 0
          }
          
          return valid || 'Area is required'
        }
      ],
    }
  },
  methods: {
    // pdf() {
    //   this.$store.dispatch('openPdf', this.name)
    // },
    // remove() {
    //   const self = this
    //   this.$store.commit('openDialog', {
    //     message: `Permanently remove ${self.itemType}?`,
    //     callback: (value)=>{
    //       if(value) {
    //         self.$store.dispatch('removeItem', this.name)
    //       }
    //     }
    //   });
    // },
    // close() {
    //   if(!this.saved) {
    //     const self = this
    //     this.$store.commit('openDialog', {
    //       message: `Discard unsaved changed?`,
    //       callback: (value)=>{
    //         if(value) {
    //           self.$store.commit('closeItem', this.name);
    //         }
    //       }
    //     });
    //   } else {
    //     this.$store.commit('closeItem', this.name);
    //   }
    // },
    // save() {
    //   const valid = this.$refs.form.validate()
    //   console.log('valid', valid)
    //   if(valid) {
    //     this.$store.dispatch('saveItem', {name: this.name, close: false})
    //   }
    // },
    // saveAndClose() {
    //   const valid = this.$refs.form.validate()
    //   console.log('valid', valid)
    //   if(valid) {
    //     this.$store.dispatch('saveItem', {name: this.name, close: true});
    //   }
    // },
    validate() {
      return this.$refs.form.validate()
    },
    fillThumbnail() {
      this.thumbnail = `${this.name}-thumb.jpg`
    },
    fillCard() {
      this.card = `${this.name}-card.jpg`
    },
    async copyName() {
      try {
        await navigator.clipboard.writeText(this.titleKebob)
        this.$store.commit('openSnackbar', "Copied to clipboard");
      } catch {
        this.$store.commit('openSnackbar', "Unable to copy");
      }
    }
  },
  computed:{
    // hasPdf() {
    //   return this.itemType == 'paper' && this.$store.state.pdfFiles[`${this.name}.pdf`]
    // },

    supervisionItems() {
      return [
        {
          text: 'Unsupervised',
          value: 'unsupervised'
        },
        {
          text: 'Self-supervised',
          value: 'self-supervised'
        },
        {
          text: 'Semi-supervised',
          value: 'semi-supervised'
        },
        {
          text: 'Weakly Supervised',
          value: 'weakly-supervised'
        },
        {
          text: 'Supervised',
          value: 'supervised'
        }
      ]
    },

    areaItems() {
      const items = this.$store.getters[this.type == 'task' ? 'taskAreas' : 'methodAreas'].map(area => ({
        text: utils.decodeKebobCase(area),
        value: area
      }))
      items.sort((a, b) => a.text.localeCompare(b.text))
      return items
    },

    taskItems() {
      const items = Object.values(this.$store.state['tasks']).map(item => ({
        text: item.frontmatter.title,
        value: item.name
      }))
      items.sort((a, b) => a.text.localeCompare(b.text))
      return items
    },

    methodItems() {
      const items = Object.values(this.$store.state['methods']).map(item => ({
        text: item.frontmatter.title,
        value: item.name
      }))
      items.sort((a, b) => a.text.localeCompare(b.text))
      return items
    },

    categoryItems() {
      const items = Object.values(this.$store.state['categories']).map(item => ({
        text: item.frontmatter.title,
        value: item.name
      }))
      items.sort((a, b) => a.text.localeCompare(b.text))
      return items
    },

    paperItems() {
      const items = Object.values(this.$store.state['papers']).map(item => ({
        text: item.frontmatter.title,
        value: item.name
      }))
      items.sort((a, b) => a.text.localeCompare(b.text))
      return items
    },

    itemType: function() {
        return this.$store.state.openItems[this.name].type
    },

    itemTypeLabel: function() {
        return utils.decodeKebobCase(this.itemType)
    },

    area: computeFrontmatterProperty('area', {
      get(value) {
        return {
          text: utils.decodeKebobCase(value),
          value: value
        }
      },
      set(value) {
        if(typeof value === 'object' && value !== null) {
          return value.value
        }
        return utils.encodeKebobCase(value)
      }
    }),

    title: computeFrontmatterProperty('title'),
    also_known_as: computeFrontmatterProperty('also_known_as', {
      get(value) {
        return value ? value.join(', ') : []
      },
      set(value) {
        return value.split(',').map(v => v.trim()).filter(v => v.length > 0)
      }
    }),
    date: computeFrontmatterProperty('date'),
    year: computeFrontmatterProperty('year'),
    categories: computeFrontmatterProperty('categories'),
    components: computeFrontmatterProperty('components'),
    introduced_by: computeFrontmatterProperty('introduced_by'),
    parent_task: computeFrontmatterProperty('parent_task'),
    authors: computeFrontmatterProperty('authors', {
      get(value) {
        return value ? value.join(', ') : []
      },
      set(value) {
        return value.split(',').map(v => v.trim()).filter(v => v.length > 0)
      }
    }),
    abstract: computeFrontmatterProperty('abstract'),
    links: computeFrontmatterProperty('links'),
    supervision: computeFrontmatterProperty('supervision'),
    tasks: computeFrontmatterProperty('tasks'),
    methods: computeFrontmatterProperty('methods'),
    thumbnail: computeFrontmatterProperty('thumbnail'),
    card: computeFrontmatterProperty('card'),
    s2_paper_id: computeFrontmatterProperty('s2_paper_id'),
    
    titleKebob() {
      return utils.encodeKebobCase(this.title)
    },

    content: {
      get: function(){ 
          return this.$store.state.openItems[this.name].content; 
      }, 
      set: function(value){ 
          this.$store.commit('setContent', {name: this.name, value}); 
      }
    },

    // saved() {
    //   return this.$store.state.openItems[this.name].saved
    // }

  }
}
</script>


<style scoped>

</style>
