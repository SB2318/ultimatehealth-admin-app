import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Report, reportActionEnum} from '../type';
import moment from 'moment';
import {BUTTON_COLOR} from '../helper/Theme';

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
  const resolutions = [
    reportActionEnum.RESOLVED,
    reportActionEnum.DISMISSED,
    reportActionEnum.IGNORE,
    reportActionEnum.WARN_CONVICT,
    reportActionEnum.REMOVE_CONTENT,
    reportActionEnum.BLOCK_CONVICT,
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Report #{report._id}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Reported By:</Text>
        <Text style={styles.value}>{report.reportedBy.user_name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Convicted User:</Text>
        <Text style={styles.value}>{report.convictId.user_name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reason:</Text>
        <Text style={styles.value}>{report.reasonId.reason}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Action Taken:</Text>
        <Text style={styles.value}>{report.action_taken || 'Pending'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reported At:</Text>
        <Text style={styles.value}>
          {moment(report.created_at).format('LL')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Last Action Date:</Text>
        <Text style={styles.value}>
          {moment(report.last_action_date).format('LL')}
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => {
            onViewContent(report);
          }}>
          <Text style={styles.buttonText}>View Content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => {
            onTakeActionReport(report);
          }}>
          <Text style={styles.buttonText}>
            {report.action_taken === reportActionEnum.PENDING
              ? 'Take over report'
              : resolutions.includes(report.action_taken as reportActionEnum) ? 'Take action further': 'Take action'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginVertical: 12,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  section: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    color: '#111',
    fontSize: 15,
    maxWidth: '60%',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonPrimary: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ReportCard;
