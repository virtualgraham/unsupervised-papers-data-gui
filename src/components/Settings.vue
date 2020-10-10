<template>
  <v-form class="settings">
    <v-container>
      <v-row>
        <v-col cols="12">

          <v-text-field
            v-model="dataDir"
            append-outer-icon="mdi-folder"
            label="Data Directory"
            type="text"
            @click:append-outer="selectDataDir"
          ></v-text-field>

        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">

          <v-text-field
            v-model="pdfDir"
            append-outer-icon="mdi-folder"
            label="PDF Directory"
            type="text"
            @click:append-outer="selectPdfDir"
          ></v-text-field>

        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">

          <v-btn block
            @click="loadData"
          >
            Load Data
          </v-btn>

        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>


<script>
import { open } from 'tauri/api/dialog'

export default {
  name: 'Settings',
  components: {
  },
  props: {
  },
  methods: {
    selectDataDir: async function(){
      const selectedDir = await open({directory: true})
      this.dataDir = selectedDir
    },
    selectPdfDir: async function(){
      const selectedDir = await open({directory: true})
      this.pdfDir = selectedDir
    },
    loadData: async function(){
      this.$store.dispatch('loadData')
    }
  },
  computed:{
    dataDir:{
      get: function(){ 
          return this.$store.state.dataDir; 
      }, 
      set: function(v){ 
          this.$store.commit('setDataDir', v); 
      }
    },
    pdfDir:{
      get: function(){ 
          return this.$store.state.pdfDir; 
      }, 
      set: function(v){ 
          this.$store.commit('setPdfDir', v); 
      }
    }
  }
}
</script>


<style scoped>

</style>
