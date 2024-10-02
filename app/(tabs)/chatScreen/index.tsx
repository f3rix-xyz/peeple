import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Linking } from 'react-native';

const MutualLikesScreen = () => {
  const [mutualLikes, setMutualLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMutualLikes();
  }, []);

  const fetchMutualLikes = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API}/mutual-likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'ayush_g@ar.iitr.ac.in' }),
      });
      const data = await response.json();
      if (response.ok) {
        setMutualLikes(data.mutualLikes);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err: any) {
      setError('Failed to fetch mutual likes');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = (profile: any) => {
    let url;
    if (profile.phone) {
      url = `https://wa.me/${profile.phone}`;
    } else if (profile.instaId) {
      url = `https://www.instagram.com/${profile.instaId}`;
    }
    if (url) {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.profileItem} onPress={() => handleProfilePress(item)}>
      <Image source={{ uri: item.photoUrl }} style={styles.profileImage} />
      <Text style={styles.profileName}>{item.userName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text style={styles.centeredText}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.centeredText}>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mutual Likes</Text>
      <FlatList
        data={mutualLikes}
        renderItem={renderItem}
        keyExtractor={(item) => item.instaId}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#8B5CF6',
  },
  listContainer: {
    paddingVertical: 10,
  },
  profileItem: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#8B5CF6',
    borderWidth: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#8B5CF6',
  },
  centeredText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    textAlign: 'center',
    color: '#8B5CF6',
  },
});

export default MutualLikesScreen;