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



update cards set backSound=r.soundId
from (select cards.id as cardId, sounds.id as soundId from cards inner join sounds on (cards.back = sounds.ref) where sounds.comment like 'fr%' and cards.collectionId = 1) as r
WHERE cards.id = r.cardId;

