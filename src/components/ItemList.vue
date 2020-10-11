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
            height="calc(100vh - 242px)"
            item-height="45"
            :items="items"
        >
            <template v-slot="{ item }">
                <v-list-item :key="item.name" @click="openItem(item.name)">
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ item.title }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
            </template>
        </v-virtual-scroll>
    </div>
</template>


<script>

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
            console.log('openItem', {type: this.itemType, name: name})
            this.$store.commit('openItem', {type: this.itemType, name: name}); 
        }
    },
    computed: {
        items: function() {
            const self = this
            return Object.values(this.$store.state[this.itemType]).reduce(function(filtered, item) {
                if (!self.filter || self.filter.length == 0 || item.frontmatter.title.toLowerCase().includes(self.filter.toLowerCase())) {
                filtered.push({ 
                    name: item.name, 
                    title: item.frontmatter.title, 
                });
                }
                return filtered;
            }, []);
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
