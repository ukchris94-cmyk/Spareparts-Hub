from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'spareparts_hub')

# Initialize MongoDB client with connection pooling
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=5000,
    maxPoolSize=50,
    minPoolSize=10
)
db = client[db_name]
logger.info(f"MongoDB client initialized. URL: {mongo_url}, Database: {db_name}")

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Paystack Configuration
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY', '')
PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY', '')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="SpareParts Hub API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize logger before MongoDB connection

# ============= MODELS =============

class UserRole:
    CLIENT = "client"
    VENDOR = "vendor"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number")
    role: str = Field(default=UserRole.CLIENT, description="User role")
    business_name: Optional[str] = Field(None, max_length=100, description="Business name (for vendors)")
    address: Optional[str] = Field(None, max_length=200, description="User address")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    role: str
    business_name: Optional[str] = None
    address: Optional[str] = None
    created_at: str
    is_active: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SparePartBase(BaseModel):
    name: str
    description: str
    category: str
    price: float
    quantity: int
    sku: str
    image_url: Optional[str] = None
    brand: Optional[str] = None
    vehicle_compatibility: Optional[List[str]] = []

class SparePartCreate(SparePartBase):
    pass

class SparePartUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    image_url: Optional[str] = None
    brand: Optional[str] = None
    vehicle_compatibility: Optional[List[str]] = None

class SparePartResponse(SparePartBase):
    id: str
    vendor_id: str
    vendor_name: str
    created_at: str
    is_available: bool = True

class CartItem(BaseModel):
    part_id: str
    quantity: int

class OrderStatus:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PAID = "paid"
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderCreate(BaseModel):
    items: List[CartItem]
    delivery_address: str
    delivery_phone: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    client_id: str
    client_name: str
    items: List[dict]
    total_amount: float
    status: str
    delivery_address: str
    delivery_phone: str
    notes: Optional[str] = None
    dispatcher_id: Optional[str] = None
    dispatcher_name: Optional[str] = None
    created_at: str
    updated_at: str
    payment_reference: Optional[str] = None
    payment_status: str = "pending"

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool = False
    created_at: str

class PaymentInitialize(BaseModel):
    order_id: str
    email: str
    amount: int

# ============= AUTH HELPERS =============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    try:
        # Validate role
        valid_roles = [UserRole.CLIENT, UserRole.VENDOR, UserRole.DISPATCHER]
        if user_data.role not in valid_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")
        
        # Validate business name for vendors
        if user_data.role == UserRole.VENDOR and not user_data.business_name:
            raise HTTPException(status_code=400, detail="Business name is required for vendors")
        
        # Normalize email for checking
        email = user_data.email.lower().strip()
        
        # Check if email already exists
        try:
            existing = await db.users.find_one({"email": email})
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Database error checking email: {e}")
            raise HTTPException(status_code=500, detail="Database connection error. Please try again.")
        
        # Normalize phone number (remove spaces, ensure +234 format)
        phone = user_data.phone.replace(" ", "").replace("-", "")
        if phone.startswith("0"):
            phone = "+234" + phone[1:]
        elif not phone.startswith("+234"):
            phone = "+234" + phone
        
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "email": email,
            "full_name": user_data.full_name.strip(),
            "phone": phone,
            "role": user_data.role,
            "business_name": user_data.business_name.strip() if user_data.business_name else None,
            "address": user_data.address.strip() if user_data.address else None,
            "password_hash": get_password_hash(user_data.password),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        
        try:
            await db.users.insert_one(user_doc)
        except Exception as e:
            logger.error(f"Database error inserting user: {e}")
            raise HTTPException(status_code=500, detail="Failed to create user. Please try again.")
        
        access_token = create_access_token(data={"sub": user_id})
        user_response = UserResponse(
            id=user_id, email=user_doc["email"], full_name=user_doc["full_name"],
            phone=user_doc["phone"], role=user_doc["role"], business_name=user_doc["business_name"],
            address=user_doc["address"], created_at=user_doc["created_at"], is_active=True
        )
        return TokenResponse(access_token=access_token, user=user_response)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in register: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Normalize email (lowercase, strip whitespace)
    email = credentials.email.lower().strip()
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact support.")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_response = UserResponse(
        id=user["id"], email=user["email"], full_name=user["full_name"],
        phone=user["phone"], role=user["role"], business_name=user.get("business_name"),
        address=user.get("address"), created_at=user["created_at"], is_active=user.get("is_active", True)
    )
    return TokenResponse(access_token=access_token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"], email=current_user["email"], full_name=current_user["full_name"],
        phone=current_user["phone"], role=current_user["role"], business_name=current_user.get("business_name"),
        address=current_user.get("address"), created_at=current_user["created_at"], is_active=current_user.get("is_active", True)
    )

# ============= SPARE PARTS ROUTES =============

@api_router.get("/parts", response_model=List[SparePartResponse])
async def get_parts(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    vendor_id: Optional[str] = None,
    available_only: bool = True
):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
        ]
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    if vendor_id:
        query["vendor_id"] = vendor_id
    if available_only:
        query["is_available"] = True
        query["quantity"] = {"$gt": 0}
    
    parts = await db.spare_parts.find(query, {"_id": 0}).to_list(100)
    return [SparePartResponse(**part) for part in parts]

@api_router.get("/parts/{part_id}", response_model=SparePartResponse)
async def get_part(part_id: str):
    part = await db.spare_parts.find_one({"id": part_id}, {"_id": 0})
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return SparePartResponse(**part)

@api_router.post("/parts", response_model=SparePartResponse)
async def create_part(
    part_data: SparePartCreate,
    current_user: dict = Depends(require_roles([UserRole.VENDOR, UserRole.ADMIN]))
):
    part_id = str(uuid.uuid4())
    part_doc = {
        "id": part_id,
        "vendor_id": current_user["id"],
        "vendor_name": current_user.get("business_name") or current_user["full_name"],
        "is_available": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        **part_data.model_dump()
    }
    await db.spare_parts.insert_one(part_doc)
    return SparePartResponse(**part_doc)

@api_router.put("/parts/{part_id}", response_model=SparePartResponse)
async def update_part(
    part_id: str,
    part_data: SparePartUpdate,
    current_user: dict = Depends(require_roles([UserRole.VENDOR, UserRole.ADMIN]))
):
    part = await db.spare_parts.find_one({"id": part_id}, {"_id": 0})
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    if current_user["role"] != UserRole.ADMIN and part["vendor_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this part")
    
    update_data = {k: v for k, v in part_data.model_dump().items() if v is not None}
    if update_data:
        await db.spare_parts.update_one({"id": part_id}, {"$set": update_data})
        part.update(update_data)
    
    return SparePartResponse(**part)

@api_router.delete("/parts/{part_id}")
async def delete_part(
    part_id: str,
    current_user: dict = Depends(require_roles([UserRole.VENDOR, UserRole.ADMIN]))
):
    part = await db.spare_parts.find_one({"id": part_id}, {"_id": 0})
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    if current_user["role"] != UserRole.ADMIN and part["vendor_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this part")
    
    await db.spare_parts.delete_one({"id": part_id})
    return {"message": "Part deleted successfully"}

@api_router.get("/categories")
async def get_categories():
    categories = await db.spare_parts.distinct("category")
    return {"categories": categories}

# ============= ORDER ROUTES =============

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    order_id = str(uuid.uuid4())
    items_with_details = []
    total_amount = 0
    
    for item in order_data.items:
        part = await db.spare_parts.find_one({"id": item.part_id}, {"_id": 0})
        if not part:
            raise HTTPException(status_code=400, detail=f"Part {item.part_id} not found")
        if part["quantity"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {part['name']}")
        
        item_total = part["price"] * item.quantity
        total_amount += item_total
        items_with_details.append({
            "part_id": item.part_id,
            "part_name": part["name"],
            "part_sku": part["sku"],
            "quantity": item.quantity,
            "unit_price": part["price"],
            "total_price": item_total,
            "vendor_id": part["vendor_id"],
            "vendor_name": part["vendor_name"],
        })
        
        await db.spare_parts.update_one(
            {"id": item.part_id},
            {"$inc": {"quantity": -item.quantity}}
        )
    
    now = datetime.now(timezone.utc).isoformat()
    order_doc = {
        "id": order_id,
        "client_id": current_user["id"],
        "client_name": current_user["full_name"],
        "client_phone": current_user["phone"],
        "items": items_with_details,
        "total_amount": total_amount,
        "status": OrderStatus.PENDING,
        "delivery_address": order_data.delivery_address,
        "delivery_phone": order_data.delivery_phone,
        "notes": order_data.notes,
        "dispatcher_id": None,
        "dispatcher_name": None,
        "created_at": now,
        "updated_at": now,
        "payment_reference": None,
        "payment_status": "pending",
    }
    await db.orders.insert_one(order_doc)
    
    # Create notification for vendors
    vendor_ids = list(set(item["vendor_id"] for item in items_with_details))
    for vendor_id in vendor_ids:
        await create_notification_internal(
            vendor_id, "New Order", 
            f"You have a new order #{order_id[:8]} from {current_user['full_name']}", 
            "order"
        )
    
    return OrderResponse(**order_doc)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if current_user["role"] == UserRole.CLIENT:
        query["client_id"] = current_user["id"]
    elif current_user["role"] == UserRole.VENDOR:
        query["items.vendor_id"] = current_user["id"]
    elif current_user["role"] == UserRole.DISPATCHER:
        query["$or"] = [
            {"dispatcher_id": current_user["id"]},
            {"status": OrderStatus.PAID, "dispatcher_id": None}
        ]
    
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [OrderResponse(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse(**order)

@api_router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    new_status: str,
    current_user: dict = Depends(get_current_user)
):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PAID, 
                      OrderStatus.ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, 
                      OrderStatus.DELIVERED, OrderStatus.CANCELLED]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    update_data = {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    # Notify client
    await create_notification_internal(
        order["client_id"], "Order Update",
        f"Your order #{order_id[:8]} status changed to {new_status}", "order"
    )
    
    return {"message": "Order status updated", "status": new_status}

@api_router.put("/orders/{order_id}/assign")
async def assign_dispatcher(
    order_id: str,
    current_user: dict = Depends(require_roles([UserRole.DISPATCHER, UserRole.ADMIN]))
):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["dispatcher_id"] and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Order already assigned")
    
    update_data = {
        "dispatcher_id": current_user["id"],
        "dispatcher_name": current_user["full_name"],
        "status": OrderStatus.ASSIGNED,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    await create_notification_internal(
        order["client_id"], "Dispatcher Assigned",
        f"Dispatcher {current_user['full_name']} has been assigned to your order #{order_id[:8]}", "order"
    )
    
    return {"message": "Dispatcher assigned successfully"}

# ============= LOCATION ROUTES =============

@api_router.put("/location")
async def update_location(
    location: LocationUpdate,
    current_user: dict = Depends(require_roles([UserRole.DISPATCHER]))
):
    location_doc = {
        "user_id": current_user["id"],
        "user_name": current_user["full_name"],
        "latitude": location.latitude,
        "longitude": location.longitude,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.locations.update_one(
        {"user_id": current_user["id"]},
        {"$set": location_doc},
        upsert=True
    )
    return {"message": "Location updated"}

@api_router.get("/locations/dispatchers")
async def get_dispatcher_locations(current_user: dict = Depends(get_current_user)):
    locations = await db.locations.find({}, {"_id": 0}).to_list(100)
    return {"locations": locations}

@api_router.get("/location/{user_id}")
async def get_user_location(user_id: str, current_user: dict = Depends(get_current_user)):
    location = await db.locations.find_one({"user_id": user_id}, {"_id": 0})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

# ============= NOTIFICATION ROUTES =============

async def create_notification_internal(user_id: str, title: str, message: str, notif_type: str = "info"):
    notif_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    return notif_doc

@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return [NotificationResponse(**n) for n in notifications]

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notif_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}

# ============= PAYMENT ROUTES =============

@api_router.post("/payments/initialize")
async def initialize_payment(
    payment_data: PaymentInitialize,
    current_user: dict = Depends(get_current_user)
):
    order = await db.orders.find_one({"id": payment_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["client_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not PAYSTACK_SECRET_KEY:
        # Return mock response if Paystack not configured
        reference = f"mock_{payment_data.order_id}_{str(uuid.uuid4())[:8]}"
        await db.orders.update_one(
            {"id": payment_data.order_id},
            {"$set": {"payment_reference": reference}}
        )
        return {
            "status": True,
            "message": "Payment initialized (mock mode)",
            "data": {
                "authorization_url": f"/payment/mock?reference={reference}",
                "access_code": "mock_code",
                "reference": reference
            }
        }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.paystack.co/transaction/initialize",
            json={
                "email": payment_data.email,
                "amount": payment_data.amount,
                "reference": f"order_{payment_data.order_id}_{str(uuid.uuid4())[:8]}",
                "metadata": {"order_id": payment_data.order_id}
            },
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        )
        result = response.json()
        
        if result.get("status"):
            await db.orders.update_one(
                {"id": payment_data.order_id},
                {"$set": {"payment_reference": result["data"]["reference"]}}
            )
        
        return result

@api_router.get("/payments/verify/{reference}")
async def verify_payment(reference: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"payment_reference": reference}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if reference.startswith("mock_"):
        # Mock verification
        await db.orders.update_one(
            {"payment_reference": reference},
            {"$set": {"payment_status": "success", "status": OrderStatus.PAID}}
        )
        return {"status": True, "data": {"status": "success"}}
    
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.paystack.co/transaction/verify/{reference}",
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        )
        result = response.json()
        
        if result.get("status") and result["data"]["status"] == "success":
            await db.orders.update_one(
                {"payment_reference": reference},
                {"$set": {"payment_status": "success", "status": OrderStatus.PAID}}
            )
            await create_notification_internal(
                order["client_id"], "Payment Successful",
                f"Your payment for order #{order['id'][:8]} was successful", "payment"
            )
        
        return result

# ============= ADMIN ROUTES =============

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_parts = await db.spare_parts.count_documents({})
    pending_orders = await db.orders.count_documents({"status": OrderStatus.PENDING})
    paid_orders = await db.orders.count_documents({"payment_status": "success"})
    
    role_counts = {}
    for role in [UserRole.CLIENT, UserRole.VENDOR, UserRole.DISPATCHER, UserRole.ADMIN]:
        role_counts[role] = await db.users.count_documents({"role": role})
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_parts": total_parts,
        "pending_orders": pending_orders,
        "paid_orders": paid_orders,
        "users_by_role": role_counts
    }

@api_router.put("/admin/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    is_active: bool,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_active": is_active}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {'activated' if is_active else 'deactivated'}"}

# ============= HEALTH CHECK =============

@api_router.get("/")
async def root():
    return {"message": "SpareParts Hub API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        # Test the connection
        await client.admin.command('ping')
        logger.info("MongoDB connection established successfully")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        logger.error("Please ensure MongoDB is running and MONGO_URL is correct")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("MongoDB connection closed")
