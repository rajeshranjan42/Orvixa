import { useEffect, useRef, useState } from 'react'
import {
  deleteStoredValue,
  loadStoredValue,
  notifyStorageChange,
  saveStoredValue,
  subscribeToStorageChanges,
} from './storage'

function reportStorageError(key, error) {
  console.error(`Could not save ${key} in this browser.`, error)
  const quotaExceeded = error instanceof DOMException && error.name === 'QuotaExceededError'
  window.dispatchEvent(new CustomEvent('orvixa-storage-error', {
    detail: quotaExceeded
      ? 'Browser storage is full. The latest changes are visible now but may not persist after reload; remove unused large images or clear site storage.'
      : 'Could not save changes in this browser. Check browser storage permissions.',
  }))
}

export function usePersistentState(key, fallback, validate) {
  const [value, setValue] = useState(fallback)
  const [loaded, setLoaded] = useState(false)
  const persistedValue = useRef(fallback)

  useEffect(() => {
    let active = true

    const restore = async () => {
      const stored = await loadStoredValue(key)
      if (!active || stored === undefined) return
      const validated = validate(stored)
      if (validated === null) {
        console.error(`Saved data for ${key} has an invalid shape and was discarded.`)
        await deleteStoredValue(key)
        return
      }
      persistedValue.current = validated
      setValue(validated)
    }

    restore()
      .catch((error) => console.error(`Could not restore ${key} from browser storage.`, error))
      .finally(() => {
        if (active) setLoaded(true)
      })

    const unsubscribe = subscribeToStorageChanges(key, () => {
      loadStoredValue(key)
        .then((stored) => {
          if (!active) return
          const validated = stored === undefined ? fallback : validate(stored)
          if (validated === null) throw new TypeError(`Saved data for ${key} has an invalid shape.`)
          persistedValue.current = validated
          setValue(validated)
        })
        .catch((error) => console.error(`Could not sync ${key} from another browser tab.`, error))
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [key, fallback, validate])

  useEffect(() => {
    if (!loaded || persistedValue.current === value) return
    persistedValue.current = value
    saveStoredValue(key, value)
      .then(() => notifyStorageChange(key))
      .catch((error) => reportStorageError(key, error))
  }, [key, loaded, value])

  return [value, setValue, loaded]
}
