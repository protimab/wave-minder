from fastapi import FastAPI,HTTPException, status, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import database
import auth

# REQUEST MODELS
class SignupRequest(BaseModel):
    email: str
    name: str
    password: str
    location: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

# FASTAPI
async def lifespan(app: FastAPI):
    database.init_database()
    yield

app = FastAPI(title="WaveMinder", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROOT ENDPOINT
@app.get("/")
def root():
    return {"message": "WaveMinder"}

# SIGNUP ENDPOINT
@app.post("/signup")
def signup(request: SignupRequest):
    existing_user = database.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # hash password
    hashed_password = auth.get_password_hash(request.password)

    # creater user in database
    user_id = database.create_user(
        email=request.email,
        name=request.name,
        password=hashed_password,
        location=request.location
    )

    return {
        "id": user_id,
        "email": request.email,
        "name": request.name
    }


# LOGIN ENDPOINT
@app.post("/login")
def login(request: LoginRequest):
    user = auth.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(user_email=user[1])  # index 1 -> email
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# TESTING
def test_db():
    try:
        conn = database.get_db_connection()
        users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        sightings = conn.execute("SELECT COUNT(*) FROM marine_sightings").fetchone()[0]
        conn.close()
        return {"users": users, "sightings": sightings}
    except Exception as e:
        return {"error": str(e)}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)