import base64
import json
import re
import sqlite3


CHECK_EXISTING = True
MEDIA_FOLDER = "../media/"
IMAGE_FOLDER = "images/"
IMPORT_FILE='import/country-by-flag.json'
COMMENT = "flags"

# Load your JSON file (replace with the actual path to your file)
with open(IMPORT_FILE, 'r') as file:
    data = json.load(file)


con = sqlite3.connect("../serverdata.db")
cur = con.cursor()

for row in data:
    base64_string = row['flag_base64']
    country = row['country']
    if not base64_string:
        print("no flag: skipping ", country)
        continue
    

    image_format_match = re.search(r"data:image\/([\w\+]+);base64", base64_string)

    if image_format_match:
        image_format = image_format_match.group(1).split('+')[0]
        # Remove the metadata part
        base64_data = base64_string.split(',')[1]
    else:
        print("No metadata found, assuming PNG format.")
        image_format = "png"
        base64_data = base64_string

    # Decode the base64 string into binary data
    try:
        image_data = base64.b64decode(base64_data)
    except Exception as e:
        print(f"Error decoding base64: {e}")
        raise

    try:
        if CHECK_EXISTING:
            res = cur.execute(f"SELECT id from images where lower(ref) = ? and comment like '{COMMENT}%'", (country.lower(),))
            existing_image = res.fetchone()
            if existing_image:
                print("image exists already skip:", country)
                continue
        # start transaction
        cur.execute("begin")
        cur.execute("INSERT INTO images (ref, comment) values (?, ?);", (country, COMMENT)) 
        res = cur.execute("SELECT last_insert_rowid();")
        image_id = res.fetchone()[0]
        file_name = f"{IMAGE_FOLDER}{image_id}.{image_format}"
        # Save file name to database
        cur.execute("UPDATE images set file = ? where id = ?;", (file_name, image_id))
        print(country, file_name, image_id)
        # Save the image to disk
        with open(MEDIA_FOLDER + file_name, 'wb') as image_file:
            image_file.write(image_data)
        
        con.execute("commit")
    except Exception as err:
        con.execute("rollback")
        print("failed", err)
        print(country, file_name, image_id)

    #break
