import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '20px', color: 'red'}}><h1>Runtime Error!</h1><pre>{this.state.error.toString()}</pre><pre>{this.state.error.stack}</pre></div>;
    }
    return this.props.children; 
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
      <Toaster position="top-right" />
    </AuthProvider>
  </ErrorBoundary>,
)
