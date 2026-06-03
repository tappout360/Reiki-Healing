import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
          <h1>Something went wrong.</h1>
          <div style={{
            maxWidth: '600px',
            margin: '2rem auto',
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'left'
          }}>
            <h3 style={{color: '#ff7675', marginTop: 0}}>Diagnostic Logs:</h3>
            <pre style={{
              background: '#0d0d12',
              color: '#fab1a0',
              padding: '1rem',
              overflow: 'auto',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error && this.state.error.stack || (this.state.error && this.state.error.toString())}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.5rem',
              background: 'var(--accent-gold, #d4af37)',
              color: 'black',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
