<template>
  <v-form class="settings" ref="form" v-model="valid" lazy-validation  >

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


      <v-sheet
        class="pa-6 mb-10 mt-5"
        color="white"
        elevation="2"
      >
        <!-- Thumbnail -->
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="thumbnail"
              label="Thumbnail Path"
              type="text"
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
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-btn
              small
              block
              @click="processThumbnail"
            >
              Import Thumbnail
            </v-btn>
          </v-col>
        </v-row>

      </v-sheet>

     
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
            rows="15"
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
import { open } from 'tauri/api/dialog'

function computeFrontmatterProperty(field, {get, set}={get: undefined, set: undefined}) {
    return {
      get: function() { 
          const v = this.$store.state.openItems[this.itemKey].frontmatter[field]; 
          return get ? get(v) : v
      }, 
      set: function(value) { 
          
          const v = set ? set(value) : value
          this.$store.commit('setFrontmatterField', {itemKey: this.itemKey, field, value: v}); 
      }
    }
}


export default {
  name: 'ItemEditor',
  components: {
    LinkListField
  },
  props: {
      itemKey: {
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

    validate() {
      return this.$refs.form.validate()
    },

    async processThumbnail() {
      try {
        this.$store.commit('setLoading', true);
        console.log('processThumbnail')
        const item = this.$store.state.openItems[this.itemKey]
        const imgPath = await open({filter: 'png,jpg'})
        console.log('imgPath', imgPath)
        await this.$store.dispatch('processThumbnail', {imgPath, item})
      } finally {
        this.$store.commit('setLoading', false);
      }
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
      console.log('itemType', utils.decodeItemKey(this.itemKey).type)
      return utils.decodeItemKey(this.itemKey).type
    },

    itemName: function() {
      console.log('itemName', utils.decodeItemKey(this.itemKey).name)
      return utils.decodeItemKey(this.itemKey).name
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
          return this.$store.state.openItems[this.itemKey].content; 
      }, 
      set: function(value){ 
          this.$store.commit('setContent', {itemKey: this.itemKey, value}); 
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
