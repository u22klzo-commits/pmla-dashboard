
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'day' | 'night' | 'mfd'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('night')

    useEffect(() => {
        const savedTheme = localStorage.getItem('tactical-theme') as Theme
        if (savedTheme) {
            setTheme(savedTheme)
        } else {
            setTheme('night')
        }
    }, [])

    const setTheme = (newTheme: Theme) => {
        const root = window.document.documentElement

        // Remove old theme classes
        root.classList.remove('theme-day', 'theme-night', 'theme-mfd')

        // Add new theme class
        root.classList.add(`theme-${newTheme}`)

        // Persist
        localStorage.setItem('tactical-theme', newTheme)
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTacticalTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTacticalTheme must be used within a ThemeProvider')
    }
    return context
}
