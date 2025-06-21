"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const OnboardCartItems = () => {
  // Dummy cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Basic Plan",
      price: 99,
      qty: 1,
      img: "/images/resource/plan-1.jpg",
      duration: "1 Month",
    },
  ]);

  // delete cart item
  const deleteCartHandler = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // qty handler
  const qtyHandler = (id, qty) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, qty: parseInt(qty) } : item
      )
    );
  };

  return (
    <>
      {cartItems.map((item) => (
        <tr className="cart-item" key={item.id}>
          {/* <td className="product-thumbnail">
            <Image width={100} height={100} src={item.img} alt="plan image" />
          </td> */}

          <td className="product-name">
            <span>{item.title}</span>
          </td>

          <td className="product-price">${item.price}</td>

          <td className="product-quantity">
            <div className="item-quantity">
              <input
                type="number"
                className="qty"
                name="qty"
                defaultValue={item.qty}
                min={1}
                onChange={(e) => qtyHandler(item.id, e.target.value)}
              />
            </div>
          </td>

          <td className="product-subtotal">
            <span className="amount">
              ${(item.qty * item.price).toFixed(2)}
            </span>
          </td>

          <td className="product-remove">
            <button
              onClick={() => deleteCartHandler(item.id)}
              className="remove"
            >
              <span className="flaticon-dustbin"></span>
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

export default OnboardCartItems;
