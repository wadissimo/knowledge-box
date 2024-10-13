import sqlite3

def read_csv(name, skip_errors = False, col_num=2):
    data = []
    with open(name,encoding='utf-8') as f:
        line = f.readline()
        while line:
            row = line.strip().split(sep=',')
            if len(row) != col_num:
                if skip_errors:
                    print("wrong data:", row)
                else:
                    raise RuntimeError("wrong data:", row)
            data.append(row)

            line = f.readline()
    return data

def insert_data(data, name, description, tags, reverse=False, insert_media_back=False, media_sound_prefix_back="", insert_media_front=False, media_sound_prefix_front=""):
    num_cards = len(data)

    con = sqlite3.connect("../serverdata.db")
    cur = con.cursor()
    cur.execute("INSERT INTO collections (name, description, cardsNumber, tags) values (?, ?, ?, ?);", (name, description, num_cards, tags))

    res = cur.execute("SELECT last_insert_rowid();")
    collection_id = res.fetchone()[0]
    print("collection_id", collection_id)
    values = []
    unique = set()
    for row in data:
        front = row[1] if reverse else row[0]
        back = row[0] if reverse else row[1]
        if front in unique:
            continue
        unique.add(front)
        values.append((collection_id, front, back))
        
            

    cur.executemany("INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)", values)
    cur.execute("UPDATE collections set cardsNumber = ? where id = ?;", (len(values), collection_id))

    if insert_media_back:        
        query = f"""update cards set backSound=r.soundId
        from (select cards.id as cardId, sounds.id as soundId from cards inner join sounds on (lower(cards.back) = lower(sounds.ref)) where sounds.comment like '{media_sound_prefix_back}%' and cards.collectionId = ?) as r
        WHERE cards.id = r.cardId"""
        cur.execute(query, (collection_id,))
    if insert_media_front:        
        query = f"""update cards set frontSound=r.soundId
        from (select cards.id as cardId, sounds.id as soundId from cards inner join sounds on (lower(cards.front) = lower(sounds.ref)) where sounds.comment like '{media_sound_prefix_front}%' and cards.collectionId = ?) as r
        WHERE cards.id = r.cardId"""
        cur.execute(query, (collection_id,))

    con.commit()
    con.close()
    return collection_id