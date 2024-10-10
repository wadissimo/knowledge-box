from flask import Flask, request, jsonify, send_file
import sqlite3
import os

app = Flask(__name__)

DB_NAME = "serverdata.db"
CARDS_COLLECTION_PREVIEW = 10
MEDIA_FOLDER = "media/"


@app.route('/collections/search', methods=['GET'])
def search_collections():
    print("search_collections called")
    query = request.args.get("query")

    con = sqlite3.connect(DB_NAME)
    con.row_factory = sqlite3.Row  # This will return rows as dictionaries
    results = find_match(con, query)
    print(results)
    if len(results) == 0: #TODO: threshold
        # search for fuzzy results
        results = find_fuzzy(con, query)

    # Close the connection
    con.close()

    return jsonify({"results":results}), 200

@app.route('/collections/preview/<int:id>', methods=['GET'])
def get_collection_preview(id):
    print("search_collections called", id)
    con = sqlite3.connect(DB_NAME)
    con.row_factory = sqlite3.Row  # This will return rows as dictionaries
    cursor = con.cursor()

    cursor.execute("SELECT * FROM collections WHERE id = ?", (id,))
    collection_row = cursor.fetchone()
    if not collection_row:
        return jsonify({"collection":None}), 200
    
    collection = dict(collection_row)
    cursor.execute("SELECT * FROM cards WHERE collectionId = ? limit ?", (id, CARDS_COLLECTION_PREVIEW))
    cards = cursor.fetchall()
    cards = [dict(row) for row in cards]
    return jsonify({"collection":collection, "cards":cards}), 200

@app.route('/collections/download/<int:id>', methods=['GET'])
def get_collection_download(id):
    con = sqlite3.connect(DB_NAME)
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    cursor.execute("SELECT * FROM collections WHERE id = ?", (id,))
    collection_row = cursor.fetchone()
    if not collection_row:
        return jsonify({"collection":None}), 200
    
    collection = dict(collection_row)
    cursor.execute("SELECT * FROM cards WHERE collectionId = ?", (id,))
    cards = cursor.fetchall()
    cards = [dict(row) for row in cards]

    return jsonify({"collection":collection, "cards":cards}), 200



@app.route('/sounds/download/<int:id>', methods=['GET'])
def get_sound_download(id):
    con = sqlite3.connect(DB_NAME)

    cursor = con.cursor()
    cursor.execute("SELECT file FROM sounds WHERE id = ?", (id,))
    res = cursor.fetchone()
    if res:
        file_path = MEDIA_FOLDER + res[0]
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    else:
        return jsonify({'error': 'Data not found'}), 404
    


def find_match(con, query):
    cursor = con.cursor()
    search_query = """SELECT collections.*
                        FROM collections_fts
                        JOIN collections ON collections_fts.rowid = collections.rowid
                        WHERE collections_fts MATCH ?"""
    cursor.execute(search_query, (query,))
    results = cursor.fetchall()
    collections = [dict(row) for row in results]
    return collections

def find_fuzzy(con, query):
    cursor = con.cursor()
    words = query.split()
    like_clauses = " OR ".join([f"name LIKE ? OR description LIKE ? OR tags LIKE ?" for _ in words])
    search_query = f"SELECT * FROM collections WHERE {like_clauses}"

    params = [f"%{word}%" for word in words for _ in range(3)]

    cursor.execute(search_query, params)
    results = cursor.fetchall()

    collections = [dict(row) for row in results]
    return collections


def search_collections(query):
    # Connect to the SQLite database
    conn = sqlite3.connect('your_database.db')
    cursor = conn.cursor()

    # Prepare the search query
    search_query = f"SELECT * FROM collections_fts WHERE collections_fts MATCH ?"

    # Execute the search query
    cursor.execute(search_query, (query,))
    results = cursor.fetchall()

    # Close the connection
    conn.close()

    return results


if __name__ == '__main__':
    app.run(debug=True)