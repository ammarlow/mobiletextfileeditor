import React, { useState } from 'react';
import { 
  StyleSheet,
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Pick and read a text file
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        
        setFileContent(content);
        setFileName(file.name);
        setIsEditing(false);
        
        Alert.alert('Success', `Loaded ${file.name}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read file: ' + error.message);
    }
  };

  // Save the edited content
  const saveFile = async () => {
    if (!fileName) {
      Alert.alert('Error', 'No file loaded');
      return;
    }

    try {
      // Create a temporary file
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, fileContent);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'File saved locally');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save file: ' + error.message);
    }
  };

  // Create a new file
  const createNewFile = () => {
    setFileContent('');
    setFileName('new_file.txt');
    setIsEditing(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Text Editor
          </Text>
          {fileName && (
            <Text style={styles.fileName}>
              {fileName}
            </Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={pickFile}
          >
            <Text style={styles.buttonText}>Open File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={createNewFile}
          >
            <Text style={styles.buttonText}>New File</Text>
          </TouchableOpacity>
          
          {fileContent && (
            <TouchableOpacity 
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.buttonText}>
                {isEditing ? 'View' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
          
          {fileContent && isEditing && (
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={saveFile}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content area */}
        <View style={styles.contentContainer}>
          {fileContent ? (
            isEditing ? (
              <TextInput
                style={styles.textInput}
                textAlignVertical="top"
                value={fileContent}
                onChangeText={setFileContent}
                multiline
                placeholder="Start typing..."
                autoCorrect={false}
                spellCheck={false}
              />
            ) : (
              <ScrollView style={styles.scrollView}>
                <Text style={styles.fileText}>
                  {fileContent}
                </Text>
              </ScrollView>
            )
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Tap "Open File" to load a .txt file{'\n'}
                or "New File" to create one
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  fileName: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#f97316',
  },
  saveButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    margin: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  fileText: {
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 24,
    color: '#1f2937',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});