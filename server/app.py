from flask import Flask, request, jsonify
import sqlite3
app = Flask(__name__)

DB_NAME = "serverdata.db"

@app.route('/collections/search', methods=['GET'])
def search_collections():
    print("search_collections called")
    query = request.args.get("query")

    con = sqlite3.connect(DB_NAME)
    results = find_match(con, query)
    print(results)
    if len(results) == 0: #TODO: threshold
        # search for fuzzy results
        results = find_fuzzy(con, query)

    # Close the connection
    con.close()

    return jsonify({"results":results}), 200

def find_match(con, query):
    cursor = con.cursor()
    search_query = f"SELECT * FROM collections_fts WHERE collections_fts MATCH ?"
    cursor.execute(search_query, (query,))
    results = cursor.fetchall()
    return results

def find_fuzzy(con, query):
    cursor = con.cursor()
    words = query.split()
    like_clauses = " OR ".join([f"name LIKE ? OR description LIKE ? OR tags LIKE ?" for _ in words])
    search_query = f"SELECT * FROM collections WHERE {like_clauses}"

    params = [f"%{word}%" for word in words for _ in range(3)]

    cursor.execute(search_query, params)
    results = cursor.fetchall()

    return results


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