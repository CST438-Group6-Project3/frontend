import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../auth/AuthProvider';

export default function ProfileScreen() {
  const { user, session } = useAuth();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar_url || null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) uploadImage(file);
        };

        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });

        if (!result.canceled) {
          uploadImage(result.assets[0].uri);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error picking image');
    }
  };

  const uploadImage = async (fileOrUri: any) => {
    try {
      setLoading(true);

      let fileData;
      const fileName = `${session?.user.id}-${Date.now()}.jpg`;

      // Convert file
      if (Platform.OS === 'web') {
        fileData = fileOrUri;
      } else {
        const response = await fetch(fileOrUri);
        fileData = await response.blob();
      }

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      if (avatar) {
        try {
          const oldPath = avatar.split('/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (e) {
          console.log('Could not delete old avatar');
        }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', session?.user.id);

      if (updateError) throw updateError;

      setAvatar(publicUrl);

      Alert.alert('Profile picture updated!');
    } catch (err) {
      console.error(err);
      Alert.alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', session?.user.id);

      if (error) throw error;

      Alert.alert('Name updated!');
    } catch (err) {
      console.error(err);
      Alert.alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, padding: 20, maxWidth: 500, alignSelf: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            avatar
              ? { uri: avatar + '?t=' + Date.now() } // cache bust
              : require('../../assets/default-avatar.png')
          }
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 10,
          }}
        />
        <Text style={{ textAlign: 'center' }}>Change Profile Picture</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20 }}>Username</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter username"
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 8,
        }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Save Name" onPress={updateProfile} />
      )}
    </View>
  );
}