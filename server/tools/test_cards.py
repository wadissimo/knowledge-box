import sqlite3

con = sqlite3.connect("../serverdata.db")
cur = con.cursor()
res = cur.execute("SELECT * from cards where collectionId=?;", (18,))
data = res.fetchall()
for row in data[:50]:
    print(row)

# counter = 0
# data = []
# with open('import/ita_eng.csv', encoding='utf-8') as f:
#     line = f.readline()
#     while line and counter < 10:
#         row = line.split(sep=',')
#         if len(row) != 2:
#             raise RuntimeError("wrong data:", row)
#         data.append(row)
#         print(row)

#         line = f.readline()
#         counter += 1