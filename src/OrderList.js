import React from 'react';

export default function OrderList({ orders }) {
  return (
    <ul>
      {orders.map((order, index) => (
        <li key={index}>
          {order.orderId} - {order.destination} - {order.priority}
        </li>
      ))}
    </ul>
  );
}