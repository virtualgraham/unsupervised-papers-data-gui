<template>
  <v-app>
    <div id="app-inner">
    <div class="left-accordian">
      <v-expansion-panels accordion>
        <v-expansion-panel>
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
            <ItemList itemType="tasks" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
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
            <ItemList itemType="methods" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
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
            <ItemList itemType="categories" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
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
            <ItemList itemType="papers" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <div class="content-tabs">
      <v-card>
        <v-tabs
          v-model="tab"
          center-active
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab
            v-for="tab in tabs"
            :key="tab.name"
          >
            <span v-if="tab.name != '__settings__'">{{ tab.frontmatter.title }}</span>
            <v-icon v-if="tab.name == '__settings__'">mdi-cog-outline</v-icon>
          </v-tab>
        </v-tabs>
      </v-card>
      <v-tabs-items v-model="tab">
        <v-tab-item
          key="__settings__"
        >
          <v-card flat>
            <Settings/>
          </v-card>
        </v-tab-item>

        <v-tab-item
          v-for="tab in openItems"
          :key="tab.name"
        >
          <v-card flat>
            <ItemEditor :name="tab.name" />
          </v-card>
        </v-tab-item>
      </v-tabs-items>

    </div>
    </div>
  </v-app>
</template>

<script>
  import Settings from './components/Settings.vue'
  import ItemList from './components/ItemList.vue'
  import ItemEditor from './components/ItemEditor.vue'

  export default {
    name: "app",
    components: {
      Settings,
      ItemList,
      ItemEditor
    },
    data() {
      return {
        tab: null,
        paperFilter: '',
      }
    },
    methods: {
      addTask(e) {
        e.stopPropagation()
      },
      addMethod(e) {
        e.stopPropagation()
      },
      addCategory(e) {
        e.stopPropagation()
      },
      addPaper(e) {
        e.stopPropagation()
      },
      truncate(str, n){
        return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
      }
    },
    watch: {
      openItems (val) {
        console.log('watch openItems')
        this.tab = val.length
      },
      tab (val) {
        console.log('tab', val)
      },
    },
    computed: {
      loaded() {
        return this.$store.state.loaded
      },
      openItems: function() {
        return Object.values(this.$store.state.openItems)
      },
      tabs: function() {
        return [{name: '__settings__', frontmatter: {title: "Settings"}}, ...Object.values(this.$store.state.openItems)]
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