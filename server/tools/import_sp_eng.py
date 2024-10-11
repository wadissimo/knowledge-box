from card_import import read_csv, insert_data

data = read_csv('import/eng_sp.csv')


name = "English-to-Spanish Flashcards (Beginner)"
description = """Beginner Vocabulary Spanish to English. Most frequently used words and phrases.
Vocabulario para principiantes de español a inglés. Las palabras y frases más utilizadas."""
tags = "#language #spanish #english #beginner #español #inglés #principiante"

insert_data(data, name, description, tags, reverse=False, insert_media_back=True, media_sound_prefix_back="es")

name = "Spanish-to-English Flashcards (Beginner)"
insert_data(data, name, description, tags, reverse=True)