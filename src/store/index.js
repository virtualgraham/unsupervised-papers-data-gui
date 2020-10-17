import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid';

import { 
  readDir,
  createDir,
  removeDir,
  removeFile,
  readTextFile,
  writeFile,
  copyFile
} from 'tauri/api/fs'
import { execute } from 'tauri/api/process'
import * as matter from 'gray-matter';

async function readMarkdown(file) {
  try {
    // ---------------------------------- //
    const taskRaw = await readTextFile(file)
    // ---------------------------------- //
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

function getDir(item, dataDir) {
  if(item.type == 'task') {
    return `${dataDir}/tasks/${item.frontmatter.area}/${item.name}`
  } else if (item.type == 'method') {
    return `${dataDir}/methods/${item.name}`
  } else if (item.type == 'category') {
    return `${dataDir}/categories/${item.frontmatter.area}/${item.name}`
  } else if (item.type == 'paper') {
    return `${dataDir}/papers/${item.name}`
  } else {
    throw "getDir() error: invalid item type"
  }
}

async function moveAccompanyingFiles(from, to) {
  const fromFiles = await readDir(from)
  // TODO: only filter out the md file with the same name as the folder
  const mvFiles = fromFiles.filter(f => !f.name.endsWith('.md')).map(f => f.name);
  for(const f of mvFiles) {
    console.log('copyFile', `${from}/${f}`, `${to}/${f}`)
    await copyFile(`${from}/${f}`, `${to}/${f}`)
  }
}

async function removeItemFiles(dir) {
  const files = await readDir(dir)
  for(const f of files) {
    console.log('removeFile', f.path)
    await removeFile(f.path)
  }
  console.log('removeDir', dir)
  await removeDir(dir)
}

async function writeItem(item, dataDir) {
 
  let dir = getDir(item, dataDir);

  console.log('createDir', dir)
  await createDir(dir, {recursive: true})

  const raw = matter.stringify(item.content, item.frontmatter, {language: 'json'})

  console.log('writeFile', `${dir}/${item.name}.md`)
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

console.log('dataDir', localStorage.getItem('dataDir'))
console.log('pdfDir', localStorage.getItem('pdfDir'))

export default new Vuex.Store({
  state: {
    dataDir: localStorage.getItem('dataDir'),
    pdfDir: localStorage.getItem('pdfDir'),
    pdfFiles: {},
    tasks: {},
    methods: {},
    categories: {},
    papers: {},
    loaded: false,
    openItems: {},

    snackbarOpen: false,
    snackbarMessage: '',
    dialogOpen: false,
    dialogMessage: '',
    dialogCallback: null,
    loading: false

  },
  getters: {
    methodAreas: state => {
      return [... new Set([
        ...Object.values(state.methods).map(item => {
          return item.frontmatter.area
        }), 
        ...Object.values(state.categories).map(item => {
          return item.frontmatter.area
        })
      ])]
    },
    taskAreas: state => {
      return [...new Set(Object.values(state.tasks).map(item => {
        return item.frontmatter.area
      }))]
    }
  },
  mutations: {
    insertSavedItem(state, item) {
      Vue.set(state[typeMap[item.type]], item.name, item)
    },

    insertOpenItem(state, item) {
      const copy = JSON.parse(JSON.stringify(item))
      copy.saved = true
      Vue.set(state.openItems, copy.name, copy)
    },

    removeItem(state, {name, type}) {
      Vue.delete(state.openItems, name)
      Vue.delete(state[typeMap[type]], name)
    },

    addItem(state, type) {
      const name = uuidv4()
      if(type == 'paper') {
        Vue.set(state.openItems, name, {
          saved: false,
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
          saved: false,
          file: null,
          type,
          name,
          frontmatter: {
            area: null,
            title: 'Untitled Method',
            also_known_as: [],
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
          saved: false,
          file: null,
          type,
          name,
          frontmatter: {
            area: null,
            title: 'Untitled Category',
            also_known_as: [],
            thumbnail: null,
            card: null
          },
          content: ''
        })
      } else if (type == 'task') {
        Vue.set(state.openItems, name, {
          saved: false,
          file: null,
          type,
          name,
          frontmatter: {
            area: null,
            title: 'Untitled Task',
            also_known_as: [],
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
        const copy = JSON.parse(JSON.stringify(state[type][name]))
        copy.saved = true
        Vue.set(state.openItems, name, copy)
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

    setLoading (state, value) {
      state.loading = value
    },

    closeItem (state, name) {
      Vue.delete(state.openItems, name)
    },
    setPdfFiles (state, value) {
      state.pdfFiles = value
    },
    setDataDir (state, value) {
      console.log('setDataDir', value)
      localStorage.setItem('dataDir', value),
      state.dataDir = value
    },
    setPdfDir (state, value) {
      console.log('setPdfFiles', value)
      localStorage.setItem('pdfDir', value),
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
    setLoaded (state, value) {
      state.loaded = value
    },
    setFrontmatterField (state, {name, field, value}) {
      console.log('setFrontmatterField', {name, field, value})
      if(state.openItems[name] && state.openItems[name].frontmatter) {
        Vue.set(state.openItems[name].frontmatter, field, value)
        Vue.set(state.openItems[name], 'saved', false)
      } else {
        console.error('unable to set frontmatter field', {name, field, value})
      }
    },
    setContent (state, {name, value}) {
      if(state.openItems[name]) {
        Vue.set(state.openItems[name], 'content', value)
        Vue.set(state.openItems[name], 'saved', false)
      } else {
        console.error('unable to set content', {name, value})
      }
    },
    setSaved (state, {name, value}) {
      if(state.openItems[name]) {
        Vue.set(state.openItems[name], 'saved', value)
      } else {
        console.error('unable to set saved on item', {name, value})
      }
    }
  },
  actions: {

    async openPdf ({ commit, state }, name) {
      if (!state.pdfDir) return
      await execute('open', `${state.pdfDir}/${name}.pdf`)
    },

    async removeItem ({ commit, state }, name) {
      console.log('removeItem action', name)
      const type = state.openItems[name].type
      const oldItem = state[typeMap[type]][name]
      commit('removeItem', {type, name})
      await removeItemFiles(getDir(oldItem, state.dataDir))
    },

    async saveItem ({ commit, state }, {name, close}) {

      const item = JSON.parse(JSON.stringify(state.openItems[name]))   
      delete item.saved

      const oldItem = state[typeMap[item.type]][name]

      // TODO: check duplicate and invalid names

      let move = false

      if(oldItem && oldItem.frontmatter.area != item.frontmatter.area && (item.type == 'category' || item.type == 'task')) {
        console.log('need to move files - area changed')
        move = true
      }

      if(encodeKebobCase(item.frontmatter.title) != name) {

        if(item.file) {
          console.log('need to move files - item renamed')
          move = true
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

      if(move) {
        await moveAccompanyingFiles(getDir(oldItem, state.dataDir), getDir(item, state.dataDir))
        await removeItemFiles(getDir(oldItem, state.dataDir))
      }

      if(!close) {
        commit('setSaved', {name: item.name , value: true})
      }
      commit('openSnackbar', "Item Saved");
    },

    async loadData ({ commit, state }) {
      try {

        commit('setLoading', true)

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

        commit('setLoaded', true)

        commit('setLoading', false)

        commit('openSnackbar', "Data Loaded");

      } catch (e) {

        console.error('error loading data', e)
        commit('setLoading', false)
        commit('openSnackbar', "Error Loading Data");

      }
    }
  },
  modules: {
  }
})
