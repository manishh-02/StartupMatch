import json
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Apne models aur database imports
from app.core.database import engine, Base, get_db
from app.models import user
from app.models.user import Message  
from app.api import auth, users

# ==========================================
# ⚠️ DATABASE SETUP
# ==========================================
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Startup Founder Matching API",
    description="API for matching startup founders with Real-Time WebSockets.",
    version="1.0.0"
)

# ==========================================
# INDUSTRY STANDARD: CORS SETUP
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Router Registration
app.include_router(auth.router)
app.include_router(users.router)

# ==========================================
# ⚡ WEBSOCKET CONNECTION MANAGER (THE BRAIN)
# ==========================================
class ConnectionManager:
    def __init__(self):
        # Yeh dictionary track karegi ki kaunsa user (user_id) kis socket par online hai
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ SYSTEM LOG: User {user_id} Online Aa Gaya Hai!")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"❌ SYSTEM LOG: User {user_id} Offline Chala Gaya.")

    async def send_personal_message(self, message: str, user_id: int):
        # Agar user online hai, toh usko turant message bhej do
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

# Global Manager Instance
manager = ConnectionManager()

# ==========================================
# ⚡ REAL-TIME CHAT WEBSOCKET ENDPOINT
# ==========================================
@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: int):
    # 1. User ko connect karo
    await manager.connect(websocket, user_id)
    
    # 2. Database ka connection open karo
    db = next(get_db())
    
    try:
        while True:
            # 3. Frontend se naya message aane ka wait karo
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            receiver_id = payload.get("receiver_id")
            content = payload.get("content")
            
            # 4. Message ko Database mein Save karo (Permanent History ke liye)
            new_message = Message(
                sender_id=user_id, 
                receiver_id=receiver_id, 
                content=content
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)
            
            # 5. Message ko sahi JSON format mein pack karo
            message_response = {
                "id": new_message.id,
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": new_message.timestamp.isoformat()
            }
            
            json_response = json.dumps(message_response)
            
            # 6. Jisko bheja hai, uski screen par push karo (Agar wo online hai)
            await manager.send_personal_message(json_response, receiver_id)
            
            # 7. Jisne bheja hai, uski screen par bhi push karo taaki usko dikhe
            await manager.send_personal_message(json_response, user_id)
            
    except WebSocketDisconnect:
        # Jab user tab close kar de toh usko offline mark kardo
        manager.disconnect(user_id)
    finally:
        # DB Connection close karna zaroori hai memory leak bachane ke liye
        db.close()

# ==========================================
# ROOT ENDPOINT
# ==========================================
@app.get("/")
async def health_check():
    return {
        "status": "success",
        "message": "Welcome to StartupMatch API. Real-Time WebSockets are Live! ⚡"
    }