import os
import re
import json
from datetime import timedelta

import gemini
import psycopg2
from psycopg2.extras import RealDictCursor
import redis
import firebase_admin
from firebase_admin import auth
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

# Load environment
load_dotenv()

# Constants
DB_NAME = "serverdata.db"
CARDS_COLLECTION_PREVIEW = 10
MEDIA_FOLDER = "media/"
CACHE_TTL = 900
FAKE_API = False
DEFAULT_LANGUAGE = "English"
SECRET_KEY = os.getenv("SECRET_KEY")
MODEL = os.getenv("MODEL", "gemini")

# Initialize Firebase
firebase_app = firebase_admin.initialize_app()

# Initialize Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=0,
    decode_responses=True
)

app = FastAPI()

### Utility functions ###

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


def sanitize_query(query: str) -> str:
    return re.sub(r'[^\w\s\d]', '', query)


def find_fuzzy(con, query: str) -> list:
    cursor = con.cursor(cursor_factory=RealDictCursor)
    words = query.split()
    like_clauses = " OR ".join([
        "name ILIKE %s OR description ILIKE %s OR tags ILIKE %s"
        for _ in words
    ])
    search_query = f"SELECT * FROM collections WHERE {like_clauses}"
    params = [f"%{word}%" for word in words for _ in range(3)]
    cursor.execute(search_query, params)
    return [dict(row) for row in cursor.fetchall()]


### Firebase auth dependency ###

def verify_token_with_cache(id_token: str) -> dict:
    cached = redis_client.get(f"firebase_token:{id_token}")
    if cached:
        return json.loads(cached)
    decoded = auth.verify_id_token(id_token)
    redis_client.setex(f"firebase_token:{id_token}", timedelta(seconds=CACHE_TTL), json.dumps(decoded))
    return decoded


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Missing or invalid token")
    token = auth_header.split()[1]
    try:
        return verify_token_with_cache(token)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail=str(e))


### Routes ###

@app.get("/api/verify")
async def verify(user: dict = Depends(get_current_user)):
    return {
        "uid": user.get("uid"),
        "email": user.get("email"),
        "message": "Token is valid"
    }


@app.get("/collections/search")
def search_collections(query: str):
    try:
        q = sanitize_query(query)
        con = get_db_connection()
        results = find_fuzzy(con, q)
    except Exception:
        raise HTTPException(status_code=500, detail="Error searching collections")
    finally:
        con.close()
    return {"results": results}


@app.get("/collections/preview/{collection_id}")
def get_collection_preview(collection_id: int):
    try:
        con = get_db_connection()
        cursor = con.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM collections WHERE id = %s", (collection_id,))
        coll = cursor.fetchone()
        if not coll:
            return {"collection": None}
        collection = dict(coll)
        cursor.execute(
            "SELECT * FROM cards WHERE collectionId = %s LIMIT %s",
            (collection_id, CARDS_COLLECTION_PREVIEW)
        )
        cards = [dict(row) for row in cursor.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching preview")
    finally:
        con.close()
    return {"collection": collection, "cards": cards}


@app.get("/collections/download/{collection_id}")
def get_collection_download(collection_id: int):
    try:
        con = get_db_connection()
        cursor = con.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM collections WHERE id = %s", (collection_id,))
        coll = cursor.fetchone()
        if not coll:
            return {"collection": None}
        collection = dict(coll)
        cursor.execute("SELECT * FROM cards WHERE collectionId = %s", (collection_id,))
        cards = [dict(row) for row in cursor.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching download")
    finally:
        con.close()
    return {"collection": collection, "cards": cards}


@app.get("/collections/library")
def get_collection_library():
    try:
        con = get_db_connection()
        cursor = con.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM collections")
        collections = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM groups")
        groups = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM collection_groups")
        cgroups = [dict(r) for r in cursor.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching library")
    finally:
        con.close()
    return {"collections": collections, "groups": groups, "collection_groups": cgroups}


@app.get("/sounds/download/{sound_id}")
def get_sound_download(sound_id: int):
    try:
        print("/sounds/download/", sound_id)
        con = get_db_connection()
        cursor = con.cursor()
        cursor.execute("SELECT file FROM sounds WHERE id = %s", (sound_id,))
        res = cursor.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Data not found")
        path = os.path.join(MEDIA_FOLDER, res[0])
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(path, filename=res[0], media_type='application/octet-stream')
    except Exception as e:
        print("Error in get_sound_download", e)
        raise HTTPException(status_code=500, detail="Error fetching sound")
    finally:
        con.close()


@app.get("/images/download/{image_id}")
def get_image_download(image_id: int):
    try:
        con = get_db_connection()
        cursor = con.cursor()
        cursor.execute("SELECT file FROM images WHERE id = %s", (image_id,))
        res = cursor.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Data not found")
        path = os.path.join(MEDIA_FOLDER, res[0])
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(path, filename=res[0], media_type='application/octet-stream')
    finally:
        con.close()


### AI Chat Endpoint ###

class ChatRequest(BaseModel):
    message: str
    key: str
    language: str = DEFAULT_LANGUAGE
    history: list = []


@app.post("/api/ai/chat")
def chat(req: ChatRequest):
    if req.key != SECRET_KEY:
        return JSONResponse(status_code=200, content={"result": "error"})
    try:
        if FAKE_API:
            resp = {"result": "ok", "message": "Fake response from AI"}
        else:
            if MODEL.lower() == "chatgpt":
                # integrate ChatGPT if needed
                resp = {}
            else:
                resp = gemini.chat(req.message, req.language, req.history)
            resp["result"] = "ok"
    except Exception:
        return JSONResponse(status_code=200, content={"result": "error"})
    return resp


# Entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
