from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM

# Yeh FastAPI ko batata hai ki client ko token kahan se milega
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Yeh function har protected API request se pehle chalega.
    Token ko decode karega aur database se asli user nikal kar dega.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token ko open karo
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        # Agar token expire ho gaya ya hacker ne badal diya
        raise credentials_exception
        
    # Database se user dhoondho
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user