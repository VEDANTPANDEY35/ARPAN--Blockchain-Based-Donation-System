import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Web3Provider } from './context/Web3Context'
import { ToastProvider } from './context/ToastContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Web3Provider>
            <ToastProvider>
                <App />
            </ToastProvider>
        </Web3Provider>
    </React.StrictMode>,
)
