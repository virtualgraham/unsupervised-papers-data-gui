<template>
  <v-app>
    <div id="app-inner">
    <div class="left-accordian">
      <v-expansion-panels accordion class="pa-0">
        <v-expansion-panel class="pa-0">
          <v-expansion-panel-header class="pa-0">
            Tasks
          </v-expansion-panel-header>
          <v-expansion-panel-content class="pa-0">
            <ItemList itemType="tasks" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            Methods
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <ItemList itemType="methods" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            Categories
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <ItemList itemType="categories" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            Papers
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
      // papers: function() {
      //   const self = this
      //   return Object.values(this.$store.state.papers).reduce(function(filtered, item) {
      //     if (self.paperFilter.length == 0 || item.frontmatter.title.toLowerCase().includes(self.paperFilter.toLowerCase())) {
      //       filtered.push({ 
      //         name: item.name, 
      //         title: item.frontmatter.title, 
      //       });
      //     }
      //     return filtered;
      //   }, []);
      // },
      // paperCount: function() {
      //   return this.papers.length
      // },
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
  height: calc(100vh - 210px);
}

.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 48px !important;
}

</style>