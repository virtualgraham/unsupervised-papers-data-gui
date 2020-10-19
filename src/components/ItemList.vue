<template>
    <div>
        <div class="px-4 pb-2">
            <v-text-field
                v-model="filter"
                hide-details="auto"
                label="Filter"
                outlined
                dense
                clearable
                prepend-inner-icon="mdi-filter-outline"
            ></v-text-field>
        </div>
        <v-virtual-scroll
            ref="vscroll"
            height="calc(100vh - 242px)"
            item-height="45"
            :items="items"
        >
            <template v-slot="{ item }">
                <v-list-item :key="item.name" @click="openItem(item.name)">
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ item.paperLabelsIcon }}{{ item.title }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
            </template>
        </v-virtual-scroll>
    </div>
</template>


<script>

const typeMap = {
  'task': 'tasks',
  'category': 'categories',
  'method': 'methods',
  'paper': 'papers',
}

export default {
    name: 'ItemList',
    components: {
    },
    props: {
        itemType: String
    },
    data() {
      return {
        filter: ''
      }
    },
    methods: {
        openItem(name) {
            console.log('openItem', name, {type: this.itemType, name: name})
            this.$store.commit('openItem', {type: this.itemType, name: name}); 
        },
        opened() {
            const self = this
            setTimeout(function () {
                self.$refs.vscroll.onScroll()
            }, 200)
        },
        paperLabelsIcon(item) {
            // console.log('paperLabelsIcon', this.itemType, item)
            if(this.itemType == 'paper') {
                let count = 0

                if(item.frontmatter.supervision && item.frontmatter.supervision.length> 0) {
                    count += 1
                } 
                
                if(item.frontmatter.tasks && item.frontmatter.tasks.length> 0) {
                    count += 1
                } 

                if(item.frontmatter.methods && item.frontmatter.methods.length> 0) {
                    count += 1
                }

                return count == 3 ? '☑ ' : '☐ '
            }

            return ''
        },
    },
    watch: {
        items() {
            this.$refs.vscroll.onScroll()
        }
    },
    computed: {
        items: function() {
            const self = this
            const items = Object.values(this.$store.state[typeMap[this.itemType]]).reduce(function(filtered, item) {
                if (!self.filter || self.filter.length == 0 || item.frontmatter.title.toLowerCase().includes(self.filter.toLowerCase())) {
                    filtered.push({ 
                        name: item.name, 
                        title: item.frontmatter.title, 
                        paperLabelsIcon: self.paperLabelsIcon(item)
                    });
                }
                return filtered;
            }, []);
            items.sort((a, b) => (a.title > b.title) ? 1 : -1)
            return items
        }
    }
}
</script>


<style scoped>
    .item-list-container {
    height: 100%;
    }

    .item-count {
    background-color: #f0f0f0;
    height: 25px;
    }

    .item-search {
    background-color: #f0f0f0;
    height: 45px;
    }

    .item-list {
    overflow: auto;
    height: calc(100% - 70px)
    }
</style>
