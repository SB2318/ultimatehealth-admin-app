import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {Category, Reason} from '../type';

interface Props {
  type: number;
  reason: Reason | null;
  tag: Category | null;
  onTagChange: (tag: Category | null, name: string) => void;
  onReasonChange: (reason: Reason | null, name: string) => void;
  visible: boolean;
  onDismiss: () => void;
}

export default function AddTagModal({
  type,
  reason,
  tag,
  visible,
  onTagChange,
  onReasonChange,
  onDismiss,
}: Props) {
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (type === 1 && tag) {
      setInputValue(tag.name);
    } else if (type === 2 && reason) {
      setInputValue(reason.reason);
    }
  }, [reason, tag, type]);

  const handleSubmit = () => {
    if (type === 1) {
      onTagChange(tag, inputValue);
    } else if (type === 2) {
      onReasonChange(reason, inputValue);
    }
    setInputValue('');
    onDismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onDismiss={onDismiss}>

    <View style={styles.modalContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>
          {type === 1 ? 'Enter Tag Name' : 'Enter Reason Name'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={type === 1 ? 'e.g., Health' : 'e.g., spam'}
          value={inputValue}
          onChangeText={setInputValue}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 3,
    margin: 20,
    //height:"30%",
    width:"90%"
    //alignSelf:'center'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
