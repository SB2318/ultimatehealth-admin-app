import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlagiarismProps } from '../type';

const PlagiarismModal = ({ isVisible, onClose, data }:PlagiarismProps) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Plagiarism Check Result</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            <Text style={styles.text}>
              <Text style={styles.bold}>Plagiarised Percentage: </Text>
              {data.plagiarised_percentage}%
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Plagiarised Text: </Text>
              {data.plagiarised_text}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Source Title: </Text>
              {data.source_title}
            </Text>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  close: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  body: {
    marginVertical: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PlagiarismModal;
