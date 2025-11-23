import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Only show error UI for non-timeout errors
    // Timeout errors should be handled gracefully
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
      console.warn('Timeout error caught by ErrorBoundary, handling gracefully');
      // Don't show error UI for timeout, let it be handled by component
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    // Safely set error state, ensure errorInfo is not null
    this.setState({
      error: error,
      errorInfo: errorInfo || { componentStack: '' }
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Don't show error UI for timeout errors
      if (this.state.error?.name === 'TimeoutError' || this.state.error?.message?.includes('timeout')) {
        return this.props.children;
      }

      // Safely access errorInfo with null check
      const errorInfo = this.state.errorInfo || { componentStack: '' };
      const errorMessage = this.state.error ? this.state.error.toString() : 'Unknown error';
      const componentStack = errorInfo.componentStack || '';

      // Custom fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #f44336',
          borderRadius: '8px',
          backgroundColor: '#ffebee'
        }}>
          <h2 style={{ color: '#c62828', marginBottom: '10px' }}>Terjadi Kesalahan</h2>
          <p style={{ color: '#424242' }}>
            Maaf, terjadi kesalahan yang tidak terduga. Silakan refresh halaman atau hubungi administrator.
          </p>
          <details style={{ marginTop: '10px', color: '#616161' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>Detail Error</summary>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {errorMessage}
              {componentStack && (
                <>
                  <br />
                  {componentStack}
                </>
              )}
            </pre>
          </details>
          <button 
            onClick={this.handleReset}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#0271B6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

