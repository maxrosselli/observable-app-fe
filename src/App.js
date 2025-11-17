
import React, { useState } from 'react';
import OrderForm from './OrderForm';
import OrderList from './OrderList';

function App() {
  const [orders, setOrders] = useState([]);

  const handleOrderSent = (order) => {
    setOrders([...orders, order]);
  };

  return (
    <div>
      <h1>Demo Logistica</h1>
      <OrderForm onOrderSent={handleOrderSent} />
      <OrderList orders={orders} />
    </div>
  );
}

export default App;
