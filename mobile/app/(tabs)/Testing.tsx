import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';

// Utility: Sleep for `ms` milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Testing = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoaded(false); // Start loading
        setError(null); // Clear any previous errors

        console.log('Loading started');

        await sleep(2000); // Simulate fetching resource 1
        console.log('Fetched resource 1');

        await sleep(2000); // Simulate fetching resource 2
        console.log('Fetched resource 2');

        // Uncomment to test error path
        // throw new Error("Something went wrong");

        setData('Finished loading all data!');
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        console.error('Error in run()', message);
      } finally {
        setIsLoaded(true); // End loading, success or error
        console.log('Loading ended');
      }
    };

    run();
  }, []);
  console.log('isLoaded', isLoaded);
  return (
    <View style={{ padding: 20 }}>
      {!isLoaded && (
        <View>
          <ActivityIndicator size="large" />
          <Text>Loading...</Text>
        </View>
      )}

      {isLoaded && error && (
        <View>
          <Text style={{ color: 'red' }}>Error: {error}</Text>
        </View>
      )}

      {isLoaded && !error && data && (
        <View>
          <Text>{data}</Text>
        </View>
      )}
    </View>
  );
};

export default Testing;
