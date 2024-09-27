import sqlite3
import json

# Path to your Anki database file
db_path = 'import/collection.anki2'



def get_all_notes(conn):
    cursor = conn.cursor()

    # Modify the query to include additional columns from the 'notes' table
    cursor.execute("SELECT id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data FROM notes")

    # Fetch all the rows
    rows = cursor.fetchall()

    # Processing each row and displaying more fields
    for row in rows:
        note_id = row[0]
        guid = row[1]
        mid = row[2]
        mod = row[3]
        usn = row[4]
        tags = row[5]
        #flds_blob = row[6]
        flds = row[6]
        sfld = row[7]
        csum = row[8]
        flags = row[9]
        data = row[10]
        
        # Decode BLOB (assuming UTF-8 encoding for 'flds')
        try:
            #flds_text = flds_blob.decode('utf-8')  # Decode the BLOB
            print(f"Note ID: {note_id}, GUID: {guid}, MID: {mid}, MOD: {mod}, USN: {usn}, Tags: {tags}, Fields: {flds}, SFld: {sfld}, Csum: {csum}, Flags: {flags}, Data: {data}")
        except Exception as e:
            print(f"Error decoding note {note_id}: {e}")
        break

def get_note(conn):
    cursor = conn.cursor()

    # Modify the query to include additional columns from the 'notes' table
    cursor.execute("SELECT id, flds FROM notes")

    # Fetch all the rows
    row = cursor.fetchone()
    note_id = row[0]
    flds = row[1]
    print(flds.split('\x1f'))

def get_notes(conn, front_idx, back_idx):
    cursor = conn.cursor()

    # Modify the query to include additional columns from the 'notes' table
    cursor.execute("SELECT id, flds FROM notes")

    notes = []
    rows = cursor.fetchall()
    for row in rows:
        id = row[0]
        flds = row[1].split('\x1f')
        front = flds[front_idx]
        back = flds[back_idx]
        notes.append([id, front, back])
    return notes
    

def get_cards(conn):
    cursor = conn.cursor()

    cursor.execute("SELECT * from cards")

    # Fetch all the rows
    row = cursor.fetchone()
    print(row)

def get_model(conn):
    cursor = conn.cursor()

    # Query to get the note models and their fields
    cursor.execute('SELECT models FROM col')
    models = json.loads(cursor.fetchone()[0])

    # Map model IDs to field positions (front and back)
    model_field_mapping = {}
    for model_id, model in models.items():
        # Get the field names
        field_names = [f['name'] for f in model['flds']]
        # This assumes that the first field is front and the second is back
        # Adjust this according to your model's templates
        model_field_mapping[model_id] = {
            'front': field_names[0],  # Adjust this based on your template
            'back': field_names[1]    # Adjust this based on your template
        }
    
    print(model_field_mapping)
        
# Connect to the SQLite database
conn = sqlite3.connect(db_path)

notes = get_notes(conn,1, 3)
print(notes[0])
# Close the connection
conn.close()
