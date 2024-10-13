from card_import import read_csv, insert_data
import sqlite3
data = read_csv('import/eng_ch.csv', skip_errors=False, col_num=3)


# name = "English to Chinese Vocabulary for Beginners"

# description = """This flashcard set helps beginners learn the most common and useful vocabulary in Chinese, covering everyday words and phrases essential for communication. Perfect for those starting their language learning journey."""

# tags = "#language #chinese #english #beginner #mandarin"

# col_id = insert_data(data, name, description, tags, reverse=False, insert_media_back=True, media_sound_prefix_back="cmn")

# name = "Chinese to English Vocabulary for Beginners"
# rev_col_id = insert_data(data, name, description, tags, reverse=True, insert_media_front=True, media_sound_prefix_front="cmn")

col_id = 16
rev_col_id = 17
# Merge pinyin and hanzi
remap = []
rev_remap = []
for row in data:
    remap.append((f"{row[1]}\n{row[2]}", row[1], col_id))
    rev_remap.append((f"{row[1]}\n{row[2]}", row[1], rev_col_id))

con = sqlite3.connect("../serverdata.db")
cur = con.cursor()
cur.executemany("update cards set back = ? where back = ? and collectionId = ?", remap)
cur.executemany("update cards set front = ? where front = ? and collectionId = ?", rev_remap)

con.commit()
con.close()