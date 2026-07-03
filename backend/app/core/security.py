from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt

# ==========================================
# ADVANCED SECURITY CONFIGURATION
# ==========================================
# Real-world mein yeh SECRET_KEY .env file mein hoti hai aur bohot complex hoti hai.
# Is key ke bina koi token decode ya fake nahi kar sakta.
SECRET_KEY = "super-secret-extreme-pro-level-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # Token 7 din tak valid rahega

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Password ko one-way secure hash mein convert karta hai"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Login ke waqt plain password ko hash se compare karta hai"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """
    Ek secure JSON Web Token (JWT) generate karta hai.
    'data' mein hum user ki email ya ID bhejenge (Payload).
    """
    to_encode = data.copy()
    
    # Token expire hone ka time set karna (Security best practice)
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Header + Payload + Secret Key = Secure JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt