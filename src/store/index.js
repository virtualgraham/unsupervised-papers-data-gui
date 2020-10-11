import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid';

import { 
  readDir,
  // createDir,
  // removeDir,
  // removeFile,
  readTextFile,
  // writeFile
} from 'tauri/api/fs'
import * as matter from 'gray-matter';

async function readMarkdown(file) {
  try {
    const taskRaw = await readTextFile(file)
    return matter(taskRaw, {language: 'json'})
  } catch (e) {
    console.error("Unable to parse file", file, e)
  }
}

async function extractItemsFromDirFiles(dirFiles, type, area) {
    const items = []
    for(const f of dirFiles) {
      if(f.children) {
        items.push(...(await extractItemsFromDirFiles(f.children, type, area)))
      } else {
        if(f.name.endsWith('.md')) {
          const path = f.path.split('/')
          const name = f.name.slice(0, -3)
          const itemData = await readMarkdown(f.path)
          const item = {
            file: f.path,
            type,
            name,
            frontmatter: itemData.data,
            content: itemData.content
          }
          if(area) item['area'] = path[path.length - 3]
          items.push(item)
        }
      }
    }
    return items
}

async function readTasks(dataDir) {
  const tasksDirFiles = await readDir(`${dataDir}/tasks/`, {recursive: true})
  const extractedItems = await extractItemsFromDirFiles(tasksDirFiles, 'task', true)
  return extractedItems.reduce((acc, cur) => {acc[cur.name] = cur; return acc}, {})
}

async function readMethods(dataDir) {
  const methodsDirFiles = await readDir(`${dataDir}/methods/`, {recursive: true})
  const extractedItems = await extractItemsFromDirFiles(methodsDirFiles, 'method')
  return extractedItems.reduce((acc, cur) => {acc[cur.name] = cur; return acc}, {})
}

async function readCategories(dataDir) {
  const categoriesDirFiles = await readDir(`${dataDir}/categories/`, {recursive: true})
  const extractedItems = await extractItemsFromDirFiles(categoriesDirFiles, 'category', true)
  return extractedItems.reduce((acc, cur) => {acc[cur.name] = cur; return acc}, {})
}

async function readPapers(dataDir) {
  const papersDirFiles = await readDir(`${dataDir}/papers/`, {recursive: true})
  const extractedItems = await extractItemsFromDirFiles(papersDirFiles, 'paper')
  return extractedItems.reduce((acc, cur) => {acc[cur.name] = cur; return acc}, {})
}

function getAreas(items) {
  const areasSet = new Set(Object.values(items).map(item => {
    console.log('item', item)
    return item.frontmatter.area
  }))
  return [...areasSet]
}

Vue.use(Vuex)

const typeMap = {
  'task': 'tasks',
  'category': 'categories',
  'method': 'methods',
  'paper': 'papers',
}

export default new Vuex.Store({
  state: {
    dataDir: '',
    pdfDir: '',
    tasks: {},
    methods: {},
    methodAreas: [],
    taskAreas: [],
    categories: {},
    papers: {},
    loaded: false,
    openItems: {},
  },
  mutations: {
    removeItem(state, {type, name}) {
      Vue.delete(state.openItems, name)
      Vue.delete(state[typeMap[type]], name)
    },

    addItem(state, type) {
      const name = uuidv4()
      if(type == 'paper') {
        Vue.set(state.openItems, name, {
          file: null,
          type,
          name,
          frontmatter: {
            title: 'Untitled Paper',
            date: null,
            authors: [],
            abstract: null,
            links: [],
            supervision: [],
            tasks: [],
            methods: [],
            thumbnail: null,
            card: null,
            s2_paper_id: null
          },
          content: ''
        })
      } else if (type == 'method') {
        Vue.set(state.openItems, name, {
          file: null,
          type,
          name,
          frontmatter: {
            area: null,
            title: 'Untitled Method',
            year: null,
            categories: [],
            components: [],
            introduced_by: null,
            links: [],
            thumbnail: null,
            card: null
          },
          content: ''
        })
      } else if (type == 'category') {
        Vue.set(state.openItems, name, {
          file: null,
          type,
          name,
          frontmatter: {
            area: null,
            title: 'Untitled Category',
            thumbnail: null,
            card: null
          },
          content: ''
        })
      } else if (type == 'task') {
        Vue.set(state.openItems, name, {
          file: null,
          type,
          name,
          frontmatter: {
            area: null,
            title: 'Untitled Task',
            parent_task: null,
            links: [],
            thumbnail: null,
            card: null
          },
          content: ''
        })
      }
    },

    openItem (state, {type, name}) {
      if(state[type] && state[type][name]) {
        Vue.set(state.openItems, name, JSON.parse(JSON.stringify(state[type][name])))
      }
    },
    closeItem (state, name) {
      console.log('close item', name)
      Vue.delete(state.openItems, name)
    },
    setDataDir (state, value) {
      state.dataDir = value
    },
    setPdfDir (state, value) {
      state.pdfDir = value
    },
    setPapers (state, value) {
      state.papers = value
    },
    setCategories (state, value) {
      state.categories = value
    },
    setMethods (state, value) {
      state.methods = value
    },
    setTasks (state, value) {
      state.tasks = value
    },
    setMethodAreas (state, value) {
      state.methodAreas = value
    },
    setTaskAreas (state, value) {
      state.taskAreas = value
    },
    setLoaded (state, value) {
      state.loaded = value
    },
    setFrontmatterField (state, {name, field, value}) {
      if(state.openItems[name] && state.openItems[name].frontmatter) {
        console.log('setFrontmatterField', state.openItems[name].frontmatter, field, value, state.openItems[name].frontmatter[field])
        Vue.set(state.openItems[name].frontmatter, field, value)
      } else {
        console.error('unable to set frontmatter field', {name, field, value})
      }
    },
    setContent (state, {name, value}) {
      if(state.openItems[name]) {
        Vue.set(state.openItems[name], 'content', value)
      } else {
        console.error('unable to set content', {name, value})
      }
    }
  },
  actions: {
    async openPdf ({ commit, state }, name) {
      console.log("open PDF", name)
    },
    async removeItem ({ commit, state }, name) {
      const type = state.openItems[name].type
      commit('removeItem', {type, name})
    },
    async saveItem ({ commit, state }, name) {
      console.log("save item", name)
    },

    async loadData ({ commit, state }) {
      const tasks = await readTasks(state.dataDir)
      const methods = await readMethods(state.dataDir)
      const categories = await readCategories(state.dataDir)
      const papers = await readPapers(state.dataDir)

      commit('setTasks', tasks)
      commit('setMethods', methods)
      commit('setCategories', categories) 
      commit('setPapers', papers)

      const taskAreas = getAreas(tasks)
      const methodAreas = getAreas(categories)

      commit('setMethodAreas', methodAreas)
      commit('setTaskAreas', taskAreas)

      commit('setLoaded', true)

      console.log({
        tasks,
        taskAreas,
        methods,
        categories,
        methodAreas,
        papers
      })
    }
  },
  modules: {
  }
})
