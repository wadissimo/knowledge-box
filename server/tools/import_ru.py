from card_import import read_csv, insert_data

data = read_csv('import/eng_ru.csv', skip_errors=False)

name = "Beginner English-to-Russian (Английский -> Русский)"

description = """A collection of essential English words with their Russian translations. Perfect for beginners learning the basics of the Russian language.
Коллекция часто используемых слов английского языка с переводом на русский. Идеально для начинающих изучающих основы английского языка."""

tags = "#language #russian #english #beginner #русский #английский #начинающий"

insert_data(data, name, description, tags, reverse=False, insert_media_back=True, media_sound_prefix_back="ru", insert_media_front=True, media_sound_prefix_front="en")

name = "Beginner Russian-to-English (Русский -> Английский)"
insert_data(data, name, description, tags, reverse=True, insert_media_back=True, media_sound_prefix_back="en", insert_media_front=True, media_sound_prefix_front="ru")
