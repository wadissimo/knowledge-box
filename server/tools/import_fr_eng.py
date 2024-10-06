from card_import import read_csv, insert_data

data = read_csv('import/fr_eng.csv')

#name = "French -> English"
name = "English -> French"
#name = "Beginner German-to-English Flashcards"
description = """A collection of essential English words with their French translations. Perfect for beginners learning the basics of the French language.
Une collection de mots anglais essentiels avec leurs traductions en français. Parfait pour les débutants apprenant les bases de la langue anglaise."""
tags = "#language #french #english #beginner #langue #français #anglais #débutant"
insert_data(data, name, description, tags, reverse=False)

name = "French -> English"
insert_data(data, name, description, tags, reverse=True)