from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime

# ✨ IMPORTING ALL MODELS ✨
from app.models.user import User, Profile, Message, Idea, Workspace, WorkspaceMember, Task, EquitySplit
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/users", tags=["Users Profile, Matchmaking, Chat, Workspaces & Ideas"])

# ==========================================
# 1. PYDANTIC SCHEMAS (ALL MODULES)
# ==========================================

# Profile Schemas
class ProfileUpdate(BaseModel):
    primary_role: str
    startup_stage: str
    commitment_level: str
    project_plan: str
    bio: str
    tech_stack: str
    looking_for: str
    experience_years: int
    
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    producthunt_url: Optional[str] = None
    dribbble_url: Optional[str] = None
    medium_url: Optional[str] = None

# Chat Schemas
class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

# Idea Board Schemas
class IdeaCreate(BaseModel):
    title: str
    elevator_pitch: str
    target_audience: str
    seeking: str

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    elevator_pitch: Optional[str] = None
    target_audience: Optional[str] = None
    seeking: Optional[str] = None

# Workspace & Task Schemas
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    status: str = "todo"
    assigned_to: Optional[int] = None

class TaskUpdateStatus(BaseModel):
    status: str

# Equity Schemas
class FounderContribution(BaseModel):
    user_id: int
    brings_idea: bool = False
    is_technical: bool = False
    time_commitment: str = "Full-Time" 
    capital_invested: float = 0.0

class EquityCalculateRequest(BaseModel):
    founders: List[FounderContribution]


# ==========================================
# 2. SYNERGY MATCHING ALGORITHM
# ==========================================
def calculate_synergy_score(profile1: Profile, profile2: Profile) -> int:
    if not profile1 or not profile2: return 50 
    score = 25 
    tech_roles = ["Technical", "Engineering", "Code"]
    business_roles = ["Business/Ops", "Growth/Marketing", "Sales", "Product"]
    r1, r2 = profile1.primary_role, profile2.primary_role
    
    if r1 != r2:
        if (r1 in tech_roles and r2 in business_roles) or (r2 in tech_roles and r1 in business_roles):
            score += 40 
        else: score += 25 
    else: score += 10 
        
    if profile1.startup_stage == profile2.startup_stage: score += 15
    else: score += 5
        
    if profile1.commitment_level == profile2.commitment_level: score += 20
    elif "Full-Time" in str(profile1.commitment_level) and "Full-Time" in str(profile2.commitment_level): score += 15
        
    return min(score, 99) 


# ==========================================
# 3. PROFILE & FEED APIS
# ==========================================
@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id, "full_name": current_user.full_name, "email": current_user.email,
        "role": current_user.role, "profile": user_profile 
    }

@router.post("/profile")
def upsert_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if existing_profile:
        for key, value in profile_data.dict().items(): setattr(existing_profile, key, value)
    else:
        new_profile = Profile(user_id=current_user.id, **profile_data.dict())
        db.add(new_profile)
    db.commit()
    return {"status": "success", "message": "Advanced Profile updated successfully!"}

@router.get("/feed")
def get_founder_feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users_with_profiles = db.query(User).join(Profile).filter(User.id != current_user.id).all()
    current_user_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    feed_data = []
    for u in users_with_profiles:
        synergy = calculate_synergy_score(current_user_profile, u.profile)
        feed_data.append({
            "id": u.id, "full_name": u.full_name, "role": u.role, "synergy_score": synergy, 
            "profile": {
                "primary_role": u.profile.primary_role, "startup_stage": u.profile.startup_stage,
                "commitment_level": u.profile.commitment_level, "project_plan": u.profile.project_plan,
                "bio": u.profile.bio, "tech_stack": u.profile.tech_stack, "looking_for": u.profile.looking_for,
                "experience_years": u.profile.experience_years, "linkedin_url": u.profile.linkedin_url,
                "github_url": u.profile.github_url, "twitter_url": u.profile.twitter_url,
                "portfolio_url": u.profile.portfolio_url, "producthunt_url": u.profile.producthunt_url,
                "dribbble_url": u.profile.dribbble_url, "medium_url": u.profile.medium_url
            }
        })
    feed_data.sort(key=lambda x: x["synergy_score"], reverse=True)
    return feed_data


# ==========================================
# 4. CHAT APIS (WITH DELETE FEATURE)
# ==========================================
@router.get("/chat/{other_user_id}", response_model=List[MessageResponse])
def get_chat_history(other_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if other_user_id == current_user.id: return []
    messages = db.query(Message).filter(or_(
        (Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id),
        (Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id)
    )).order_by(Message.timestamp.asc()).all()
    return messages

@router.post("/chat/read/{sender_id}")
def mark_messages_read(sender_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Message).filter(Message.sender_id == sender_id, Message.receiver_id == current_user.id, Message.is_read == False).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"status": "success"}

# ✨ NEW: Delete specific message
@router.delete("/messages/{message_id}")
def delete_message(message_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg: raise HTTPException(status_code=404, detail="Message not found")
    if msg.sender_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    
    db.delete(msg)
    db.commit()
    return {"status": "success", "message": "Message deleted"}

@router.get("/conversations")
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sent_to = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct()
    received_from = db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct()
    contacted_ids = {row[0] for row in sent_to}.union({row[0] for row in received_from})
    if not contacted_ids: return []
    
    conversations = db.query(User).join(Profile).filter(User.id.in_(contacted_ids)).all()
    result = []
    for u in conversations:
        unread_count = db.query(Message).filter(Message.sender_id == u.id, Message.receiver_id == current_user.id, Message.is_read == False).count()
        result.append({
            "id": u.id, "full_name": u.full_name, "role": u.profile.primary_role or "Founder",
            "avatar": u.full_name[0].upper(), "unread_count": unread_count 
        })
    return result


# ==========================================
# 5. IDEA BOARD APIS (WITH EDIT/DELETE)
# ==========================================
@router.post("/ideas")
def post_idea(idea: IdeaCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_idea = Idea(founder_id=current_user.id, title=idea.title, elevator_pitch=idea.elevator_pitch, target_audience=idea.target_audience, seeking=idea.seeking)
    db.add(new_idea)
    db.commit()
    return {"status": "success", "message": "Startup Idea Deployed!"}

@router.get("/ideas")
def get_all_ideas(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ideas = db.query(Idea, User.full_name, Profile.primary_role).join(User, Idea.founder_id == User.id).outerjoin(Profile, User.id == Profile.user_id).order_by(Idea.created_at.desc()).all()
    result = []
    for idea, founder_name, role in ideas:
        result.append({
            "id": idea.id, "founder_id": idea.founder_id, "founder_name": founder_name, "founder_role": role or "Founder",
            "title": idea.title, "elevator_pitch": idea.elevator_pitch, "target_audience": idea.target_audience,
            "seeking": idea.seeking, "timestamp": idea.created_at.isoformat()
        })
    return result

# ✨ NEW: Edit Idea
@router.put("/ideas/{idea_id}")
def update_idea(idea_id: int, idea_update: IdeaUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea: raise HTTPException(status_code=404, detail="Idea not found")
    if idea.founder_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    
    if idea_update.title: idea.title = idea_update.title
    if idea_update.elevator_pitch: idea.elevator_pitch = idea_update.elevator_pitch
    if idea_update.target_audience: idea.target_audience = idea_update.target_audience
    if idea_update.seeking: idea.seeking = idea_update.seeking
    
    db.commit()
    return {"status": "success", "message": "Idea updated successfully"}

# ✨ NEW: Delete Idea
@router.delete("/ideas/{idea_id}")
def delete_idea(idea_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea: raise HTTPException(status_code=404, detail="Idea not found")
    if idea.founder_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(idea)
    db.commit()
    return {"status": "success", "message": "Idea deleted successfully"}


# ==========================================
# 6. WORKSPACE & KANBAN APIS (WITH EDIT/DELETE)
# ==========================================
@router.post("/workspaces")
def create_workspace(ws: WorkspaceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_ws = Workspace(name=ws.name, description=ws.description, created_by=current_user.id)
    db.add(new_ws)
    db.commit()
    db.refresh(new_ws)
    
    member = WorkspaceMember(workspace_id=new_ws.id, user_id=current_user.id, role="Admin")
    db.add(member)
    db.commit()
    return {"status": "success", "workspace_id": new_ws.id, "message": "Workspace Created Successfully!"}

@router.get("/workspaces")
def get_my_workspaces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    my_workspaces = db.query(Workspace).join(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).all()
    result = []
    for ws in my_workspaces:
        task_count = db.query(Task).filter(Task.workspace_id == ws.id).count()
        
        # Check if current user is admin
        is_admin = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws.id, WorkspaceMember.user_id == current_user.id, WorkspaceMember.role == "Admin").first() is not None
        
        result.append({
            "id": ws.id, "name": ws.name, "description": ws.description,
            "created_at": ws.created_at.isoformat(), "task_count": task_count,
            "is_admin": is_admin
        })
    return result

# ✨ NEW: Edit Workspace
@router.put("/workspaces/{workspace_id}")
def update_workspace(workspace_id: int, ws_update: WorkspaceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws: raise HTTPException(status_code=404, detail="Workspace not found")
    
    is_admin = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == current_user.id, WorkspaceMember.role == "Admin").first()
    if not is_admin: raise HTTPException(status_code=403, detail="Admin rights required")

    if ws_update.name: ws.name = ws_update.name
    if ws_update.description: ws.description = ws_update.description
    db.commit()
    return {"status": "success", "message": "Workspace Updated"}

# ✨ NEW: Delete Workspace
@router.delete("/workspaces/{workspace_id}")
def delete_workspace(workspace_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws: raise HTTPException(status_code=404, detail="Workspace not found")
    
    is_admin = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == current_user.id, WorkspaceMember.role == "Admin").first()
    if not is_admin: raise HTTPException(status_code=403, detail="Admin rights required to delete workspace")

    db.delete(ws)
    db.commit()
    return {"status": "success", "message": "Workspace Deleted"}

@router.post("/workspaces/{workspace_id}/tasks")
def create_task(workspace_id: int, task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == current_user.id).first()
    if not is_member: raise HTTPException(status_code=403, detail="Not authorized")
    new_task = Task(workspace_id=workspace_id, title=task.title, status=task.status, assigned_to=task.assigned_to)
    db.add(new_task)
    db.commit()
    return {"status": "success", "message": "Task Added"}

@router.get("/workspaces/{workspace_id}/tasks")
def get_workspace_tasks(workspace_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == current_user.id).first()
    if not is_member: raise HTTPException(status_code=403, detail="Access Denied")
    tasks = db.query(Task).filter(Task.workspace_id == workspace_id).all()
    result = [{"id": t.id, "title": t.title, "status": t.status, "assigned_to": t.assigned_to} for t in tasks]
    return result

@router.put("/tasks/{task_id}/status")
def update_task_status(task_id: int, task_update: TaskUpdateStatus, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    
    is_member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == task.workspace_id, WorkspaceMember.user_id == current_user.id).first()
    if not is_member: raise HTTPException(status_code=403, detail="Access Denied")

    task.status = task_update.status
    db.commit()
    return {"status": "success"}

# ✨ NEW: Delete Task
@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    
    is_member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == task.workspace_id, WorkspaceMember.user_id == current_user.id).first()
    if not is_member: raise HTTPException(status_code=403, detail="Access Denied")

    db.delete(task)
    db.commit()
    return {"status": "success", "message": "Task Deleted"}


# ==========================================
# 7. DYNAMIC EQUITY CALCULATOR
# ==========================================
@router.post("/workspaces/{workspace_id}/calculate-equity")
def calculate_dynamic_equity(workspace_id: int, payload: EquityCalculateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI Algorithm to split startup equity fairly based on contributions."""
    
    # Check if user is part of the workspace
    is_member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == current_user.id).first()
    if not is_member: raise HTTPException(status_code=403, detail="Access Denied")

    total_points = 0
    founder_points = {}
    
    for founder in payload.founders:
        pts = 10 # Base founder weight
        
        if founder.brings_idea: pts += 20
        if founder.is_technical: pts += 15
        
        if founder.time_commitment == "Full-Time": pts += 25
        elif founder.time_commitment == "Part-Time": pts += 5
        
        # 1 Point assigned per $1,000 invested (Scales down capital dependency)
        pts += (founder.capital_invested / 1000.0) 
        
        founder_points[founder.user_id] = pts
        total_points += pts
        
    results = []
    if total_points > 0:
        for uid, pts in founder_points.items():
            results.append({
                "user_id": uid,
                "suggested_equity_percentage": round((pts / total_points) * 100, 2),
                "calculation_points": pts
            })
            
    return {"status": "success", "workspace_id": workspace_id, "algorithm_results": results}