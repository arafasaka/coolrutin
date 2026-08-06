'use client'
import { createContext, useContext, useRef, useState, useEffect } from 'react'

const UnsavedChangesContext = createContext(null)

export function UnsavedChangesProvider({ children }) {
  const [isDirty, setIsDirty] = useState(false)
  const saveHandlerRef = useRef(null)

  const registerSaveHandler = (fn) => {
    saveHandlerRef.current = fn
  }

  const runSaveHandler = async () => {
    if (saveHandlerRef.current) await saveHandlerRef.current()
  }

  // Proteksi untuk tutup tab / refresh browser
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setIsDirty, registerSaveHandler, runSaveHandler }}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext)
}