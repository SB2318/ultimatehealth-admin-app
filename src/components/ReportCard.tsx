import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { wp, hp } from '../helper/Metric';
import { PRIMARY_COLOR, BUTTON_COLOR, TEXT_PRIMARY, TEXT_SECONDARY } from '../helper/Theme';
import { Report, reportActionEnum } from '../type';
import moment from 'moment';

export type ReportCardProps = {
  report: Report;
  onViewContent: (report: Report) => void;
  onTakeActionReport: (report: Report) => void;
};

const ReportCard = ({
  report,
  onViewContent,
  onTakeActionReport,
}: ReportCardProps) => {
  const isPending = report.action_taken === reportActionEnum.PENDING;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.reportId}>Report #{report._id}</Text>
        <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.resolvedBadge]}>
          <Text style={isPending ? styles.pendingText : styles.resolvedText}>
            {isPending ? 'PENDING' : 'ACTION TAKEN'}
          </Text>
        </View>
      </View>

      {/* Info Rows */}
      <View style={styles.infoContainer}>
        <InfoRow label="Reported By" value={report.reportedBy.user_name} />
        <InfoRow label="Convicted User" value={report.convictId.user_name} />
        <InfoRow label="Reason" value={report.reasonId.reason} />
        <InfoRow 
          label="Action Taken" 
          value={report.action_taken || 'Not Taken Yet'} 
          highlight={!isPending}
        />
        <InfoRow 
          label="Reported At" 
          value={moment(report.created_at).format('DD MMM YYYY, hh:mm A')} 
        />
        <InfoRow 
          label="Last Action" 
          value={moment(report.last_action_date).format('DD MMM YYYY, hh:mm A')} 
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => onViewContent(report)}>
          <Text style={styles.secondaryButtonText}>View Content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onTakeActionReport(report)}>
          <Text style={styles.primaryButtonText}>
            {isPending ? 'Take Action' : 'Further Action'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InfoRow = ({ label, value, highlight = false }: { 
  label: string; 
  value: string; 
  highlight?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, highlight && styles.highlightValue]}>
      {value}
    </Text>
  </View>
);

export default ReportCard;

const styles = StyleSheet.create({
  
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp(4),
    marginVertical: hp(1.5),
    borderRadius: 20,
    padding: hp(2.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2.2),
    paddingBottom: hp(1.8),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  reportId: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  statusBadge: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.6),
    borderRadius: 20,
    right: wp(19),
    top: hp(-2.5),
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  resolvedBadge: {
    backgroundColor: '#DCFCE7',
  },

  pendingText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '700',
  },
  resolvedText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },

  infoContainer: {
    marginBottom: hp(2.5),
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.6),
  },

  label: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: '600',
    width: '38%',
  },

  value: {
    fontSize: 15.5,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  highlightValue: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: wp(3),
  },

  primaryButton: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(2),
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: hp(2),
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

  
});