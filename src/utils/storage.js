const DB_NAME = 'orvixa'
const STORE_NAME = 'app-data'
const CHANNEL_NAME = 'orvixa-storage'
const OPEN_TIMEOUT_MS = 3000

let databasePromise

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available in this browser.'))
        return
      }
      const request = window.indexedDB.open(DB_NAME, 1)
      const timeout = window.setTimeout(
        () => reject(new Error('Timed out opening browser storage.')),
        OPEN_TIMEOUT_MS,
      )
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
      request.onsuccess = () => {
        window.clearTimeout(timeout)
        const database = request.result
        database.onversionchange = () => {
          database.close()
          databasePromise = null
        }
        resolve(database)
      }
      request.onerror = () => {
        window.clearTimeout(timeout)
        reject(request.error)
      }
    }).catch((error) => {
      databasePromise = null
      throw error
    })
  }
  return databasePromise
}

async function runRequest(mode, createRequest) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = createRequest(transaction.objectStore(STORE_NAME))
    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = () => reject(transaction.error ?? request.error)
    transaction.onabort = () => reject(transaction.error ?? request.error)
  })
}

function readLegacyValue(key) {
  const saved = window.localStorage.getItem(key)
  if (saved === null) return undefined
  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error)
    window.localStorage.removeItem(key)
    return undefined
  }
}

export async function loadStoredValue(key) {
  let value
  try {
    value = await runRequest('readonly', (store) => store.get(key))
  } catch (error) {
    console.error('IndexedDB is unavailable; falling back to local storage.', error)
    return readLegacyValue(key)
  }

  if (value !== undefined) return value

  const legacyValue = readLegacyValue(key)
  if (legacyValue !== undefined) {
    await runRequest('readwrite', (store) => store.put(legacyValue, key))
    window.localStorage.removeItem(key)
  }
  return legacyValue
}

export async function saveStoredValue(key, value) {
  try {
    await runRequest('readwrite', (store) => store.put(value, key))
  } catch (error) {
    if (databasePromise) throw error
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

export async function deleteStoredValue(key) {
  window.localStorage.removeItem(key)
  try {
    await runRequest('readwrite', (store) => store.delete(key))
  } catch (error) {
    console.error(`Could not delete ${key} from IndexedDB.`, error)
  }
}

const channel = 'BroadcastChannel' in window ? new window.BroadcastChannel(CHANNEL_NAME) : null

export function notifyStorageChange(key) {
  channel?.postMessage({ key })
}

export function subscribeToStorageChanges(key, onChange) {
  if (!channel) return () => {}
  const handleMessage = (event) => {
    if (event.data?.key === key) onChange()
  }
  channel.addEventListener('message', handleMessage)
  return () => channel.removeEventListener('message', handleMessage)
}
