from fastapi import FastAPI,HTTPException, status, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import database
import auth
import schemas

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
@app.post("/signup", response_model=schemas.UserResponse)
def signup(request: schemas.UserCreate):
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

    return schemas.UserResponse(
        id=user_id,
        email=request.email,
        name=request.name,
        location=request.location,
        created_at=""  
    )


# LOGIN ENDPOINT
@app.post("/login", response_model=schemas.Token)
def login(request: schemas.UserCreate):
    user = auth.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(user_email=user[1])  # index 1 -> email
    return schemas.Token(access_token=access_token, token_type="bearer")

# PROTECTED ENDPOINT
@app.get("/me", response_model=schemas.UserResponse)
def read_me(current_user=Depends(auth.get_current_user)):
    return schemas.UserResponse(
        id=current_user[0],
        email=current_user[1],
        name=current_user[2],
        location=current_user[4],
        created_at=str(current_user[6])
    )

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