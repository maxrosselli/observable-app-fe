import './App.css';
import React, { useState } from 'react';
import { trackEvent, trackException, trackTrace } from './appInsights';

function App() {
  const [result, setResult] = useState('');
  const baseUrl = "https://monitoringpocapp-a6fgf4h8hzbwbvhc.westeurope-01.azurewebsites.net/api"; // Sostituisci con il tuo URL

  const callEndpoint = async (type) => {
    const startTime = Date.now();
    
    // Log dell'inizio della chiamata
    trackEvent('ButtonClick', {
      endpoint: type,
      action: 'start_api_call',
      url: `${baseUrl}/${type}`
    });

    trackTrace(`Inizio chiamata API: ${type}`, {
      endpoint: type,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(`${baseUrl}/${type}`);
      const text = await response.text();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log di successo
      trackEvent('APICallSuccess', {
        endpoint: type,
        responseStatus: response.status.toString(),
        url: `${baseUrl}/${type}`
      }, {
        duration: duration,
        responseSize: text.length
      });

      trackTrace(`Chiamata API completata con successo: ${type}`, {
        endpoint: type,
        status: response.status,
        duration: duration,
        responseLength: text.length
      });

      setResult(`Risposta: ${text}`);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log di errore
      trackException(error, {
        endpoint: type,
        url: `${baseUrl}/${type}`,
        duration: duration
      });

      trackEvent('APICallError', {
        endpoint: type,
        errorMessage: error.message,
        url: `${baseUrl}/${type}`
      }, {
        duration: duration
      });

      trackTrace(`Errore durante chiamata API: ${type}`, {
        endpoint: type,
        error: error.message,
        duration: duration
      });

      setResult(`Errore: ${error}`);
    }
  };

  const handleSuccessButtonClick = () => {
    trackEvent('SuccessButtonClick', {
      buttonType: 'success',
      timestamp: new Date().toISOString()
    });
    callEndpoint('sample');
  };

  const handleErrorButtonClick = () => {
    trackEvent('ErrorButtonClick', {
      buttonType: 'error', 
      timestamp: new Date().toISOString()
    });
    callEndpoint('sample/error');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Test Backend su Azure</h1>
      <button onClick={handleSuccessButtonClick} style={{ margin: '10px', padding: '10px' }}>
        Chiama Success
      </button>
      <button onClick={handleErrorButtonClick} style={{ margin: '10px', padding: '10px' }}>
        Chiama Error
      </button>
      <p>{result}</p>
    </div>
  );
}

export default App;
