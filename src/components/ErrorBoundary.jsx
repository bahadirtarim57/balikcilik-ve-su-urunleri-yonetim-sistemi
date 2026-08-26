import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '20px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', margin: '20px' }}>
          <h2>Sistemde bir hata oluştu!</h2>
          <p>Yaptığım güncellemelerin aktif olması için sayfayı yenilemeniz gerekiyor.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ background: '#b91c1c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}
          >
            Sayfayı Yenile (Tıkla)
          </button>
          
          <div style={{ marginTop: '20px', background: 'white', padding: '15px', borderRadius: '8px', color: '#b91c1c', border: '2px solid #b91c1c', fontSize: '16px', fontWeight: 'bold' }}>
            LÜTFEN BU YAZININ FOTOĞRAFINI GÖNDERİN:<br/><br/>
            {this.state.error && this.state.error.toString()}
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#7f1d1d', overflow: 'auto', maxHeight: '150px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
