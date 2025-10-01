import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { lightColors } from '../config/theme';
import { supabase } from '../config/supabase';

export default function CreateUnionScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('climate');
  const [scope, setScope] = useState('national');
  const [scopeValue, setScopeValue] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a union name');
      return;
    }

    try {
      // In real app, get current user ID from auth
      const creatorId = 'current-user-id';

      const { data, error } = await supabase
        .from('unions')
        .insert({
          name,
          description,
          category,
          scope,
          scopeValue,
          creatorId,
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Union created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create union');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create a New Union</Text>
        <Text style={styles.subtitle}>
          Start organizing voters around the issues that matter most
        </Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Union Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Climate Action Now"
              value={name}
              onChangeText={setName}
              placeholderTextColor={lightColors.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your union's mission and goals..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={lightColors.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Issue Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
              >
                <Picker.Item label="Climate Action" value="climate" />
                <Picker.Item label="Affordable Housing" value="housing" />
                <Picker.Item label="Healthcare" value="healthcare" />
                <Picker.Item label="Education" value="education" />
                <Picker.Item label="Workers' Rights" value="labor" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Scope *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={scope}
                onValueChange={setScope}
                style={styles.picker}
              >
                <Picker.Item label="National" value="national" />
                <Picker.Item label="State" value="state" />
                <Picker.Item label="District" value="district" />
                <Picker.Item label="City" value="city" />
              </Picker>
            </View>
          </View>

          {scope !== 'national' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {scope === 'state' ? 'State' : scope === 'district' ? 'District Number' : 'City Name'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${scope}...`}
                value={scopeValue}
                onChangeText={setScopeValue}
                placeholderTextColor={lightColors.textMuted}
              />
            </View>
          )}

          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreate}
          >
            <Text style={styles.createButtonText}>Create Union</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: lightColors.textMuted,
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: lightColors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  createButton: {
    backgroundColor: lightColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
