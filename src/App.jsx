import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import './App.css'

export default function App() {
  const [theme, setTheme] = useState('dark')

  return (
    <BrowserRouter>
      <div className={`app app--${theme}`}>
        <Routes>
          <Route path="/" element={<Dashboard theme={theme} onThemeChange={setTheme} />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
