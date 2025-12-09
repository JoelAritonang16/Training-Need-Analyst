import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Don't show error UI for timeout and network errors - let them be handled by components
    const errorString = String(error || '');
    const errorMessage = error?.message || errorString;
    
    if (error?.isTimeout || 
        error?.name === 'TimeoutError' || 
        errorString === 'Timeout' ||
        errorMessage?.includes('timeout') || 
        errorMessage?.includes('Timeout') ||
        errorMessage?.includes('Request timeout') ||
        errorMessage?.includes('Server tidak merespons') ||
        error?.isNetworkError || 
        error?.name === 'NetworkError' ||
        errorMessage?.includes('Failed to fetch') || 
        errorMessage?.includes('NetworkError') ||
        errorMessage?.includes('Tidak dapat terhubung ke server')) {
      return { hasError: false };
    }
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Only show error UI for non-timeout and non-network errors
    // Timeout and network errors should be handled gracefully
    const errorString = String(error || '');
    const errorMessage = error?.message || errorString;
    
    if (error?.isTimeout || 
        error?.name === 'TimeoutError' || 
        errorString === 'Timeout' ||
        errorMessage?.includes('timeout') || 
        errorMessage?.includes('Timeout') ||
        errorMessage?.includes('Request timeout') ||
        errorMessage?.includes('Server tidak merespons') ||
        error?.isNetworkError || 
        error?.name === 'NetworkError' ||
        errorMessage?.includes('Failed to fetch') || 
        errorMessage?.includes('NetworkError') ||
        errorMessage?.includes('Tidak dapat terhubung ke server')) {
      // Don't show error UI for timeout/network errors, let it be handled by component
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    // Log error details for non-timeout errors
    console.error('ErrorBoundary caught an error:', error, errorInfo);

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
      // Don't show error UI for timeout and network errors
      const error = this.state.error;
      const errorString = String(error || '');
      const errorMessage = error?.message || errorString;
      
      if (error?.isTimeout || 
          error?.name === 'TimeoutError' || 
          errorString === 'Timeout' ||
          errorMessage?.includes('timeout') || 
          errorMessage?.includes('Timeout') ||
          errorMessage?.includes('Request timeout') ||
          errorMessage?.includes('Server tidak merespons') ||
          error?.isNetworkError || 
          error?.name === 'NetworkError' ||
          errorMessage?.includes('Failed to fetch') || 
          errorMessage?.includes('NetworkError') ||
          errorMessage?.includes('Tidak dapat terhubung ke server')) {
        return this.props.children;
      }

      // Safely access errorInfo with null check
      const errorInfo = this.state.errorInfo || { componentStack: '' };
      const displayErrorMessage = this.state.error ? this.state.error.toString() : 'Unknown error';
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
              {displayErrorMessage}
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

