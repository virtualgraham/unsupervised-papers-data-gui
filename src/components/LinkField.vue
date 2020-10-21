<template>
  <v-sheet height="185" outlined class="d-flex flex-column px-4 pt-6 pb-2">
    <div class="d-flex">
      <div class="mr-4" style="width: 180px">
        <v-select
          :items="icons"
          label="Icon"
          dense
          v-model="icon" 
          @input="update"
        ></v-select>
      </div>
      <div class="mr-4" style="width: 220px">
        <v-text-field 
          label="Resource" 
          dense
          v-model="resource" 
          @input="update"
        ></v-text-field>
      </div>
      <div class="flex-grow-1">
        <v-text-field 
          label="Title" 
          dense
          v-model="title" 
          @input="update"
        ></v-text-field>
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
        label="URL" 
        dense 
        v-model="url"
        @input="update"
      ></v-text-field>
      <div class="flex-grow-0">
        <v-btn
          icon
          color="blue"
          @click="down"
        >
          <v-icon>mdi-arrow-down</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex">
      <v-text-field
        label="Description" 
        dense 
        v-model="description"
        @input="update"
      ></v-text-field>
      <div class="flex-grow-0">
        <v-btn
          icon
          color="red"
          @click="remove"
        >
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script>
export default {
  props: ["value", "index"],

  data() {
    return {
      title: this.value.title,
      resource: this.value.resource,
      description: this.value.description,
      icon: this.value.icon,
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
          resource: this.resource,
          description: this.description,
          icon: this.icon,
          url: this.url,
        }
      );
    },
  },

  computed: {
    icons() {
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

