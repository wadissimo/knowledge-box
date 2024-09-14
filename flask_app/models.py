class Card:
    def __init__(self, id, frontText, backText):
        self.id = id
        self.frontText = frontText
        self.backText = backText

    def to_dict(self):
        return {
            "id": self.id,
            "frontText": self.frontText,
            "backText": self.backText
        }

class Collection:
    def __init__(self, id, name, cards):
        self.id = id
        self.name = name
        self.cards = cards

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "cards": [card.to_dict() for card in self.cards]
        }
