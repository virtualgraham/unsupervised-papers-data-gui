<template>
  <v-sheet height="130" outlined class="d-flex flex-column px-4 pt-6 pb-2">
    <div class="d-flex">
      <div class="mr-4 flex-grow-1">
        <v-text-field 
          ref="titleField"
          label="Title" 
          dense
          v-model="title" 
          @input="update"
        ></v-text-field>
      </div>
      <div class="mr-4" style="width: 200px">
        <v-select
          ref="typeField"
          :items="types"
          label="Type"
          dense
          v-model="type" 
          @input="update"
        ></v-select>

      </div>
      <div class="flex-grow-0">
        <v-btn
          icon
          color="red"
          @click="remove"
        >
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </div>
      <div class="flex-grow-0">
        <v-btn
          icon
          color="blue"
          @click="down"
        >
          <v-icon>mdi-arrow-down</v-icon>
        </v-btn>
      </div>
      <div class="flex-grow-0">
        <v-btn
          icon
          color="blue"
          @click="up"
        >
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex">
      <v-text-field
        ref="urlField" 
        label="URL" 
        dense 
        v-model="url"
        @input="update"
      ></v-text-field>
    </div>
  </v-sheet>
</template>

<script>
export default {
  props: ["value", "index"],

  data() {
    return {
      title: this.value.title,
      type: this.value.type,
      url: this.value.url
    }
  },

  created() {

  },

  methods: {
    remove() {
      this.$emit("remove", {
        index: this.index
      })
    },
    up() {
      this.$emit("up", {
        index: this.index
      })
    },
    down() {
      this.$emit("down", {
        index: this.index
      })
    },
    update(e) {
      this.$emit("input", 
        {
          title: this.title,
          type: this.type,
          url: this.url,
        }
      );
    },
  },

  computed: {
    types() {
      return [
        {
          text: 'PDF',
          value: 'pdf'
        },
        {
          text: 'Wikipedia',
          value: 'wikipedia'
        },
        {
          text: 'YouTube',
          value: 'youtube'
        },
        {
          text: 'GitHub',
          value: 'github'
        },
        {
          text: 'arXiv.org',
          value: 'arxiv'
        },
        {
          text: 'Semantic Scholar',
          value: 'semanticscholar'
        },
        {
          text: 'Papers with Code',
          value: 'paperswithcode'
        },
        {
          text: 'Website',
          value: 'website'
        },
      ]
    }
  }
};
</script>

