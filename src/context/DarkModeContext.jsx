import { createContext, useContext, useEffect, useState } from 'react'

const DarkModeContext = createContext()

function getInitialDarkMode() {
  const savedMode = localStorage.getItem('darkMode')

  if (savedMode !== null) {
    return savedMode === 'true'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode)

  // Update DOM and localStorage when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localStorage.setItem('darkMode', isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider')
  }
  return context
}
