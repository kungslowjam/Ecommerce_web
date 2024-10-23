"use client";

import QRCode from 'qrcode.react';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Function to generate the PromptPay payload with correct format
function generatePromptPayPayload(phone, amount) { 
  const promptPayPrefix = '00020101021129370016A000000677010111';
  const phonePayload = phone.startsWith('66') ? phone : `66${phone.slice(1)}`;
  const amountPayload = `54${amount.toFixed(2).replace(".", "")}`.padStart(6, "0");
  const payload = `${promptPayPrefix}${phonePayload}5802TH5303764${amountPayload}5802TH62130706D4F2`;
  return payload;
}

export default function Checkout() { 
  const router = useRouter(); 
  const { data: session } = useSession(); 
  const [cartItems, setCartItems] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0); 
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "", 
    address: "", 
    city: "", 
    postalCode: "", 
    phone: "", 
  }); 
  const [message, setMessage] = useState(""); 
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    async function fetchCartItems() {
      try {
        const res = await fetch("http://localhost:8000/cart?user_id=1");
        if (!res.ok) throw new Error("Failed to fetch cart items");
        const data = await res.json();
        setCartItems(data.items);
        calculateTotalPrice(data.items);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }

    async function fetchShippingInfo() {
      if (session?.user?.email) {
        try {
          const res = await fetch(`http://localhost:8000/addresses/${session.user.email}`);
          if (!res.ok) throw new Error("Failed to fetch shipping info");
          const data = await res.json();
          setShippingInfo({
            fullName: data.full_name,
            address: data.detailed_address,
            city: data.province,
            postalCode: data.postal_code,
            phone: data.phone_number,
          });
        } catch (error) {
          console.error("Error fetching shipping info:", error);
          setMessage("ไม่พบข้อมูลการจัดส่ง");
        }
      }
    }

    fetchCartItems();
    fetchShippingInfo();
  }, [session]);

  const calculateTotalPrice = (items) => {
    const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const handlePlaceOrder = async () => {
    if (Object.values(shippingInfo).some((field) => !field)) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const orderData = {
      user_id: session.user.id,
      items: cartItems.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      shipping_info: {
        email: session.user.email,
        full_name: shippingInfo.fullName,
        phone_number: shippingInfo.phone,
        province: shippingInfo.city,
        detailed_address: shippingInfo.address,
        postal_code: shippingInfo.postalCode,
      },
      total_price: parseFloat(totalPrice.toFixed(2)), 
    };

    try {
      const res = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Failed to place order");

      setMessage("คำสั่งซื้อสำเร็จ! กรุณาชำระเงินโดยสแกน QR Code ด้านล่าง");
      setShowQRCode(true); // Show QR code after successful order placement
    } catch (error) {
      console.error("Error placing order:", error);
      setMessage("เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  const qrValue = generatePromptPayPayload("0812345678", totalPrice);

  return (
    <div className="container mx-auto py-16 px-4 pt-24">
      <h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-6">ข้อมูลการจัดส่ง</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="ชื่อ-นามสกุล"
              value={shippingInfo.fullName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="ที่อยู่"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              name="city"
              placeholder="เมือง"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              name="postalCode"
              placeholder="รหัสไปรษณีย์"
              value={shippingInfo.postalCode}
              onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              name="phone"
              placeholder="เบอร์โทรศัพท์"
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
              className="w-full p-3 border rounded"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">สรุปคำสั่งซื้อ</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            สั่งซื้อ
          </button>
          {message && <p className="text-center mt-4 text-red-500">{message}</p>}
        </div>
      </div>

      {showQRCode && (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-semibold mb-4">ชำระเงินโดยการสแกน QR Code ด้านล่าง</h2>
          <QRCode value={qrValue} size={256} />
        </div>
      )}
    </div> 
  ); 
}
