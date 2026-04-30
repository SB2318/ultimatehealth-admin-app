import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {PlagiarismProps} from '../type';
import {PRIMARY_COLOR, TEXT_PRIMARY} from '../helper/Theme';

const PlagiarismModal = ({ isVisible, onClose, data }: PlagiarismProps) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Plagiarism Check Result</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.body}>
            <View style={styles.resultCard}>
              <Text style={styles.label}>Plagiarised Percentage</Text>
              <Text style={[
                styles.percentage, 
                { color: data.plagiarised_percentage > 30 ? '#EF4444' : '#F59E0B' }
              ]}>
                {data.plagiarised_percentage}%
              </Text>
            </View>

            {data.plagiarised_text && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Plagiarised Text</Text>
                <Text style={styles.infoText}>{data.plagiarised_text}</Text>
              </View>
            )}

            {data.source_title && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Source Title</Text>
                <Text style={styles.infoText}>{data.source_title}</Text>
              </View>
            )}
          </View>

          {/* Footer Button */}
          <TouchableOpacity style={styles.closeMainButton} onPress={onClose}>
            <Text style={styles.closeMainButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  closeButton: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 26,
    color: '#64748B',
    fontWeight: '500',
  },
  body: {
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#FEF2F2',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  label: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  percentage: {
    fontSize: 42,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 16,
    color: '#1E2937',
    lineHeight: 24,
  },
  closeMainButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeMainButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default PlagiarismModal;