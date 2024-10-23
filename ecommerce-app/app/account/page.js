"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Account() {
  const { data: session, status } = useSession({ refetchInterval: 5 });
  const [address, setAddress] = useState({ 
    email: "", 
    fullName: "", 
    phoneNumber: "", 
    province: "", 
    detailedAddress: "",
    postalCode: "", // Add postalCode to address state
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session && session.user && session.user.email) {
      const userEmail = session.user.email;
      console.log("User role from session:", session.user.role); 
      setAddress((prevAddress) => ({
        ...prevAddress,
        email: userEmail,
      }));
      fetchAddress(userEmail);
    } else {
      setMessage("ไม่พบ email กรุณาลองอีกครั้ง");
    }
  }, [session]);

  const fetchAddress = async (email) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/addresses/${email}`);
      if (!response.ok) throw new Error("Error fetching address data");

      const data = await response.json();
      if (data) {
        const { full_name, phone_number, province, detailed_address, postal_code } = data; // Fetch postal_code
        setAddress({
          email: email,
          fullName: full_name,
          phoneNumber: phone_number,
          province: province,
          detailedAddress: detailed_address,
          postalCode: postal_code, // Set postalCode in state
        });
        setMessage("");
      } else {
        setMessage("ไม่พบข้อมูลที่อยู่");
      }
    } catch (error) {
      console.error("Error loading address:", error);
      setMessage("เกิดข้อผิดพลาดในการโหลดที่อยู่");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleSaveAddress = async () => {
    if (!address.email) {
      setMessage("ไม่พบ email กรุณาลองอีกครั้ง");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/addresses/${address.email}`);
      const data = await response.json();

      const apiUrl = data
        ? `http://localhost:8000/addresses/update/${address.email}`
        : "http://localhost:8000/addresses/add";
      const method = data ? "PUT" : "POST";

      const apiResponse = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: address.email,
          full_name: address.fullName,
          phone_number: address.phoneNumber,
          province: address.province,
          detailed_address: address.detailedAddress,
          postal_code: address.postalCode, // Include postal_code in request
        }),
      });

      if (!apiResponse.ok) throw new Error("การบันทึกที่อยู่ล้มเหลว");

      setMessage("บันทึกที่อยู่สำเร็จ");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving address:", error);
      setMessage("การบันทึกที่อยู่ล้มเหลว");
    }
  };

  if (status === "loading" || isLoading) {
    return <p>กำลังโหลด...</p>;
  }

  if (status === "unauthenticated") {
    return <p>คุณต้องเข้าสู่ระบบเพื่อดูหน้านี้</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-24">
      <h1 className="text-2xl font-bold mb-4">บัญชีของฉัน</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-lg mb-2"><strong>ชื่อ:</strong> {session.user.name}</p>
        <p className="text-lg mb-2"><strong>อีเมล:</strong> {session.user.email}</p>
        {session.user.role && (
          <p className="text-lg mb-2"><strong>บทบาท:</strong> {session.user.role}</p>
        )}

        <h2 className="text-xl font-semibold mt-6">ที่อยู่ในการจัดส่งสินค้า</h2>

        {isEditing ? (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium">ชื่อ-นามสกุล</label>
              <input
                type="text"
                name="fullName"
                value={address.fullName}
                onChange={handleInputChange}
                placeholder="ชื่อ-นามสกุล"
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">หมายเลขโทรศัพท์</label>
              <input
                type="text"
                name="phoneNumber"
                value={address.phoneNumber}
                onChange={handleInputChange}
                placeholder="หมายเลขโทรศัพท์"
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">จังหวัด, เขต/อำเภอ, แขวง/ตำบล</label>
              <input
                type="text"
                name="province"
                value={address.province}
                onChange={handleInputChange}
                placeholder="จังหวัด, เขต/อำเภอ, แขวง/ตำบล"
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">รหัสไปรษณีย์</label>
              <input
                type="text"
                name="postalCode" // Add postalCode input
                value={address.postalCode}
                onChange={handleInputChange}
                placeholder="รหัสไปรษณีย์"
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">บ้านเลขที่, ซอย, หมู่, ถนน, เขต/อำเภอ, แขวง/ตำบล</label>
              <textarea
                name="detailedAddress"
                value={address.detailedAddress}
                onChange={handleInputChange}
                placeholder="บ้านเลขที่, ซอย, หมู่, ถนน, เขต/อำเภอ, แขวง/ตำบล"
                className="w-full p-2 border rounded mt-1"
                rows="3"
              ></textarea>
            </div>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleSaveAddress} className="btn btn-primary">บันทึกที่อยู่</button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">ยกเลิก</button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p><strong>ชื่อ-นามสกุล:</strong> {address.fullName}</p>
            <p><strong>หมายเลขโทรศัพท์:</strong> {address.phoneNumber}</p>
            <p><strong>จังหวัด, เขต/อำเภอ, แขวง/ตำบล:</strong> {address.province}</p>
            <p><strong>รหัสไปรษณีย์:</strong> {address.postalCode}</p> {/* Display postal code */}
            <p><strong>บ้านเลขที่, ซอย, หมู่, ถนน, เขต/อำเภอ, แขวง/ตำบล:</strong> {address.detailedAddress}</p>
            <button onClick={() => setIsEditing(true)} className="btn btn-outline mt-4">แก้ไขที่อยู่</button>
          </div>
        )} 
      </div> 
      {message && <p className="text-center mt-4 text-green-500">{message}</p>} 
    </div> 
  ); 
}
