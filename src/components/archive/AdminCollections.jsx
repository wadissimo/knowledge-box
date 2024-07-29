// src/components/AdminCollections.js

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AdminCollections = ({ collections, setCollections }) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editCollectionId, setEditCollectionId] = useState(null);
  const [editCollectionName, setEditCollectionName] = useState('');

  const addCollection = () => {
    if (newCollectionName.trim() === '') return;

    const newCollection = {
      id: uuidv4(),
      name: newCollectionName,
      cards: [],
    };

    setCollections([...collections, newCollection]);
    setNewCollectionName('');
  };

  const deleteCollection = (id) => {
    setCollections(collections.filter((collection) => collection.id !== id));
  };

  const startEditing = (id, name) => {
    setEditCollectionId(id);
    setEditCollectionName(name);
  };

  const saveEdit = () => {
    setCollections(
      collections.map((collection) =>
        collection.id === editCollectionId ? { ...collection, name: editCollectionName } : collection
      )
    );
    setEditCollectionId(null);
    setEditCollectionName('');
  };

  return (
    <div>
      <h2>Manage Collections</h2>

      <div>
        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="New Collection Name"
        />
        <button onClick={addCollection}>Add Collection</button>
      </div>

      <ul>
        {collections.map((collection) => (
          <li key={collection.id}>
            {editCollectionId === collection.id ? (
              <>
                <input
                  type="text"
                  value={editCollectionName}
                  onChange={(e) => setEditCollectionName(e.target.value)}
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditCollectionId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {collection.name}
                <button onClick={() => startEditing(collection.id, collection.name)}>Edit</button>
                <button onClick={() => deleteCollection(collection.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCollections;
