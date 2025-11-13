import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';

function App() {
  const [result, setResult] = useState('');
  const baseUrl = "https://monitoringpocapp-a6fgf4h8hzbwbvhc.westeurope-01.azurewebsites.net/api"; // Sostituisci con il tuo URL

  const callEndpoint = async (type) => {
    try {
      const response = await fetch(`${baseUrl}/${type}`);
      const text = await response.text();
      setResult(`Risposta: ${text}`);
    } catch (error) {
      setResult(`Errore: ${error}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Test Backend su Azure</h1>
      <button onClick={() => callEndpoint('sample')} style={{ margin: '10px', padding: '10px' }}>
        Chiama Success
      </button>
      <button onClick={() => callEndpoint('sample/error')} style={{ margin: '10px', padding: '10px' }}>
        Chiama Error
      </button>
      <p>{result}</p>
    </div>
  );
}

export default App;
