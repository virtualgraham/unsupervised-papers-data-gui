<template>
  <v-app>
    <div id="app-inner">
      <div class="left-accordian">
        <v-expansion-panels accordion>
          <v-expansion-panel @change="panelOpened('tasksList')">
            <v-expansion-panel-header class="py-1">
              <div class="add-button">
                <div class="flex-grow-1">
                  Tasks
                </div>
                <div>
                  <v-btn
                    icon
                    :disabled="!loaded"
                    color="green"
                    @click="addTask"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <ItemList itemType="task" ref="tasksList" />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel @change="panelOpened('methodsList')">
            <v-expansion-panel-header class="py-1">
              <div class="add-button">
                <div class="flex-grow-1">
                  Methods
                </div>
                <div>
                  <v-btn
                    icon
                    :disabled="!loaded"
                    color="green"
                    @click="addMethod"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <ItemList itemType="method" ref="methodsList" />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel @change="panelOpened('categoriesList')">
            <v-expansion-panel-header class="py-1">
              <div class="add-button">
                <div class="flex-grow-1">
                  Categories
                </div>
                <div>
                  <v-btn
                    icon
                    :disabled="!loaded"
                    color="green"
                    @click="addCategory"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <ItemList itemType="category" ref="categoriesList" />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel @change="panelOpened('papersList')">
            <v-expansion-panel-header class="py-1">
              <div class="add-button">
                <div class="flex-grow-1">
                  Papers
                </div>
                <div>
                  <v-btn
                    icon
                    :disabled="!loaded"
                    color="green"
                    @click="addPaper"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <ItemList itemType="paper" ref="papersList" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div class="content-tabs">
        <v-card>
          <v-tabs
            background-color="#f9f9f9"
            v-model="openTabIndex"
            center-active
          >
            <v-tabs-slider></v-tabs-slider>
            <v-tab
              v-for="tab in tabs"
              :key="tab"
            >
              <span v-if="tab != '__settings__'" class="tab-font">{{title(tab)}}</span>
              <v-icon v-if="tab == '__settings__'">mdi-cog-outline</v-icon>
            </v-tab>
          </v-tabs>
        </v-card>

        <v-container class="px-10 pt-1 pb-0" v-if="openTabName != '__settings__'" style="max-width: unset; background-color: #f9f9f9">
          <v-toolbar dense class="elevation-0" color="#f9f9f9">
            <v-toolbar-title>{{itemTypeLabel}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <div>
              <span v-if="isNew">New</span>
              <span v-if="saved">Saved</span>
              <span v-if="!isNew && !saved">Not Saved</span>
            </div>

            <v-btn 
              class="ml-4"
              small
              color="primary"
              dark
              outlined
              @click="openDev"
            >
              <v-icon dark>
                mdi-link-variant
              </v-icon>
              Dev
            </v-btn>

            <v-btn 
              class="ml-4"
              small
              color="primary"
              dark
              outlined
              @click="openProd"
            >
              <v-icon dark>
                mdi-link-variant
              </v-icon>
              Prod
            </v-btn>

            <v-btn 
              v-if="hasPdf"
              class="ml-4"
              small
              color="primary"
              dark
              outlined
              @click="pdf"
            >
              PDF
            </v-btn>

            <v-btn
              class="ml-4"
              small
              color="warning"
              dark
              @click="remove"
            >
              Remove
            </v-btn>



            <v-btn
              class="ml-4"
              small
              color="primary"
              dark
              @click="save"
            >
              Save
            </v-btn>

            <v-btn
              class="ml-4"
              small
              color="primary"
              dark
              @click="saveAndClose"
            >
              Save &amp; Close
            </v-btn>

            <v-btn
              class="ml-4"
              small
              color="primary"
              dark
              @click="close"
            >
              Close
            </v-btn>
          </v-toolbar>
        </v-container>

        <v-tabs-items v-model="openTabIndex" style="height: calc(100vh - 100px); overflow: auto">
          <v-tab-item
            v-for="tab in tabs"
            :key="tab"
          >
            <Settings v-if="tab == '__settings__'"/>
            <v-card flat v-if="tab != '__settings__'">
              <ItemEditor :itemKey="tab" :ref="tab" />
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </div>

    </div>

    <v-dialog
      v-model="dialogOpen"
      persistent
      max-width="290"
      @click:outside="closeDialog(false)"
    >
      <v-card>
        <v-card-title class="headline">
          Confirm
        </v-card-title>
        <v-card-text>{{dialogMessage}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="closeDialog(false)"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="closeDialog(true)"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        
    <v-snackbar
      v-model="snackbarOpen"
    >
      {{snackbarMessage}}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="snackbarOpen=false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-dialog
      v-model="loading"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          Loading
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import Settings from './components/Settings.vue'
  import ItemList from './components/ItemList.vue'
  import ItemEditor from './components/ItemEditor.vue'
  import utils from './utils.js'
  import { execute } from 'tauri/api/process'
  // import { open } from 'tauri/api/dialog'

  export default {
    name: "app",
    components: {
      Settings,
      ItemList,
      ItemEditor
    },
    data() {
      return {
        paperFilter: '',
      }
    },
    methods: {
      async openUrl(base) {
        let url;

        if(this.itemType == 'category') {
          url = `${base}/methods/category/${this.itemName}`
        } else {
          url = `${base}/${this.itemType}/${this.itemName}`
        }

        console.log('openUrl', url)
        await execute('open', url)
      },
      async openProd() {
        await this.openUrl('http://unsupervisedpapers.com')
      },
      async openDev() {
        await this.openUrl('http://localhost:8000')
      },
      async pdf() {
        if (!this.$store.state.pdfDir) return
        await execute('open', `${this.$store.state.pdfDir}/${this.itemName}.pdf`)
      },
      remove() {
        const self = this
        this.$store.commit('openDialog', {
          message: `Permanently remove ${self.itemType}?`,
          callback: (value)=>{
            if(value) {
              self.$store.dispatch('removeItem', utils.decodeItemKey(this.openTabName))
            }
          }
        });
      },
      close() {
        if(!this.saved) {
          const self = this
          this.$store.commit('openDialog', {
            message: `Discard unsaved changed?`,
            callback: (value)=>{
              if(value) {
                self.$store.commit('closeItem', this.openTabName);
              }
            }
          });
        } else {
          this.$store.commit('closeItem', this.openTabName);
        }
      },
      save() {
        console.log('save', this.$refs[this.openTabName])
        const valid = this.$refs[this.openTabName][0].validate() // TODO FIX
        console.log('valid', valid)
        if(valid) {
          const itemKey = utils.decodeItemKey(this.openTabName)
          this.$store.dispatch('saveItem', {name: itemKey.name, type: itemKey.type, close: false})
        }
      },
      saveAndClose() {
        console.log('saveAndClose', this.$refs[this.openTabName])
        const valid = this.$refs[this.openTabName][0].validate() // TODO FIX
        console.log('valid', valid)
        if(valid) {
          const itemKey = utils.decodeItemKey(this.openTabName)
          this.$store.dispatch('saveItem', {name: itemKey.name, type: itemKey.type, close: true});
        }
      },



      title(name) {
        return this.$store.state.openItems[name].frontmatter.title
      },
      closeDialog(value) {
        const callback = this.$store.state.dialogCallback
        this.$store.commit('closeDialog', value); 
        if(callback) setTimeout(callback(value))
      },
      panelOpened(r) {
        this.$refs[r].opened()
      },
      addTask(e) {
        e.stopPropagation()
        this.$store.commit('addItem', 'task'); 
      },
      addMethod(e) {
        e.stopPropagation()
        this.$store.commit('addItem', 'method'); 
      },
      addCategory(e) {
        e.stopPropagation()
        this.$store.commit('addItem', 'category'); 
      },
      addPaper(e) {
        e.stopPropagation()
        this.$store.commit('addItem', 'paper'); 
      },
      truncate(str, n){
        return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
      }
    },
    // watch: {
    //   openItems (val) {
    //     this.tab = val.length
    //   }
    // },
    computed: {
      isNew() {
        return !this.$store.state[utils.typeMap[this.itemType]][this.itemName]
      },
      openTabName() {
        return this.$store.state.openTabName
      },
      saved() {
        return this.openTabName == '__settings__' ? false : this.$store.state.openItems[this.openTabName].saved
      },
      itemTypeLabel: function() {
          return utils.decodeKebobCase(this.itemType)
      },
      itemName: function() {
          return this.openTabName == '__settings__' ? '' : utils.decodeItemKey(this.openTabName).name
      },
      itemType: function() {
          return this.openTabName == '__settings__' ? '' : utils.decodeItemKey(this.openTabName).type
      },
      hasPdf() {
        if(this.openTabName == '__settings__') { return false }
        return this.itemType == 'paper' && this.$store.state.pdfFiles[`${this.itemName}.pdf`]
      },



      snackbarOpen: {
        get() {
          return this.$store.state.snackbarOpen
        },
        set(value) {
          if(!value) {
            this.$store.commit('closeSnackbar'); 
          }
        }
      },
      snackbarMessage() {
        return this.$store.state.snackbarMessage
      },
      dialogOpen: {
        get() {
          return this.$store.state.dialogOpen
        },
        set(value) {
          if(!value) {
            this.$store.commit('closeDialog'); 
          }
        }
      },
      dialogMessage() {
        return this.$store.state.dialogMessage
      },
      dialogCallback() {
        return this.$store.state.dialogCallback
      },
      loading() {
        return this.$store.state.loading
      },
      loaded() {
        return this.$store.state.loaded
      },
      // openItems: function() {
      //   return Object.values(this.$store.state.openItems)
      // },
      tabs: function() {
        return this.$store.state.tabs
      },
      openTabIndex: {
        get() {
          return this.$store.getters.openTabIndex
        },
        set(index) {
          this.$store.commit('setOpenTabIndex', index); 
        }
      }
    }
  };
</script>


<style>
.add-button {
  display: flex; 
  align-items: center; 
  padding-right: 15px;
}

#app-inner {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: stretch;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.content-tabs {
  flex: 1;
}

.left-accordian {
  background-color: rgb(240, 240, 240);;
  width: 300px;
}

.v-expansion-panel-content__wrap {
  padding: 0 !important;
  height: calc(100vh - 193px);
}

.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 48px !important;
}



</style>