from pydantic import BaseModel, EmailStr
from typing import Optional

# 1. API Input (Jab naya user aayega, toh humein usse kya-kya chahiye)
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr  # Yeh apne aap check karega ki email valid hai ya nahi
    password: str
    role: str  # Jaise: "founder", "developer", "designer"

# 2. API Output (Database se save hone ke baad hum wapas kya bhejenge)
# Industry Rule: Kabhi bhi response mein 'password' ya 'hash' wapas nahi bhejte, isliye wo yahan nahi hai.
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        # Yeh line FastAPI ko bolti hai: "SQLAlchemy database object ko JSON mein convert kar do"
        from_attributes = True