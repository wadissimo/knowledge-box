import sys
sys.path.append("..")
import sqlite3
from card_import import read_csv, insert_data
from typing import Sequence

import google.cloud.texttospeech as tts


def unique_languages_from_voices(voices: Sequence[tts.Voice]):
    language_set = set()
    for voice in voices:
        for language_code in voice.language_codes:
            language_set.add(language_code)
    return language_set


def list_languages():
    client = tts.TextToSpeechClient()
    response = client.list_voices()
    languages = unique_languages_from_voices(response.voices)

    print(f" Languages: {len(languages)} ".center(60, "-"))
    for i, language in enumerate(sorted(languages)):
        print(f"{language:>10}", end="\n" if i % 5 == 4 else "")


def list_voices(language_code=None):
    client = tts.TextToSpeechClient()
    response = client.list_voices(language_code=language_code)
    voices = sorted(response.voices, key=lambda voice: voice.name)

    print(f" Voices: {len(voices)} ".center(60, "-"))
    for voice in voices:
        languages = ", ".join(voice.language_codes)
        name = voice.name
        gender = tts.SsmlVoiceGender(voice.ssml_gender).name
        rate = voice.natural_sample_rate_hertz
        print(f"{languages:<8} | {name:<24} | {gender:<8} | {rate:,} Hz")


def text_to_wav(voice_name: str, text: str, filename):
    language_code = "-".join(voice_name.split("-")[:2])
    text_input = tts.SynthesisInput(text=text)
    voice_params = tts.VoiceSelectionParams(
        language_code=language_code, name=voice_name
    )
    audio_config = tts.AudioConfig(audio_encoding=tts.AudioEncoding.LINEAR16)

    client = tts.TextToSpeechClient()
    response = client.synthesize_speech(
        input=text_input,
        voice=voice_params,
        audio_config=audio_config,
    )

    #filename = f"{voice_name}.wav"
    with open(filename, "wb") as out:
        out.write(response.audio_content)
        print(f'Generated speech saved to "{filename}"')
         
def text_to_mp3(voice_name: str, text: str, filename):
    language_code = "-".join(voice_name.split("-")[:2])
    text_input = tts.SynthesisInput(text=text)
    voice_params = tts.VoiceSelectionParams(
        language_code=language_code, name=voice_name
    )
    audio_config = tts.AudioConfig(
        audio_encoding=tts.AudioEncoding.MP3
    )
    client = tts.TextToSpeechClient()
    response = client.synthesize_speech(
        input=text_input,
        voice=voice_params,
        audio_config=audio_config,
    )
    with open(filename, "wb") as out:
        out.write(response.audio_content)
        print(f'Generated speech saved to "{filename}"')

#list_languages()
#exit()
#list_voices("en-US")

#exit()
#text_to_wav("fr-FR-Neural2-A", "J'ai besoin d'un médecin", "fr-FR-Neural2-A.wav")

#text_to_mp3("fr-FR-Standard-B", "J'ai besoin d'un médecin", "fr-FR-Standard-B.mp3")
#text_to_mp3("fr-FR-Standard-A", data[2][1], "output.mp3")


###### Set up #######
folder = "sounds/en"
voice_prefix = "en-US"
voices = ["en-US-Standard-A", "en-US-Standard-B", "en-US-Standard-C", "en-US-Standard-D", "en-US-Standard-E", "en-US-Standard-F", "en-US-Standard-G", "en-US-Standard-H"]
file_name="../import/eng_unique.csv"

log_file = "eng-log.txt"
WORD_IDX = 0
CHECK_EXISTING = True

RUN_LOOP = True ## Todo:


data = []
with open(file_name, encoding='utf-8') as f:
    line = f.readline()
    while line:
        row = line.strip().split(sep=',')
        data.append(row)
        line = f.readline()

words = []
word_set = set()
for row in data:
    word = row[WORD_IDX]
    if word.lower() in word_set:
        continue
    word_set.add(word.lower())
    words.append(word)


print("Unique words",len(words))


# Generation loop
voice_idx = 0
if RUN_LOOP:
    con = sqlite3.connect("../../serverdata.db")
    cur = con.cursor()
    with open(log_file, "a", encoding="utf-8") as log:
        for word in words:
            try:
                cur_voice = voices[voice_idx%len(voices)]
                voice_idx += 1
                if CHECK_EXISTING:
                    res = cur.execute(f"SELECT id from sounds where lower(ref) = ? and comment like '{voice_prefix}%'", (word.lower(),))
                    existing_sound = res.fetchone()
                    if existing_sound:
                        print("sound exists already skip:", word)
                        continue
                # start transaction
                cur.execute("begin")
                cur.execute("INSERT INTO sounds (ref, comment) values (?, ?);", (word, cur_voice)) #TODO: Comment -> Voice
                res = cur.execute("SELECT last_insert_rowid();")
                sound_id = res.fetchone()[0]
                file_name = f"{folder}/{sound_id}.mp3"
                cur.execute("UPDATE sounds set file = ? where id = ?;", (file_name, sound_id))
                log.write(f"{word} {file_name} {sound_id}\n")
                print(word, file_name, sound_id)
                text_to_mp3(cur_voice, word, file_name)
                con.execute("commit")
            except Exception as err:
                con.execute("rollback")
                print("failed", err)
                print(word, file_name, sound_id)

    con.close()
# print(len(data))
# print(data[0])
# print("--------")