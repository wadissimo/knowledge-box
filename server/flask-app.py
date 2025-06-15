from flask import Flask, request, jsonify, send_file
import psycopg2
import os
import re
from dotenv import load_dotenv
import gemini
from psycopg2.extras import RealDictCursor
import firebase_admin
from firebase_admin import credentials, auth
import redis
from functools import wraps
from datetime import timedelta
import json


load_dotenv() 
app = Flask(__name__)

DB_NAME = "serverdata.db"
CARDS_COLLECTION_PREVIEW = 10
MEDIA_FOLDER = "media/"

firebase_app = firebase_admin.initialize_app()

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
CACHE_TTL = 900

def verify_firebase_token_with_cache(id_token):
    print("verify_firebase_token_with_cache", id_token)
    cached = redis_client.get(f"firebase_token:{id_token}")
    if cached:
        print("cached", cached)
        return json.loads(cached)

    decoded = auth.verify_id_token(id_token)
    print("decoded", decoded)
    redis_client.setex(f"firebase_token:{id_token}", timedelta(seconds=CACHE_TTL), json.dumps(decoded))
    return decoded

def firebase_auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        id_token = auth_header.split(" ")[1]
        try:
            user = verify_firebase_token_with_cache(id_token)
            request.user = user
        except Exception as e:
            print("Error in firebase_auth_required", e)
            return jsonify({"error": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper

@app.route("/api/verify", methods=["GET"])
@firebase_auth_required
def verify():
    return jsonify({
        "uid": request.user["uid"],
        "email": request.user.get("email"),
        "message": "Token is valid"
    })

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn

@app.route('/collections/search', methods=['GET'])
def search_collections():
    try:
        print("search_collections called")
        query = request.args.get("query")
        query = sanitize_query(query)
        con = get_db_connection()

        results = find_fuzzy(con, query)
        
    except Exception as e:
        print("Error in search_collections", e)
        return jsonify({"results":None}), 500
    finally:
        con.close()
    return jsonify({"results":results}), 200

@app.route('/collections/preview/<int:id>', methods=['GET'])
def get_collection_preview(id):
    try:
        print("search_collections called", id)
        con = get_db_connection()
        
        cursor = con.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT * FROM collections WHERE id = %s", (id,))
        collection_row = cursor.fetchone()
        if not collection_row:
            return jsonify({"collection":None}), 200
        
        collection = dict(collection_row)
        cursor.execute("SELECT * FROM cards WHERE collectionId = %s limit %s", (id, CARDS_COLLECTION_PREVIEW))
        cards = cursor.fetchall()
        cards = [dict(row) for row in cards]
    except Exception as e:
        print("Error in get_collection_preview", e)
        return jsonify({"collection":None, "cards":None}), 500
    finally:
        con.close()
    return jsonify({"collection":collection, "cards":cards}), 200

@app.route('/collections/download/<int:id>', methods=['GET'])
def get_collection_download(id):
    try:
        con = get_db_connection()
        cursor = con.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT * FROM collections WHERE id = %s", (id,))
        collection_row = cursor.fetchone()
        if not collection_row:
            return jsonify({"collection":None}), 200
        
        collection = dict(collection_row)
        cursor.execute("SELECT * FROM cards WHERE collectionId = %s", (id,))
        cards = cursor.fetchall()
        cards = [dict(row) for row in cards]
    except Exception as e:
        print("Error in get_collection_download", e)
        return jsonify({"collection":None, "cards":None}), 500
    finally:
        con.close()
    return jsonify({"collection":collection, "cards":cards}), 200

@app.route('/collections/library', methods=['GET'])
def get_collection_library():
    try:
        con = get_db_connection()
        cursor = con.cursor(cursor_factory=RealDictCursor)

        # TODO: only fetch some of the collections per group
        # Fetch collections
        cursor.execute("SELECT * FROM collections")
        collections = cursor.fetchall()
        collections = [dict(row) for row in collections]

        # Fetch groups
        cursor.execute("SELECT * FROM groups")
        groups = cursor.fetchall()
        groups = [dict(row) for row in groups]

        # Fetch collection_groups
        cursor.execute("SELECT * FROM collection_groups")
        collection_groups = cursor.fetchall()
        collection_groups = [dict(row) for row in collection_groups]

    except Exception as e:
        print("Error in get_collection_library", e)
        return jsonify({"collections":None, "groups":None, "collection_groups":None}), 500
    finally:
        con.close()
    return jsonify({"collections":collections, "groups":groups, "collection_groups":collection_groups}), 200

@app.route('/sounds/download/<int:id>', methods=['GET'])
def get_sound_download(id):
    try:
        con = get_db_connection()
        cursor = con.cursor()
        cursor.execute("SELECT file FROM sounds WHERE id = %s", (id,))
        res = cursor.fetchone()
        if res:
            file_path = MEDIA_FOLDER + res[0]
            if os.path.exists(file_path):
                return send_file(file_path, as_attachment=True)
            else:
                return jsonify({'error': 'File not found'}), 404
        else:
            return jsonify({'error': 'Data not found'}), 404
    except Exception as e:
        print("Error in get_sound_download", e)
        return jsonify({'error': 'Data not found'}), 404
    finally:
        con.close()
    
@app.route('/images/download/<int:id>', methods=['GET'])
def get_image_download(id):
    try:
        con = get_db_connection()

        cursor = con.cursor()
        cursor.execute("SELECT file FROM images WHERE id = %s", (id,))
        res = cursor.fetchone()
        if res:
            file_path = MEDIA_FOLDER + res[0]
            if os.path.exists(file_path):
                return send_file(file_path, as_attachment=True, download_name=res[0])
            else:
                return jsonify({'error': 'File not found'}), 404
        else:
            return jsonify({'error': 'Data not found'}), 404
    except Exception as e:
        print("Error in get_image_download", e)
        return jsonify({'error': 'Data not found'}), 404
    finally:
        con.close()


def sanitize_query(query):
    # Keep numbers and letters, remove special characters except spaces
    return re.sub(r'[^\w\s\d]', '', query)

# TODO: find a better alternative
def find_match(con, query):
    cursor = con.cursor()
    search_query = """SELECT collections.*
                        FROM collections_fts
                        JOIN collections ON collections_fts.rowid = collections.rowid
                        WHERE collections_fts MATCH %s"""
    cursor.execute(search_query, (query,))
    results = cursor.fetchall()
    collections = [dict(row) for row in results]
    return collections

def find_fuzzy(con, query):
    cursor = con.cursor(cursor_factory=RealDictCursor)
    words = query.split()
    like_clauses = " OR ".join([f"name ILIKE %s OR description ILIKE %s OR tags ILIKE %s" for _ in words])
    search_query = f"SELECT * FROM collections WHERE {like_clauses}"

    params = [f"%{word}%" for word in words for _ in range(3)]

    cursor.execute(search_query, params)
    results = cursor.fetchall()

    collections = [dict(row) for row in results]
    return collections


def search_collections(query):
    # Connect to the SQLite database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Prepare the search query
    search_query = f"SELECT * FROM collections_fts WHERE collections_fts MATCH %s"

    # Execute the search query
    cursor.execute(search_query, (query,))
    results = cursor.fetchall()

    # Close the connection  
    conn.close()

    return results


FAKE_API = False
DEFAULT_LANGUAGE = "English"
SECRET_KEY = "jclKjUk123dsahkjdhkjsa67FD213sadHAFDUd23213bvcBKJQhjgf12312"
MODEL = "gemini"


@app.route('/api/ai/chat', methods=['POST'])
def chat():
    try:
        print("chat")
        data = request.get_json()
        message = data.get("message")
        key = data.get("key")
        lang = data.get("language", DEFAULT_LANGUAGE)
        if key != SECRET_KEY:
            print("wrong key")
            return jsonify({"result":"error"}), 200
        history = data.get("history")
        print("history", history)

        # TODO: function calling
        if FAKE_API:
            resp_json = {
                "result":"ok",
                "message": "Fake response from AI",
            }
        else:
            if MODEL == "chatgpt":
                pass
            else:
                resp_json = gemini.chat(message, lang, history)
            resp_json[ "result"] = "ok"
    except Exception as e:
        print("Error in chat", e)
        return jsonify({"result":"error"}), 200


    return jsonify(resp_json)


if __name__ == '__main__':
    #app.run(debug=True, if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000, host='0.0.0.0')
