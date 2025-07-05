"use client";

import { useEffect, useState } from "react";

const OnboardCartItems = ({ selectedPackage }) => {
  // Initialize cart with selected package or default data
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (selectedPackage) {
      // Convert the selected package to cart item format
      const cartItem = {
        id: selectedPackage.id,
        title: selectedPackage.packageType,
        price:
          selectedPackage.price === "Free"
            ? 0
            : parseFloat(selectedPackage.price),
        qty: 1,
        img: "/images/resource/plan-1.jpg",
        duration: "1 Month",
        features: selectedPackage.features,
        tag: selectedPackage.tag,
      };
      setCartItems([cartItem]);
    } else {
      // Fallback to dummy data if no package selected
      setCartItems([
        {
          id: 1,
          title: "Basic Plan",
          price: 99,
          qty: 1,
          img: "/images/resource/plan-1.jpg",
          duration: "1 Month",
        },
      ]);
    }
  }, [selectedPackage]);

  // Format Euro amounts
  const formatEuroAmount = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

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
            {item.tag && <span className="tag">Recommended</span>}
          </td>

          <td className="product-price">
            {item.price === 0 ? "Free" : formatEuroAmount(item.price)}
          </td>

          <td className="product-subtotal">
            <span className="amount">
              {item.price === 0
                ? "Free"
                : formatEuroAmount(item.qty * item.price)}
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
