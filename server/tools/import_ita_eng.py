from card_import import read_csv, insert_data


data = read_csv('import/ita_eng.csv')

name = "English -> Italian"

description = """A collection of essential English words with their Italian translations. Perfect for beginners learning the basics of the Italian language.
Una raccolta di parole inglesi essenziali con le loro traduzioni in italiano. Perfetto per i principianti che imparano le basi della lingua inglese."""
tags = "#language #italian #english #beginner #lingua #italiano #inglese #principiante"

insert_data(data, name, description, tags, reverse=False)

name = "Italian -> English"
insert_data(data, name, description, tags, reverse=True)
