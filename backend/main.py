from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database

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

@app.get("/")
def root():
    return {"message": "WaveMinder"}

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