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
            item-height="32"
            :items="items"
        >
            <template v-slot="{ item }">         
                <v-tooltip bottom open-delay="500">
                    <template v-slot:activator="{ on, attrs }">
                        <v-list-item 
                            :key="item.name" 
                            @click="openItem(item.name)" 
                            style="min-height:32px" 
                            v-bind="attrs"
                            v-on="on"
                        >
                            <v-list-item-content class="py-0">
                                <v-list-item-title style="text-align: left">
                                    <span 
                                        :class="item.complete ? '' : 'incompleteColor'"
                                        style="font-size: 14px"
                                    >{{ item.title }}</span>
                            </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        </template>
                        <span>{{ item.title }}</span>
                </v-tooltip>
                <v-divider></v-divider>
            </template>
        </v-virtual-scroll>
    </div>
</template>


<script>
import utils from '../utils';

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
        isComplete(item) {
            if(this.itemType == 'paper') {
                return (item.frontmatter.supervision && item.frontmatter.supervision.length> 0) &&
                    (item.frontmatter.tasks && item.frontmatter.tasks.length> 0) &&
                    (item.frontmatter.methods && item.frontmatter.methods.length> 0)
            }

            if(this.itemType == 'task') {
                return (item.frontmatter.parent_task) &&
                    (item.frontmatter.links && item.frontmatter.links.length> 0)
            }

            if(this.itemType == 'method') {
                return (item.frontmatter.categories && item.frontmatter.categories.length> 0) &&
                    (item.frontmatter.links && item.frontmatter.links.length> 0)
            }

            if(this.itemType == 'category') {
                return (item.frontmatter.thumbnail) && (item.frontmatter.card)
            }

            return false
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
            const items = Object.values(this.$store.state[utils.typeMap[this.itemType]]).reduce(function(filtered, item) {
                if (!self.filter || self.filter.length == 0 || item.frontmatter.title.toLowerCase().includes(self.filter.toLowerCase())) {
                    filtered.push({ 
                        name: item.name, 
                        title: item.frontmatter.title, 
                        complete: self.isComplete(item)
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
    .incompleteColor {
        color:rgb(0,0,193);
    }

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
