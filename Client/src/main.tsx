import React, { createContext } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Workshop from './workshop/index.ts';

const workshop = new Workshop();
export const Context = createContext(workshop);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Context.Provider value={workshop}>
      <App />
    </Context.Provider>
  </React.StrictMode>,
)
