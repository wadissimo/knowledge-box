import { ReviewLog } from '@/src/data/ReviewLogModel';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../common/PrimaryButton';
import { i18n } from '@/src/lib/i18n';

interface ReviewLogTableProps {
  log: ReviewLog[];
  onClose: () => void;
}
const cardStateToText = (cardState: number) => {
  switch (cardState) {
    case 1:
      return 'New';
    case 2:
      return 'Learning';
    case 3:
      return 'Review';
    case 4:
      return 'Relearning';
    default:
      return 'Unknown';
  }
};
const gradeToText = (grade: number) => {
  switch (grade) {
    case 1:
      return 'Again';
    case 2:
      return 'Hard';
    case 3:
      return 'Good';
    case 4:
      return 'Easy';
    default:
      return 'Unknown';
  }
};

function ReviewLogTable({ log, onClose }: ReviewLogTableProps) {
  return (
    <View>
      <View>
        <Text style={styles.headerText}>Logs</Text>
      </View>

      <View style={{ maxHeight: 400 }}>
        <FlatList
          data={log}
          ListHeaderComponent={
            <View style={styles.tableHeaderRow}>
              <View style={{ flex: 0.15 }}>
                <Text style={styles.tableHeaderText}>Grade</Text>
              </View>
              <View style={{ flex: 0.15 }}>
                <Text style={styles.tableHeaderText}>State</Text>
              </View>
              <View style={{ flex: 0.35 }}>
                <Text style={styles.tableHeaderText}>Scheduled</Text>
              </View>
              <View style={{ flex: 0.35 }}>
                <Text style={styles.tableHeaderText}>Reviewed</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <View style={{ flex: 0.15 }}>
                <Text style={styles.tableRowText}>{gradeToText(item.grade)}</Text>
              </View>
              <View style={{ flex: 0.15 }}>
                <Text style={styles.tableRowText}>{cardStateToText(item.cardState)}</Text>
              </View>
              <View style={{ flex: 0.35 }}>
                <Text style={styles.tableRowText}>
                  {item.scheduledReviewTime
                    ? new Date(item.scheduledReviewTime).toLocaleString()
                    : ''}
                </Text>
              </View>
              <View style={{ flex: 0.35 }}>
                <Text style={styles.tableRowText}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <PrimaryButton text={i18n.t('common.back') || 'Back'} onClick={onClose} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    textAlign: 'right',
  },
  tableRowText: {
    fontSize: 11,
    fontWeight: 'normal',
    marginBottom: 2,
    textAlign: 'left',
  },
});

export default ReviewLogTable;
