from card_import import read_csv, insert_data

data = read_csv('import/sp-eng.csv')


name = "Spanish-to-English Flashcards (Beginner)"
description = """Beginner Vocabulary Spanish to English. Most frequently used words and phrases.
Vocabulario para principiantes de español a inglés. Las palabras y frases más utilizadas."""
tags = "#language #spanish #english #beginner #español #inglés #principiante"

insert_data(data, name, description, tags, reverse=False)

name = "English-to-Spanish Flashcards (Beginner)"
insert_data(data, name, description, tags, reverse=True)