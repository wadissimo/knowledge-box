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