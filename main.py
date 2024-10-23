from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DECIMAL, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os 
import uuid 
import json 
from typing import List, Optional
from pydantic import BaseModel

# ตั้งค่าการเชื่อมต่อฐานข้อมูล PostgreSQL
DATABASE_URL = "postgresql://mydb:mydb@localhost:5432/mydb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# สร้างโมเดล Product
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_description = Column(String, nullable=True)
    description = Column(String, nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String, nullable=True)
    specs = Column(JSON, nullable=True)
    image_urls = Column(JSON, nullable=True)

# สร้างโมเดล Cart และ CartItem สำหรับตะกร้าสินค้า
class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    items = relationship("CartItem", back_populates="cart")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

# สร้างโมเดล Address สำหรับการจัดการที่อยู่
class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    province = Column(String, nullable=False)
    detailed_address = Column(String, nullable=False)
    postal_code = Column(String, nullable=True)  # เพิ่มฟิลด์ postal_code


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    items = Column(JSON, nullable=False)  # Store items as JSON
    shipping_info = Column(JSON, nullable=False)  # Store shipping details as JSON
    total_price = Column(DECIMAL(10, 2), nullable=False)


# สร้างตารางในฐานข้อมูล
Base.metadata.create_all(bind=engine)

# ฟังก์ชันสำหรับสร้าง session ของฐานข้อมูล
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# สร้าง FastAPI instance
app = FastAPI()

# ตั้งค่า URL เบื้องต้นสำหรับการเข้าถึงไฟล์
BASE_URL = "http://localhost:8000"

# เปิดใช้งาน CORS
origins = [
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ตรวจสอบและสร้างโฟลเดอร์สำหรับอัปโหลดรูปภาพ (ถ้ายังไม่มี)
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# เพิ่ม static route สำหรับไฟล์ในโฟลเดอร์ uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic Model สำหรับการเพิ่มสินค้าในตะกร้า
class CartItemRequest(BaseModel):
    user_id: int
    product_id: int
    quantity: int

# Pydantic Model สำหรับการจัดการที่อยู่
class AddressRequest(BaseModel):
    email: str
    full_name: str
    phone_number: str
    province: str
    detailed_address: str
    postal_code: Optional[str] = None  # เพิ่มฟิลด์ postal_code

class OrderItemRequest(BaseModel):
    product_id: int
    quantity: int

class OrderRequest(BaseModel):
    user_id: int
    items: List[OrderItemRequest]
    shipping_info: AddressRequest  # ใช้ AddressRequest ถ้าโครงสร้างตรงกัน
    total_price: float


class UpdateCartItemRequest(BaseModel):
    quantity: int
# เส้นทาง POST สำหรับเพิ่มสินค้า พร้อมการอัปโหลดหลายรูปภาพ
@app.post("/products/add")
async def create_product(
    name: str = Form(...),
    short_description: str = Form(None),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category: str = Form(None),
    specs: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    image_urls = []

    # ตรวจสอบประเภทไฟล์และบันทึกรูปภาพ
    for image in images:
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid file type.")
        file_extension = os.path.splitext(image.filename)[1]
        image_filename = f"{uuid.uuid4()}{file_extension}"
        image_path = f"uploads/{image_filename}"

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_urls.append(f"{BASE_URL}/uploads/{image_filename}")

    # แปลง specs เป็น JSON หากส่งมาเป็น string
    try:
        specs_json = json.loads(specs) if specs else None
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for specs")

    new_product = Product(
        name=name,
        short_description=short_description,
        description=description,
        price=price,
        stock=stock,
        category=category,
        specs=specs_json,
        image_urls=image_urls
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# เส้นทาง PUT สำหรับอัปเดตสินค้า
@app.put("/products/update/{product_id}")
async def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    stock: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    specs: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if name:
        product.name = name
    if short_description:
        product.short_description = short_description
    if description:
        product.description = description
    if price is not None:
        product.price = price
    if stock is not None:
        product.stock = stock
    if category:
        product.category = category

    if specs:
        try:
            product.specs = json.loads(specs)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format for specs")

    if images:
        new_image_urls = []
        for image in images:
            if not image.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="Invalid file type.")
            file_extension = os.path.splitext(image.filename)[1]
            image_filename = f"{uuid.uuid4()}{file_extension}"
            image_path = f"uploads/{image_filename}"

            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            new_image_urls.append(f"{BASE_URL}/uploads/{image_filename}")
        
        product.image_urls = new_image_urls

    db.commit()
    db.refresh(product)
    return product

# เส้นทางสำหรับดึงข้อมูลสินค้าทั้งหมด
@app.get("/products")
async def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

# เส้นทางสำหรับดึงข้อมูลสินค้าเฉพาะตาม ID
@app.get("/products/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# เส้นทาง POST สำหรับเพิ่มสินค้าในตะกร้า
@app.post("/cart/add")
async def add_to_cart(item: CartItemRequest, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == item.user_id).first()
    if not cart:
        cart = Cart(user_id=item.user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == item.product_id).first()
    if cart_item:
        cart_item.quantity += item.quantity
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)
        db.add(cart_item)

    db.commit()
    return {"message": "Item added to cart"}

# เส้นทาง DELETE สำหรับลบสินค้าออกจากตะกร้า
@app.delete("/cart/remove/{item_id}")
async def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

# เส้นทาง PATCH สำหรับอัปเดตจำนวนสินค้าในตะกร้า
@app.patch("/cart/update/{item_id}")
async def update_cart_item(item_id: int, request: UpdateCartItemRequest, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    cart_item.quantity = request.quantity
    db.commit()
    return {"message": "Cart item updated"}


# เส้นทาง GET สำหรับดึงข้อมูลตะกร้าสินค้า
@app.get("/cart")
async def get_cart(user_id: int, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        return {"items": []}

    items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    return {
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "name": item.product.name,
                    "price": item.product.price,
                    "description": item.product.description,
                    "image_urls": item.product.image_urls
                },
            }
            for item in items
        ]
    }

# เส้นทาง POST สำหรับเพิ่มที่อยู่ใหม่
@app.post("/addresses/add")
async def add_address(address: AddressRequest, db: Session = Depends(get_db)):
    new_address = Address(
        email=address.email,
        full_name=address.full_name,
        phone_number=address.phone_number,
        province=address.province,
        detailed_address=address.detailed_address,
        postal_code=address.postal_code  # เพิ่มฟิลด์ postal_code
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


# เส้นทาง GET สำหรับดึงข้อมูลที่อยู่ทั้งหมดของผู้ใช้
@app.get("/addresses/{email}")
async def get_addresses(email: str, db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.email == email).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

# เส้นทาง PUT สำหรับอัปเดตที่อยู่
@app.put("/addresses/update/{email}")
async def update_address(email: str, address: AddressRequest, db: Session = Depends(get_db)):
    db_address = db.query(Address).filter(Address.email == email).first()
    
    # ถ้าไม่พบข้อมูล ให้สร้างข้อมูลใหม่
    if not db_address:
        new_address = Address(
            email=email,
            full_name=address.full_name,
            phone_number=address.phone_number,
            province=address.province,
            detailed_address=address.detailed_address,
            postal_code=address.postal_code  # เพิ่มฟิลด์ postal_code
        )
        db.add(new_address)
        db.commit()
        db.refresh(new_address)
        return new_address

    # ถ้าพบข้อมูลแล้ว ให้ทำการอัปเดต
    db_address.full_name = address.full_name
    db_address.phone_number = address.phone_number
    db_address.province = address.province
    db_address.detailed_address = address.detailed_address
    db_address.postal_code = address.postal_code  # เพิ่มฟิลด์ postal_code สำหรับอัปเดต
    
    db.commit()
    db.refresh(db_address)
    return db_address



# เส้นทาง DELETE สำหรับลบที่อยู่
@app.delete("/addresses/delete/{email}")
async def delete_address(email: str, db: Session = Depends(get_db)):
    db_address = db.query(Address).filter(Address.email == email).first()
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    db.delete(db_address)
    db.commit()
    return {"message": "Address deleted successfully"}

@app.post("/orders")
async def create_order(order: OrderRequest, db: Session = Depends(get_db)):
    try:
        print(f"Order received: {order}")  # ตรวจสอบข้อมูลที่ได้รับจาก frontend

        # Create a new order
        new_order = Order(
            user_id=order.user_id,
            items=[item.dict() for item in order.items],
            shipping_info=order.shipping_info.dict(),
            total_price=order.total_price
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {"message": "Order created successfully", "order": new_order}
    
    except Exception as e:
        db.rollback()
        print(f"Error occurred while creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")


