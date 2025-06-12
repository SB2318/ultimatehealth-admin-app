import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Report } from '../type';
import moment from 'moment';



const ReportCard = ({ report }:{report: Report}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Report ID: {report._id}</Text>

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
        <Text style={styles.label}>Convict Statement:</Text>
        <Text style={styles.value}>{report.convict_statement || 'No statement'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Comment ID:</Text>
        <Text style={styles.value}>{report.commentId  || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Admin ID:</Text>
        <Text style={styles.value}>{report.admin_id || 'Unassigned'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Article ID:</Text>
        <Text style={styles.value}>{report.articleId._id}</Text>
      </View>

        <View style={styles.section}>
        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.value}>{moment(report.created_at).format('LL')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Last Action Date:</Text>
        <Text style={styles.value}>{moment(report.last_action_date).format('LL')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  section: {
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    color: '#555',
  },
  value: {
    fontSize: 15,
    color: '#222',
  },
});

export default ReportCard;
