import demjson
import sqlite3

data = demjson.decode_file('capitals.data', encoding="utf-8")

# with open('capitals.data', mode="r", encoding="utf-8") as f:
#     js_data = f.readlines()
#     data = demjson.decode(js_data)
#     print(len(data))

print("imported entries:", len(data))

con = sqlite3.connect("../serverdata.db")

cur = con.cursor()

collection_id = 0

cards = [(collection_id, entry["country"], entry["city"]) for entry in data if entry["city"] and entry["country"]]
print("imported cards", len(cards))

name = "World Capitals"
description = "All worlds capitals by country"
tags = "#geography #capitals #world"
num_cards = len(cards)

cur.execute("INSERT INTO collections (id, name, description,cardsNumber, tags) values (?, ?, ?, ?, ?);",(collection_id,name, description, num_cards, tags))
cur.executemany("INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)", cards)
con.commit()

res = cur.execute("SELECT count(*) from cards where collectionId=?", (collection_id,))
print("inserted cards:",res.fetchone())

