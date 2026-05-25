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
          {import.meta.env.DEV && (
            <pre style={{textAlign: 'left', background: '#333', padding: '1rem', overflow: 'auto'}}>
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
          <button onClick={() => window.location.reload()} style={{marginTop: '1rem', padding: '0.5rem 1rem'}}>
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
