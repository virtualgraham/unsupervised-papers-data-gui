import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid';

import { 
  readDir,
  createDir,
  // removeDir,
  // removeFile,
  readTextFile,
  writeFile
} from 'tauri/api/fs'
import { execute } from 'tauri/api/process'
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

async function readPdfs(pdfDir) {
  const pdfFiles = await readDir(pdfDir)
  return pdfFiles.reduce((acc, cur) => {
    if( cur.name.endsWith('.pdf')) {
      acc[cur.name] = true; 
    }
    return acc
  }, {})
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
    return item.frontmatter.area
  }))
  return [...areasSet]
}

async function writeItem(item, dataDir) {
 
  let dir;

  if(item.type == 'task') {
    dir = `${dataDir}/tasks/${item.frontmatter.area}/${item.name}`
  } else if (item.type == 'method') {
    dir = `${dataDir}/methods/${item.name}`
  } else if (item.type == 'category') {
    dir = `${dataDir}/categories/${item.frontmatter.area}/${item.name}`
  } else if (item.type == 'paper') {
    dir = `${dataDir}/papers/${item.name}`
  } else {
    throw "WRITE ERROR: invalid item type"
  }

  console.log('writeItem', `${dir}/${item.name}.md`)

  await createDir(dir, {recursive: true})

  const raw = matter.stringify(item.content, item.frontmatter, {language: 'json'})

  await writeFile({path: `${dir}/${item.name}.md`, contents: raw})
}

Vue.use(Vuex)

const typeMap = {
  'task': 'tasks',
  'category': 'categories',
  'method': 'methods',
  'paper': 'papers',
}

function encodeKebobCase(str) {
  return str.replace(/[^0-9a-zA-Z]+/g, ' ').trim().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[-\s]+/g, '-').toLowerCase()
}

export default new Vuex.Store({
  state: {
    dataDir: null,
    pdfDir: null,
    pdfFiles: {},
    tasks: {},
    methods: {},
    methodAreas: [],
    taskAreas: [],
    categories: {},
    papers: {},
    loaded: false,
    openItems: {},

    snackbarOpen: false,
    snackbarMessage: '',
    dialogOpen: false,
    dialogMessage: '',
    dialogCallback: null

  },
  mutations: {
    insertSavedItem(state, item) {
      Vue.set(state[typeMap[item.type]], item.name, item)
    },

    insertOpenItem(state, item) {
      Vue.set(state.openItems, item.name, JSON.parse(JSON.stringify(item)))
    },

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

    openSnackbar(state, message) {
      state.snackbarOpen = true
      state.snackbarMessage = message
    },

    closeSnackbar(state) {
      state.snackbarOpen = false
      state.snackbarMessage = ''
    },

    openDialog (state, {message, callback}) {
      state.dialogOpen = true
      state.dialogMessage = message
      state.dialogCallback = callback
    },

    closeDialog (state) {
      state.dialogOpen = false
      state.dialogMessage = ''
      state.dialogCallback = null
    },

    closeItem (state, name) {
      Vue.delete(state.openItems, name)
    },
    setPdfFiles (state, value) {
      state.pdfFiles = value
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
      console.log('setFrontmatterField', {name, field, value})
      if(state.openItems[name] && state.openItems[name].frontmatter) {
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
      if (!state.pdfDir) return
      await execute('open', `${state.pdfDir}/${name}.pdf`)
    },

    async removeItem ({ commit, state }, name) {
      const type = state.openItems[name].type
      commit('removeItem', {type, name})


    },

    async saveItem ({ commit, state }, {name, close}) {

      const item = JSON.parse(JSON.stringify(state.openItems[name]))   

      const oldItem = state[typeMap[item.type]][name]

      // TODO: check duplicate and invalid names

      if(oldItem && oldItem.frontmatter.area != item.frontmatter.area) {
        console.log('need to move files - area changed')
      }

      if(encodeKebobCase(item.frontmatter.title) != name) {

        if(item.file) {
          console.log('need to move files - item renamed')
        }
        
        item.name = encodeKebobCase(item.frontmatter.title)
        
        commit('removeItem', {type: item.type, name})

        if(!close) {
          commit('insertOpenItem', item)
        }

      } else if (close) {
        commit('closeItem', name)
      }

      await writeItem(item, state.dataDir)

      commit('insertSavedItem', item)

    },

    async loadData ({ commit, state }) {

      if(state.pdfDir) {
        const pdfFiles = await readPdfs(state.pdfDir)
        commit('setPdfFiles', pdfFiles)
      }

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
    }
  },
  modules: {
  }
})
