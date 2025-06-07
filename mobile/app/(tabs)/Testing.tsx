import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';

const Testing = () => {
  return (
    <View style={{ padding: 20 }}>
      <Link href="/(tabs)/box/1/notes/edit/new">Add new note</Link>
      <Link href="/(tabs)/box/1/notes/edit/1">Edit note 1</Link>
      <Link href="/(tabs)/box/1/notes/edit/2">Edit note 2</Link>
      <Link href="/(tabs)/box/1/notes/edit/3">Edit note 3</Link>
    </View>
  );
};

export default Testing;
