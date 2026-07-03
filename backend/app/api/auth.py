from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import user_schema
from app.models import user as user_model
from app.core import security

router = APIRouter(prefix="/auth", tags=["Authentication"])

# 1. SIGNUP API (Jo humne pehle banayi thi)
@router.post("/signup", response_model=user_schema.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="User with this email already exists."
        )

    hashed_pwd = security.get_password_hash(user.password)
    
    new_user = user_model.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_pwd,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ==========================================
# 2. LOGIN API (Advanced JWT Implementation)
# ==========================================
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    User login karega aur use ek JWT Access Token milega.
    """
    # Step 1: Database mein user dhoondho (form_data.username mein email aayegi)
    db_user = db.query(user_model.User).filter(user_model.User.email == form_data.username).first()
    
    # Step 2: User nahi mila ya password galat hai (Dono case mein same error dete hain taaki hacker guess na kar paye)
    if not db_user or not security.verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Step 3: Agar sab sahi hai, toh JWT Token banao
    access_token = security.create_access_token(
        data={"sub": db_user.email, "role": db_user.role} # 'sub' standard hai subject (user) ke liye
    )
    
    # Step 4: Token return karo
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role
        }
    }