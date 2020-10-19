function decodeKebobCase(str) {
    if (!str) {
        return ''
    }
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

function encodeKebobCase(str) {
    return str.replace(/[^0-9a-zA-Z]+/g, ' ').trim().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[-\s]+/g, '-').toLowerCase()
}

function itemKey(name, type) {
    return `${type}:${name}`
}

function decodeItemKey(itemKey) {
    const arr = itemKey.split(':')
    return {type: arr.length > 0 ? arr[0] : '', name: arr.length > 1 ? arr[1] : ''}
}

const typeMap = {
    'task': 'tasks',
    'category': 'categories',
    'method': 'methods',
    'paper': 'papers',
  }

  
export default {
    decodeKebobCase,
    encodeKebobCase,
    itemKey,
    decodeItemKey,
    typeMap
}