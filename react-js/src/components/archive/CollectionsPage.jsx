// src/CollectionsPage.jsx
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './CollectionsPage.css';

const CollectionsPage = ({ collections, setCollections }) => {
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleAddCollection = () => {
    setModalType('add');
    setNewCollectionName('');
    setShowModal(true);
  };

  const handleEditCollection = (collection) => {
    setModalType('edit');
    setSelectedCollection(collection);
    setNewCollectionName(collection.name);
    setShowModal(true);
  };

  const handleDeleteCollection = (id) => {
    setCollections(collections.filter((collection) => collection.id !== id));
  };

  const handleConfirm = () => {
    if (newCollectionName.trim() === '') {
      alert('Collection name cannot be empty.');
      return;
    }

    if (modalType === 'add') {
      const newCollection = {
        id: collections.length + 1,
        name: newCollectionName,
        cardCount: 0, // Start with zero cards
      };
      setCollections([...collections, newCollection]);
    } else if (modalType === 'edit') {
      setCollections(
        collections.map((collection) =>
          collection.id === selectedCollection.id
            ? { ...collection, name: newCollectionName }
            : collection
        )
      );
    }

    setShowModal(false);
    setSelectedCollection(null);
    setNewCollectionName('');
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedCollection(null);
    setNewCollectionName('');
  };

  return (
    <div className="collections-page">
      <h1>Collections</h1>
      <button className="new-collection-button" onClick={handleAddCollection}>
        New Collection
      </button>
      <table className="collections-table">
        <thead>
          <tr>
            <th>Collection Name</th>
            <th>Number of Cards</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <tr key={collection.id}>
              <td>
                <a href="#" className="collection-link">
                  {collection.name}
                </a>
              </td>
              <td>{collection.cardCount}</td>
              <td>
                <span className="icon" onClick={() => handleEditCollection(collection)}>
                  <i className="fas fa-edit"></i>
                </span>
                <span className="icon" onClick={() => handleDeleteCollection(collection.id)}>
                  <i className="fas fa-trash-alt"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCancel}>
              &times;
            </span>
            <h2>{modalType === 'add' ? 'Add New Collection' : 'Edit Collection'}</h2>
            <input
              type="text"
              placeholder="Collection Name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="ok-button" onClick={handleConfirm}>
                OK
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
