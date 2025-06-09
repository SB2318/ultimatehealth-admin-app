import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {ScoreCardProps} from '../type';
import { hp } from '../helper/Metric';
import { PRIMARY_COLOR } from '../helper/Theme';

const ScorecardModal = ({isVisible, onClose, data}: ScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score < 5) return styles.scoreRed;
    if (score <= 8) return styles.scoreOrange;
    return styles.scoreBlue;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onDismiss={onClose}>
    
      <View style={styles.modalWrapper}>
      <View style={styles.modalContent}>
        

        <Text style={styles.header}>📝 Grammar Score</Text>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={styles.label}>Correction Status:</Text>
          <Text style={{...styles.value, color: data.corrected? 'green':'red'}}>
            {data.corrected ? 'Corrected' : 'Not Corrected'}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Correction Percentage:</Text>
          <Text style={styles.value}>{data.correction_percentage}%</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Approved:</Text>
          <Text style={{...styles.value, color: data.approved ? PRIMARY_COLOR:'red' }}>{data.approved ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Score:</Text>
          <Text style={[styles.value, getScoreColor(data.score)]}>
            {data.score} / 10
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
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
  modalWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: hp(45),
    height: hp(50),
    backgroundColor: '#fefefe',
    padding: 20,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    position: 'relative',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3A3A3A',
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    marginTop: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  closeText: {
    fontSize: 22,
  },

  scoreRed: {
    color: '#FF4C4C', // Bright red
  },
  scoreOrange: {
    color: '#FFA500', // Orange
  },
  scoreBlue: {
    color: '#4A90E2', // Blue
  },
});

export default ScorecardModal;
