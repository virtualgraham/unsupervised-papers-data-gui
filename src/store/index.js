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
import utils from '../utils';

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

function removeFromList(arr, value) {
  for(let i=(arr.length-1); i>=0; i--) {
    if(arr[i] == value) {
      arr.splice(i, 1);
    }
  }
}

function replace(arr, oldVal, newVal) {
  arr.forEach((element, index) => {
    if(element === oldVal) {
      arr[index] = newVal;
    }
  });
}

function replaceVueSet(arr, oldVal, newVal) {
  arr.forEach((element, index) => {
    if(element === oldVal) {
      Vue.set(arr, index, newVal)
    }
  });
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
    openTabName: '__settings__',
    tabs: ['__settings__'],
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
    },
    openTabIndex: state => {
      return state.tabs.indexOf(state.openTabName)
    }
  },
  mutations: {
    setOpenTabIndex(state, index) {
      console.log('setOpenTabIndex', index)
      state.openTabName = index == null ? state.tabs[0] : state.tabs[index]
    },

    insertSavedItem(state, item) {
      Vue.set(state[typeMap[item.type]], item.name, item)
    },

    insertOpenItem(state, {item, tab}) {
      const copy = JSON.parse(JSON.stringify(item))
      copy.saved = true

      const itemKey = utils.itemKey(copy.name, copy.type)

      if(!Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) { state.tabs.splice(tab, 0, itemKey) }
      state.openTabName = itemKey
      Vue.set(state.openItems, itemKey, copy)
    },

    removeItem(state, {name, type}) {
      const itemKey = utils.itemKey(name, type)

      state.openTabName = state.tabs.indexOf(itemKey) == (state.tabs.length - 1) ? state.tabs[state.tabs.length - 2] : state.tabs[state.tabs.length - 1]
      if(Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) { state.tabs.splice(state.tabs.indexOf(itemKey), 1) }
      console.log('removeItem', state.openTabName)
      Vue.delete(state.openItems, itemKey)
      Vue.delete(state[typeMap[type]], name)
    },

    addItem(state, type) {
      const name = uuidv4()
      const itemKey = utils.itemKey(name, type)

      if(type == 'paper') {
        Vue.set(state.openItems, itemKey, {
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
        Vue.set(state.openItems, itemKey, {
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
        Vue.set(state.openItems, itemKey, {
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
        Vue.set(state.openItems, itemKey, {
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

      state.tabs.push(itemKey)
      state.openTabName = itemKey
    },

    openItem (state, {type, name}) {
      if(state[type] && state[type][name]) {
        const copy = JSON.parse(JSON.stringify(state[type][name]))
        copy.saved = true
        const itemKey = utils.itemKey(name, type)
        if(!Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) { state.tabs.push(itemKey) }
        state.openTabName = itemKey
        Vue.set(state.openItems, itemKey, copy)
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

    closeItem (state, itemKey) {     
      state.openTabName = state.tabs.indexOf(itemKey) == (state.tabs.length - 1) ? state.tabs[state.tabs.length - 2] : state.tabs[state.tabs.length - 1]
      console.log('closeItem state.openTabName', state.openTabName)
      if(Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) { state.tabs.splice(state.tabs.indexOf(itemKey), 1) }
      Vue.delete(state.openItems, itemKey)
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
    setFrontmatterField (state, {itemKey, field, value}) {
      //const {name, type} = utils.decodeItemKey(itemKey)
      console.log('setFrontmatterField', {itemKey, field, value})
      if(state.openItems[itemKey] && state.openItems[itemKey].frontmatter) {
        Vue.set(state.openItems[itemKey].frontmatter, field, value)
        Vue.set(state.openItems[itemKey], 'saved', false)
      } else {
        console.error('unable to set frontmatter field', {itemKey, field, value})
      }
    },
    setContent (state, {itemKey, value}) {
      //const {name, type} = utils.decodeItemKey(itemKey)
      if(state.openItems[itemKey]) {
        Vue.set(state.openItems[itemKey], 'content', value)
        Vue.set(state.openItems[itemKey], 'saved', false)
      } else {
        console.error('unable to set content', {itemKey, value})
      }
    },
    setSaved (state, {itemKey, value}) {
      //const {name, type} = utils.decodeItemKey(itemKey)
      if(state.openItems[itemKey]) {
        Vue.set(state.openItems[itemKey], 'saved', value)
      } else {
        console.error('unable to set saved on item', {itemKey, value})
      }
    }
  },
  actions: {

    async openPdf ({ commit, state }, name) {
      if (!state.pdfDir) return
      await execute('open', `${state.pdfDir}/${name}.pdf`)
    },

    async removeItem ({ commit, dispatch, state }, {type, name}) {
      console.log('removeItem action', name)

      const oldItem = state[typeMap[type]][name]
      commit('removeItem', {type, name})
      await removeItemFiles(getDir(oldItem, state.dataDir))
      await dispatch('removeReferences', {name, type})
    },

    async removeReferences ({ commit, state }, {name, type}) {

      if (type == 'task' || type == 'method') {
        for (const item of Object.values(state.papers)) {
          const itemKey = utils.itemKey(item.name, 'paper')

          let copy;

          if (type == 'task' && item.frontmatter.tasks.includes(name)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            copy.frontmatter.tasks.splice()
            removeFromList(copy.frontmatter.tasks, name)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              removeFromList(state.openItems[itemKey].frontmatter.tasks, name)
            }
          }

          if (type == 'method' && item.frontmatter.methods.includes(name)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            removeFromList(copy.frontmatter.methods, name)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              removeFromList(state.openItems[itemKey].frontmatter.methods, name)
            }
          }

          if(copy) {
            await writeItem(copy, state.dataDir)
            commit('insertSavedItem', copy)
          }
        }
      }

      if (type == 'category' || type == 'method' || type == 'paper') {
        for (const item of Object.values(state.methods)) {
          const itemKey = utils.itemKey(item.name, 'method')

          let copy;

          if (type == 'category' && item.frontmatter.categories.includes(name)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            removeFromList(copy.frontmatter.categories, name)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              removeFromList(state.openItems[itemKey].frontmatter.categories, name)
            }
          }

          if (type == 'method' && item.frontmatter.components.includes(name)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            removeFromList(copy.frontmatter.components, name)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              removeFromList(state.openItems[itemKey].frontmatter.components, name)
            }
          }

          if(type == 'paper' && item.frontmatter.introduced_by == name) {
            if(!copy) { copy =JSON.parse(JSON.stringify(item)) }
            copy.frontmatter.introduced_by = null
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              Vue.set(state.openItems[itemKey].frontmatter, 'introduced_by', null)
            }
          }

          if(copy) {
            await writeItem(copy, state.dataDir)
            commit('insertSavedItem', copy)
          }
        }
      }

      if (type == 'task') {
        for (const item of Object.values(state.tasks)) {
          const itemKey = utils.itemKey(item.name, 'task')

          let copy;

          if(type == 'task' && item.frontmatter.parent_task == name) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            copy.frontmatter.parent_task = null
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              Vue.set(state.openItems[itemKey].frontmatter, 'parent_task', null)
            }
          }

          if(copy) {
            await writeItem(copy, state.dataDir)
            commit('insertSavedItem', copy)
          }

        }
      }
    },

    async updateReferences ({ commit, state }, {oldName, newName, type}) {

      if (type == 'task' || type == 'method') {
        for (const item of Object.values(state.papers)) {
          const itemKey = utils.itemKey(item.name, 'paper')

          let copy;

          if (type == 'task' && item.frontmatter.tasks.includes(oldName)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            replace(copy.frontmatter.tasks, oldName, newName)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              replaceVueSet(state.openItems[itemKey].frontmatter.tasks, oldName, newName)
            }
          }

          if (type == 'method' && item.frontmatter.methods.includes(oldName)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            replace(copy.frontmatter.methods, oldName, newName)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              replaceVueSet(state.openItems[itemKey].frontmatter.methods, oldName, newName)
            }
          }

          if(copy) {
            await writeItem(copy, state.dataDir)
            commit('insertSavedItem', copy)
          }
        }
      }

      if (type == 'category' || type == 'method' || type == 'paper') {
        for (const item of Object.values(state.methods)) {
          const itemKey = utils.itemKey(item.name, 'method')

          let copy;

          if (type == 'category' && item.frontmatter.categories.includes(oldName)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            replace(copy.frontmatter.categories, oldName, newName)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              replaceVueSet(state.openItems[itemKey].frontmatter.categories, oldName, newName)
            }
          }

          if (type == 'method' && item.frontmatter.components.includes(oldName)) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            replace(copy.frontmatter.components, oldName, newName)
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              replaceVueSet(state.openItems[itemKey].frontmatter.components, oldName, newName)
            }
          }

          if(type == 'paper' && item.frontmatter.introduced_by == oldName) {
            if(!copy) { copy =JSON.parse(JSON.stringify(item)) }
            copy.frontmatter.introduced_by = newName
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              Vue.set(state.openItems[itemKey].frontmatter, 'introduced_by', newName)
            }
          }

          if(copy) {
            await writeItem(copy, state.dataDir)
            commit('insertSavedItem', copy)
          }
        }
      }

      if (type == 'task') {
        for (const item of Object.values(state.tasks)) {
          const itemKey = utils.itemKey(item.name, 'method')

          let copy;

          if(type == 'task' && item.frontmatter.parent_task == oldName) {
            if(!copy) { copy = JSON.parse(JSON.stringify(item)) }
            copy.frontmatter.parent_task = newName
            if (Object.prototype.hasOwnProperty.call(state.openItems, itemKey)) {
              Vue.set(state.openItems[itemKey].frontmatter, 'parent_task', newName)
            }
          }

          if(copy) {
            await writeItem(copy, state.dataDir)
            commit('insertSavedItem', copy)
          }
        }
      }
    },

    async saveItem ({ commit, dispatch, state }, {name, type, close}) {

      const itemKey = utils.itemKey(name, type)

      const item = JSON.parse(JSON.stringify(state.openItems[itemKey]))   
      delete item.saved

      const oldItem = state[typeMap[type]][name]

      // TODO: check duplicate and invalid names

      let move = false
      let renamed = false
      if(oldItem && oldItem.frontmatter.area != item.frontmatter.area && (type == 'category' || type == 'task')) {
        console.log('need to move files - area changed')
        move = true
      }

      if(encodeKebobCase(item.frontmatter.title) != name) {

        if(item.file) {
          console.log('need to move files - item renamed')
          move = true
        }
        
        item.name = encodeKebobCase(item.frontmatter.title)
        
        renamed = oldItem && item.name != oldItem.name

        const tab = state.tabs.indexOf(itemKey)

        commit('removeItem', {type, name})

        if(!close) {
          commit('insertOpenItem', {item, tab})
        }

      } else if (close) {
        commit('closeItem', utils.itemKey(name, type))
      }

      await writeItem(item, state.dataDir)

      commit('insertSavedItem', item)

      if(move) {
        await moveAccompanyingFiles(getDir(oldItem, state.dataDir), getDir(item, state.dataDir))
        await removeItemFiles(getDir(oldItem, state.dataDir))
      }

      if(renamed) {
        await dispatch('updateReferences', {oldName: oldItem.name, newName: item.name, type: item.type})
      }
      
      if(!close) {
        commit('setSaved', {itemKey: utils.itemKey(item.name, type) , value: true})
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
