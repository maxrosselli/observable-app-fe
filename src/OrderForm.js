import React, { useState } from 'react';
import axios from 'axios';
import { trackTrace, trackException, startNewOperation, getCurrentOperationId } from './appInsights';

export default function OrderForm({ onOrderSent }) {
  const [order, setOrder] = useState({
    orderId: '',
    destination: '',
    itemType: '',
    weightKg: '',
    priority: 'Bassa'
  });

  const baseUrl = "https://observableapp-fxbcaqekc9bqb4hm.italynorth-01.azurewebsites.net/api";

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔄 Inizia una nuova operazione con operationId
    const operationId = startNewOperation(`OrderSubmission_${order.orderId || 'Unknown'}`);
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
      
      onOrderSent(order);
      alert('Ordine inviato con successo!');
      
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
      alert('Errore nell\'invio dell\'ordine. Riprova.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="orderId" placeholder="ID Ordine" onChange={handleChange} />
      <input name="destination" placeholder="Destinazione" onChange={handleChange} />
      <input name="itemType" placeholder="Tipo Merce" onChange={handleChange} />
      <input name="weightKg" type="number" placeholder="Peso (kg)" onChange={handleChange} />
      <select name="priority" onChange={handleChange}>
        <option value="Bassa">Bassa</option>
        <option value="Alta">Alta</option>
      </select>
      <button type="submit">Spedisci Ordine</button>
    </form>
  );
}