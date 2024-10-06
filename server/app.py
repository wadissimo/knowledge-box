from flask import Flask, request, jsonify
import sqlite3
app = Flask(__name__)


@app.route('/collections/search', methods=['GET'])
def search_collections():
    print("get_cards called")

    return jsonify([]), 404


if __name__ == '__main__':
    app.run(debug=True)