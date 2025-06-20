from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Card, Collection

app = Flask(__name__)
CORS(app)  # Allow requests from your React app

# Mock data for collections
collections = [
    Collection(id=1, name="Collection 1", cards=[
        Card(id=1, frontText="Front 1", backText="Back 1"),
        Card(id=2, frontText="Front 2", backText="Back 2"),
    ]),
    # Add more collections as needed
]

@app.route('/collections/<int:collection_id>/cards', methods=['GET'])
def get_cards(collection_id):
    print("get_cards called")
    collection = next((c for c in collections if c.id == collection_id), None)
    if collection:
        return jsonify([card.to_dict() for card in collection.cards])
    return jsonify([]), 404

@app.route('/collections/<int:collection_id>/cards', methods=['POST'])
def add_card(collection_id):
    data = request.json
    collection = next((c for c in collections if c.id == collection_id), None)
    if collection:
        new_card = Card(id=len(collection.cards) + 1, frontText=data['frontText'], backText=data['backText'])
        collection.cards.append(new_card)
        return jsonify(new_card.to_dict()), 201
    return jsonify({"error": "Collection not found"}), 404

@app.route('/collections/<int:collection_id>/cards/<int:card_id>', methods=['PUT'])
def update_card(collection_id, card_id):
    data = request.json
    collection = next((c for c in collections if c.id == collection_id), None)
    if collection:
        card = next((card for card in collection.cards if card.id == card_id), None)
        if card:
            card.frontText = data['frontText']
            card.backText = data['backText']
            return jsonify(card.to_dict())
    return jsonify({"error": "Card not found"}), 404

@app.route('/collections/<int:collection_id>/cards/<int:card_id>', methods=['DELETE'])
def delete_card(collection_id, card_id):
    collection = next((c for c in collections if c.id == collection_id), None)
    if collection:
        collection.cards = [card for card in collection.cards if card.id != card_id]
        return '', 204
    return jsonify({"error": "Collection not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
