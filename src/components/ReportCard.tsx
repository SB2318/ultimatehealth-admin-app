import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {wp, hp} from '../helper/Metric';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  STATUS_COLORS,
  BORDER_COLOR,
  CARD_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  CLINICAL_SHADOW,
} from '../helper/Theme';
import {Report, reportActionEnum} from '../type';
import moment from 'moment';
import {Feather, MaterialIcons} from '@expo/vector-icons';

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
  const statusTheme = isPending ? STATUS_COLORS.pending : STATUS_COLORS.approved;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.reportIdContainer}>
          <MaterialIcons name="shield" size={18} color={PRIMARY_COLOR} />
          <Text style={styles.reportId}>
            Case #{report._id ? report._id.substring(report._id.length - 6).toUpperCase() : '000000'}
          </Text>
        </View>

        {/* Clinical Status Chip */}
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: statusTheme.bg, borderColor: statusTheme.border},
          ]}>
          <View
            style={[styles.statusDot, {backgroundColor: statusTheme.text}]}
          />
          <Text style={[styles.statusText, {color: statusTheme.text}]}>
            {isPending ? 'PENDING TRIAGE' : 'RESOLVED'}
          </Text>
        </View>
      </View>

      {/* Primary Violation Reason Badge */}
      <View style={styles.reasonBadge}>
        <Feather name="alert-circle" size={14} color="#DC2626" />
        <Text style={styles.reasonBadgeText} numberOfLines={1}>
          {report.reasonId?.reason || 'Policy Violation'}
        </Text>
      </View>

      {/* Info Rows */}
      <View style={styles.infoContainer}>
        <InfoRow
          icon="user"
          label="Reported By"
          value={report.reportedBy?.user_name || 'Anonymous User'}
        />
        <InfoRow
          icon="alert-triangle"
          label="Flagged User"
          value={report.convictId?.user_name || 'Unknown User'}
          highlight
        />
        <InfoRow
          icon="activity"
          label="Status Action"
          value={report.action_taken || 'No action recorded'}
        />
        <InfoRow
          icon="clock"
          label="Reported On"
          value={moment(report.created_at).format('DD MMM YYYY, hh:mm A')}
        />
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => onViewContent(report)}
          activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>View Content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onTakeActionReport(report)}
          activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>
            {isPending ? 'Triage & Take Action' : 'Update Action'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.labelCol}>
      <Feather name={icon} size={13} color={TEXT_MUTED} style={{marginRight: 6}} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, highlight && styles.highlightValue]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export default ReportCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...CLINICAL_SHADOW,
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  reportIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  reportId: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: 0.5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
    gap: 6,
  },

  reasonBadgeText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },

  infoContainer: {
    gap: 10,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: '500',
  },

  value: {
    fontSize: 13.5,
    color: TEXT_SECONDARY,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },

  highlightValue: {
    color: '#DC2626',
    fontWeight: '700',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  primaryButton: {
    flex: 1.3,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  secondaryButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
});