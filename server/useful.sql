CREATE VIRTUAL TABLE collections_fts USING fts5(
    name,
    description,
    tags
);

--sync collection and fts (full text search)
INSERT INTO collections_fts (rowid, name, description, tags)
SELECT id, name, description, tags FROM collections;


update cards set front = trim(front, '
'), back=trim(back, '
');
commit;

select cards.id, sounds.id from cards inner join sounds on (cards.back = sounds.ref) where sounds.comment like 'fr%' and cards.collectionId = 1;


CREATE TABLE collections (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
		 description TEXT,
		 tags TEXT,
         cardsNumber INTEGER,
		 createdBy TEXT,
         createdAt INTEGER DEFAULT CURRENT_TIMESTAMP
       );

CREATE TABLE cards (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 collectionId INTEGER,
                 front TEXT NOT NULL,
                 back TEXT NOT NULL,
				 front_img INTEGER,
				 back_img INTEGER,
				 front_sound INTEGER,
				 back_sound INTEGER,
                 easeFactor INTEGER DEFAULT 0,
                 createdAt INTEGER DEFAULT CURRENT_TIMESTAMP,
                 FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
				 );