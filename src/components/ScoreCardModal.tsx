import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { hp, wp } from '../helper/Metric';
import { PRIMARY_COLOR, TEXT_PRIMARY, TEXT_SECONDARY } from '../helper/Theme';
import { ScoreCardProps } from '../type';

const ScorecardModal = ({ isVisible, onClose, data }: ScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score < 5) return '#EF4444';      // Red
    if (score <= 7) return '#F59E0B';     // Orange
    return '#10B981';                     // Green
  };

  const scoreColor = getScoreColor(data.score);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Grammar Score Report</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Score Circle */}
          <View style={styles.scoreCircleContainer}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {data.score}
              </Text>
              <Text style={styles.scoreOutOf}>/ 10</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <DetailRow 
              label="Correction Status" 
              value={data.corrected ? 'Corrected' : 'Not Corrected'}
              valueColor={data.corrected ? '#10B981' : '#EF4444'}
            />
            <DetailRow 
              label="Correction Percentage" 
              value={`${data.correction_percentage}%`} 
            />
            <DetailRow 
              label="Approved" 
              value={data.approved ? 'Yes' : 'No'}
              valueColor={data.approved ? PRIMARY_COLOR : '#EF4444'}
            />
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeMainButton} onPress={onClose}>
            <Text style={styles.closeMainButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const DetailRow = ({ label, value, valueColor }: { 
  label: string; 
  value: string; 
  valueColor?: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

export default ScorecardModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  closeButton: {
    padding: 8,
  },

  closeIcon: {
    fontSize: 28,
    color: '#64748B',
    fontWeight: '500',
  },

  scoreCircleContainer: {
    alignItems: 'center',
    marginVertical: hp(2),
  },

  scoreCircle: {
    width: hp(18),
    height: hp(18),
    borderRadius: hp(9),
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreNumber: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 58,
  },

  scoreOutOf: {
    fontSize: 26,
    color: '#64748B',
    fontWeight: '600',
  },

  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: hp(2),
    marginBottom: hp(3),
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.4),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  detailLabel: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 16.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  closeMainButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(2),
    borderRadius: 14,
    alignItems: 'center',
  },

  closeMainButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
});