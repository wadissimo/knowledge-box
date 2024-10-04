import demjson
import sqlite3

data = demjson.decode_file('capitals.data', encoding="utf-8")

# with open('capitals.data', mode="r", encoding="utf-8") as f:
#     js_data = f.readlines()
#     data = demjson.decode(js_data)
#     print(len(data))

print("imported entries:", len(data))


con = sqlite3.connect("../../imports/database-setup.db")

cur = con.cursor()
cards = [(0, entry["country"], entry["city"]) for entry in data if entry["city"] and entry["country"]]
print("imported cards", len(cards))
# for card in cards:
#     print(card)sqlite3

cur.executemany("INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)", cards)
con.commit()
res = cur.execute("SELECT count(*) from cards;")
print("inserted cards:",res.fetchone())

