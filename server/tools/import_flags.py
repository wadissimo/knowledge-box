import base64
import json
import re
import sqlite3


CHECK_EXISTING = True
MEDIA_FOLDER = "../media/"
IMAGE_FOLDER = "images/"
IMPORT_FILE='import/country-by-flag.json'
COMMENT = "flags"

name = "Country -> Flags"
#name = "Flags -> Country"
description = "All flags by country"
tags = "#geography #flags #world #countries"
reverse = False

# Load your JSON file (replace with the actual path to your file)
with open(IMPORT_FILE, 'r') as file:
    data = json.load(file)

con = sqlite3.connect("../serverdata.db")
cur = con.cursor()

cur.execute("begin")
try:
    cur.execute("INSERT INTO collections (name, description, cardsNumber, tags) values (?, ?, ?, ?);", (name, description, 0, tags))

    res = cur.execute("SELECT last_insert_rowid();")
    collection_id = res.fetchone()[0]
    countries = []
    for row in data:
        base64_string = row['flag_base64']
        country = row['country']
        if not base64_string:
            print("no flag: skipping ", country)
            continue
        countries.append(country)

    values = [(collection_id, country) for country in countries]
    if reverse:
        cur.executemany("INSERT INTO cards (collectionId, front, back) VALUES (?, '', ?)", values)
    else:
        cur.executemany("INSERT INTO cards (collectionId, front, back) VALUES (?, ?, '')", values)
    
    cur.execute("UPDATE collections set cardsNumber = ? where id = ?;", (len(values), collection_id))

    if reverse:
        query = f"""update cards set frontImg=r.imgId
            from (select cards.id as cardId, images.id as imgId from cards inner join images on (lower(cards.back) = lower(images.ref)) where images.comment like 'flags%' and cards.collectionId = ?) as r
            WHERE cards.id = r.cardId"""
    else:
        query = f"""update cards set backImg=r.imgId
            from (select cards.id as cardId, images.id as imgId from cards inner join images on (lower(cards.front) = lower(images.ref)) where images.comment like 'flags%' and cards.collectionId = ?) as r
            WHERE cards.id = r.cardId"""
    
    cur.execute(query, (collection_id,))

    cur.execute("commit")
except Exception as err:
    cur.execute("rollback")
    print("failed", err)
    raise err
