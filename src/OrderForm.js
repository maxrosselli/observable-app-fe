import React, { useState } from 'react';
import axios from 'axios';
import { trackTrace, trackException, startNewOperation, getCurrentOperationId } from './appInsights';
import './OrderForm.css';

export default function OrderForm({ onOrderSent }) {
  const [order, setOrder] = useState({
    orderId: '',
    destination: '',
    itemType: '',
    weightKg: '',
    priority: 'Bassa'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadTesting, setIsLoadTesting] = useState(false);

  const baseUrl = "https://observableapp-fxbcaqekc9bqb4hm.italynorth-01.azurewebsites.net/api";

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setOrder({
      orderId: '',
      destination: '',
      itemType: '',
      weightKg: '',
      priority: 'Bassa'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    
    // Validazione
    if (!order.orderId || !order.destination || !order.itemType || !order.weightKg) {
      alert('⚠️ Compila tutti i campi obbligatori');
      setIsLoading(false);
      return;
    }
    
    // 🔄 Inizia una nuova operazione con operationId
    let operationId;
    try {
      operationId = startNewOperation(`OrderSubmission_${order.orderId || 'Unknown'}`);
    } catch (error) {
      console.warn('Errore nella creazione dell\'operationId:', error);
      operationId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const startTime = Date.now();
    console.log('🔍 Operation ID:', operationId); // Debug
    
    try {
      // 📝 Log inizio operazione
      trackTrace(`Inizio invio ordine: ${order.orderId}`, {
        orderId: order.orderId,
        destination: order.destination,
        itemType: order.itemType,
        weightKg: order.weightKg,
        priority: order.priority,
        operation: 'order_submission_start',
        timestamp: new Date().toISOString()
      });
      
      // 🚀 Chiamata API con header per correlazione
      const response = await axios.post(`${baseUrl}/orders`, order, {
        headers: {
          'Request-Id': operationId,
          'x-ms-request-id': operationId,
          'Content-Type': 'application/json'
        }
      });
      
      const duration = Date.now() - startTime;
      
      // ✅ LOG DI SUCCESSO -> TRACES
      trackTrace(`Ordine inviato con successo: ${order.orderId}`, {
        orderId: order.orderId,
        destination: order.destination,
        itemType: order.itemType,
        weightKg: order.weightKg,
        priority: order.priority,
        responseStatus: response.status,
        duration: duration,
        timestamp: new Date().toISOString(),
        operation: 'order_submission_success'
      });
      
      setIsSuccess(true);
      onOrderSent(order);
      
      // Reset del form dopo 2 secondi
      setTimeout(() => {
        resetForm();
        setIsSuccess(false);
      }, 4000);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // ❌ LOG DI ERRORE -> EXCEPTIONS
      trackException(error, {
        orderId: order.orderId,
        destination: order.destination,
        itemType: order.itemType,
        weightKg: order.weightKg,
        priority: order.priority,
        url: `${baseUrl}/orders`,
        duration: duration,
        timestamp: new Date().toISOString(),
        operation: 'order_submission_error',
        errorDetails: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        }
      });
      
      console.error('Errore nell\'invio dell\'ordine:', error);
      alert('❌ Errore nell\'invio dell\'ordine. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTest = async () => {
    setIsLoadTesting(true);
    
    // 🔄 Inizia una nuova operazione per il load test
    let operationId;
    try {
      operationId = startNewOperation('LoadTest_MassiveOrders');
    } catch (error) {
      console.warn('Errore nella creazione dell\'operationId per load test:', error);
      operationId = `loadtest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const startTime = Date.now();
    console.log('🚀 Load Test Operation ID:', operationId);
    
    try {
      // 📝 Log inizio load test
      trackTrace('Inizio test di carico massivo', {
        operation: 'load_test_start',
        timestamp: new Date().toISOString()
      });
      
      // 🚀 Chiamata API per il load test
      const response = await axios.post(`${baseUrl}/orders/loadtest`, {}, {
        headers: {
          'Request-Id': operationId,
          'x-ms-request-id': operationId,
          'Content-Type': 'application/json'
        }
      });
      
      const duration = Date.now() - startTime;
      
      // ✅ LOG DI SUCCESSO -> TRACES
      trackTrace('Test di carico completato con successo', {
        responseStatus: response.status,
        duration: duration,
        timestamp: new Date().toISOString(),
        operation: 'load_test_success',
        responseData: response.data
      });
      
      alert(`✅ Test di carico completato con successo!\nDurata: ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // ❌ LOG DI ERRORE -> EXCEPTIONS
      trackException(error, {
        url: `${baseUrl}/orders/loadtest`,
        duration: duration,
        timestamp: new Date().toISOString(),
        operation: 'load_test_error',
        errorDetails: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        }
      });
      
      console.error('Errore nel test di carico:', error);
      alert('❌ Errore durante il test di carico. Riprova.');
    } finally {
      setIsLoadTesting(false);
    }
  };

  return (
    <div className={`order-form-container ${isSuccess ? 'success-animation' : ''}`}>
      <div className="form-content">
        <h2 className="form-title">🚚 Nuovo Ordine</h2>
        <p className="form-subtitle">Inserisci i dettagli per la spedizione</p>
        
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="icon">📦</span>
                ID Ordine
              </label>
              <input
                className="form-input"
                name="orderId"
                value={order.orderId}
                placeholder="es. ORD-2025-001"
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="icon">📍</span>
                Destinazione
              </label>
              <input
                className="form-input"
                name="destination"
                value={order.destination}
                placeholder="es. Milano, IT"
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="icon">📋</span>
                Tipo Merce
              </label>
              <input
                className="form-input"
                name="itemType"
                value={order.itemType}
                placeholder="es. Elettronica"
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="icon">⚖️</span>
                Peso (kg)
              </label>
              <input
                className="form-input"
                name="weightKg"
                type="number"
                step="0.1"
                min="0.1"
                value={order.weightKg}
                placeholder="es. 2.5"
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="icon">⚡</span>
              Priorità Spedizione
            </label>
            <div className="priority-group">
              <div className="priority-option">
                <input
                  className="priority-radio"
                  type="radio"
                  id="priority-bassa"
                  name="priority"
                  value="Bassa"
                  checked={order.priority === 'Bassa'}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label className="priority-label" htmlFor="priority-bassa">
                  🐌 Standard
                </label>
              </div>
              <div className="priority-option">
                <input
                  className="priority-radio"
                  type="radio"
                  id="priority-alta"
                  name="priority"
                  value="Alta"
                  checked={order.priority === 'Alta'}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label className="priority-label" htmlFor="priority-alta">
                  🚀 Express
                </label>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || isLoadTesting}
            >
              {isLoading && <span className="loading-spinner"></span>}
              {isLoading ? 'Invio in corso...' : 
               isSuccess ? '✅ Ordine Inviato!' : 
               '🚚 Invia Ordine'}
            </button>
            
            <button
              type="button"
              className="load-test-button"
              onClick={handleLoadTest}
              disabled={isLoading || isLoadTesting}
            >
              {isLoadTesting && <span className="loading-spinner"></span>}
              {isLoadTesting ? 'Test in corso...' : '⚡ Test di Carico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}