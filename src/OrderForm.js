import React, { useState } from 'react';
import axios from 'axios';

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
    try {
      await axios.post(`${baseUrl}/orders`, order);
      onOrderSent(order);
    } catch (error) {
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