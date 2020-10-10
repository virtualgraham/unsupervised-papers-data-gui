import Vue from 'vue'
import Vuex from 'vuex'

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
        items.push(...(await extractItemsFromDirFiles(f.children, area)))
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
    openItem (state, {type, name}) {
      if(state[type] && state[type][name]) {
        Vue.set(state.openItems, name, JSON.parse(JSON.stringify(state[type][name])))
      }
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
        Vue.set(state.openItems[name].frontmatter, field, value)
      } else {
        console.error('unable to set frontmatter field', {type, name, field, value})
      }
    }
  },
  actions: {
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
