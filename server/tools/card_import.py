import sqlite3

def read_csv(name):
    data = []
    with open(name,encoding='utf-8') as f:
        line = f.readline()
        while line:
            row = line.split(sep=',')
            if len(row) != 2:
                raise RuntimeError("wrong data:", row)
            data.append(row)

            line = f.readline()
    return data

def insert_data(data, name, description, tags, reverse=False):
    num_cards = len(data)

    con = sqlite3.connect("../serverdata.db")
    cur = con.cursor()
    cur.execute("INSERT INTO collections (name, description, cardsNumber, tags) values (?, ?, ?, ?);", (name, description, num_cards, tags))

    res = cur.execute("SELECT last_insert_rowid();")
    collection_id = res.fetchone()[0]
    print("collection_id", collection_id)
    
    if reverse:
        values = [(collection_id, row[1], row[0]) for row in data]
    else:
        values = [(collection_id, row[0], row[1]) for row in data]

    cur.executemany("INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)", values)
    con.commit()