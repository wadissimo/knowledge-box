from card_import import read_csv, insert_data

data = read_csv('import/ger_eng.csv')

name = "Beginner English-to-German Flashcards"

description = """A collection of essential English words with their German translations. Perfect for beginners learning the basics of the German language.
Eine Sammlung wesentlicher englischer Wörter mit ihren deutschen Übersetzungen. Perfekt für Anfänger, die die Grundlagen der englischen Sprache lernen."""

tags = "#language #german #english #beginner #deutsch #englisch #anfänger"

insert_data(data, name, description, tags, reverse=False)

name = "Beginner German-to-English Flashcards"
insert_data(data, name, description, tags, reverse=True)
