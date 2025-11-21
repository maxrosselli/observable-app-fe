
import React, { useState } from 'react';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);

  const handleOrderSent = (order) => {
    setOrders([...orders, order]);
  };

  return (
    <div className="App">
      <div className="app-header">
        <h1 className="app-title">🚚 LogiTrack Pro</h1>
        <p className="app-subtitle">
          Sistema di gestione ordini e spedizioni con monitoraggio in tempo reale
        </p>
      </div>
      
      <div className="main-content">
        <OrderForm onOrderSent={handleOrderSent} />
        <OrderList orders={orders} />
      </div>
    </div>
  );
}

export default App;
