from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="founder")
    is_active = Column(Boolean, default=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver", cascade="all, delete-orphan")
    
    # Relationships for Idea and Workspaces
    ideas = relationship("Idea", back_populates="founder", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    primary_role = Column(String, nullable=True)     
    startup_stage = Column(String, nullable=True)    
    commitment_level = Column(String, nullable=True) 
    project_plan = Column(Text, nullable=True)       
    
    bio = Column(Text, nullable=True)
    tech_stack = Column(String, nullable=True)
    looking_for = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)

    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    producthunt_url = Column(String, nullable=True)
    dribbble_url = Column(String, nullable=True)
    medium_url = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

# 💡 IDEA BOARD TABLE
class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    founder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # FIX: Mapped correctly to founder_id
    title = Column(String, nullable=False)
    elevator_pitch = Column(Text, nullable=False)
    target_audience = Column(String, nullable=True)
    seeking = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    founder = relationship("User", back_populates="ideas")

# 🚀 STEP 3: PRIVATE WORKSPACE & KANBAN TABLES
class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, default="Member") # 'Admin' or 'Member'

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="todo") # 'todo', 'in_progress', 'done'
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ⚖️ STEP 4: EQUITY SPLIT AGREEMENTS TABLE
class EquitySplit(Base):
    __tablename__ = "equity_splits"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    equity_percentage = Column(Float, nullable=False)
    role_contribution = Column(String, nullable=True) # e.g., 'Idea + 50k Capital'
    created_at = Column(DateTime(timezone=True), server_default=func.now())