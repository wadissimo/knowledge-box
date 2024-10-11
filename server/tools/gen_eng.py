csv_list = ["eng_fr_words.csv", "eng_ru.csv", "eng_sp.csv", "eng-ger.csv", "ita_eng.csv"]
output_csv = "eng_unique.csv"
folder = "import/"
skip_errors = True
skip_phrases = True

data = []
data_unique = set()

for csv_file in csv_list:
    with open(folder + csv_file,encoding='utf-8') as f:
        line = f.readline()
        while line:
            row = line.strip().split(sep=',')
            if len(row) != 2:
                if skip_errors:
                    print("wrong data:", row)
                else:
                    raise RuntimeError("wrong data:", row)
            
            eng_phrase = row[0] # read first word only
            words = eng_phrase.split()
            if not skip_phrases or len(words) <=2:
                if eng_phrase.lower() not in data_unique:
                    data_unique.add(eng_phrase.lower())
                    data.append(eng_phrase)

            line = f.readline()

with open(folder + output_csv, "w", encoding="utf-8") as out:
    for word in data:
        out.write(f"{word}\n")