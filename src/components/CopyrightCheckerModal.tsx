import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import {CopyrightCheckerProps, CopyrightCheckerResponse} from '../type';

const screenWidth = Dimensions.get('window').width;

export default function CopyrightCheckerModal({
  isVisible,
  onClose,
  data,
}: CopyrightCheckerProps) {
  const renderItem = ({item}: {item: CopyrightCheckerResponse}) => {
    const {copyrighted_content, copyright_found, image_url, extracted_text} = item;

    return (
      <View style={styles.card}>
        {/* Image Header */}
        <Text style={styles.imageTitle}>
          {image_url.split('/').pop() || 'Uploaded Image'}
        </Text>

        <Image
          source={{uri: image_url}}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Result Section */}
        {copyright_found ? (
          <View style={styles.resultContainer}>
            <View style={styles.statusRow}>
              <Text style={styles.foundIcon}>⚠️</Text>
              <Text style={styles.foundText}>Copyright Violation Detected</Text>
            </View>

            {copyrighted_content.length > 0 ? (
              copyrighted_content.map((it, idx) => (
                <View key={idx} style={styles.matchItem}>
                  <Text style={styles.contentLabel}>Matched Text:</Text>
                  <Text style={styles.contentText}>{it.text}</Text>
                  <Text style={styles.confidenceText}>
                    Confidence: {parseFloat(it.confidence).toFixed(1)}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.contentText}>
                Extracted Text: {extracted_text || 'N/A'}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.safeContainer}>
            <View style={styles.statusRow}>
              <Text style={styles.safeIcon}>✅</Text>
              <Text style={styles.safeText}>No Copyright Issues Found</Text>
            </View>

            <View style={styles.extractionBox}>
              <Text style={styles.extractionLabel}>Extracted Text</Text>
              <Text style={styles.extractedText}>
                {extracted_text || 'No text extracted'}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Copyright Checker Results</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimerText}>
            This check is AI-assisted. Always verify results manually before final
            decisions.
          </Text>

          {data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No images processed yet.</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: screenWidth * 0.94,
    maxHeight: '88%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeIcon: {
    padding: 8,
  },
  closeIconText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '500',
  },
  disclaimerText: {
    fontSize: 13.5,
    color: '#6B7280',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  imageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foundIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  foundText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#B45309',
  },
  safeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  safeText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#166534',
  },
  resultContainer: {
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68C',
  },
  safeContainer: {
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  matchItem: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDE68C',
  },
  contentLabel: {
    fontSize: 13.5,
    color: '#6B7280',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 15.5,
    color: '#1F2937',
    lineHeight: 22,
  },
  confidenceText: {
    fontSize: 13.5,
    color: '#6B7280',
    marginTop: 4,
  },
  extractionBox: {
    marginTop: 12,
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
  },
  extractionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 6,
  },
  extractedText: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 21,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: screenWidth * 0.55,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});