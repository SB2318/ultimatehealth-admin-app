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
import React from 'react';

const screenWidth = Dimensions.get('window').width;

export default function CopyrightCheckerModal({
  isVisible,
  onClose,
  data,
}: CopyrightCheckerProps) {
  const renderItem = ({item}: {item: CopyrightCheckerResponse}) => {
    const {copyrighted_content, copyright_found, image_url, extracted_text} =
      item;

    return (
      <View style={styles.card}>
        <Text style={styles.imageTitle}>
          Image: {image_url.split('/').pop()}
        </Text>
        <Image
          source={{uri: image_url}}
          style={styles.image}
          resizeMode="cover"
        />
        {copyright_found ? (
          <View style={styles.resultContainer}>
            <Text style={styles.foundText}>⚠️ Copyrighted Content Found</Text>

            <Text style={styles.contentText}>
              Extracted Text: {extracted_text}
            </Text>
            {copyrighted_content.length > 0 ? (
              copyrighted_content.map((it, idx) => (
                <React.Fragment key={idx}>
                  <Text style={styles.contentText}>Text: {it.text}</Text>
                  <Text style={styles.confidenceText}>
                    Confidence: {parseFloat(it.confidence).toFixed(2)}
                  </Text>
                </React.Fragment>
              ))
            ) : (
              <>
                <Text style={styles.noContent}>
                  No copyrighted content found.
                </Text>
                <Text style={styles.contentText}>
                  Extracted Text: {extracted_text}
                </Text>
              </>
            )}
          </View>
        ) : (
          <React.Fragment>
            <Text style={styles.noContent}>✅ No Copyright Detected</Text>

            <View style={styles.extractionSection}>
              <Text style={styles.extractionLabel}>
                📝 Extracted Information:
              </Text>
              <Text style={styles.extractedText}>
                {extracted_text || 'N/A'}
              </Text>
            </View>
          </React.Fragment>
        )}
      </View>
    );
  };
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Copyright Checker Results</Text>

          <Text style={styles.disclaimerText}>
            ⚠️ Disclaimer: The copyright check is based on information we found from
  the image. If you notice any mismatch or have a more accurate result,
  please rely on your judgment. Final selection is always your own
  responsibility.
          </Text>

          {data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No images to display.</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 20}}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: screenWidth * 0.95,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageTitle: {
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#ddd',
  },
  resultContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 6,
  },
  foundText: {
    color: '#856404',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentText: {
    color: '#333',
    fontWeight: '500',
  },
  confidenceText: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  noContent: {
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 5,
  },
  closeButton: {
    marginTop: 10,
    width: screenWidth * 0.5,
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
  },
  extractionSection: {
    marginTop: 8,
    backgroundColor: '#eef6ff',
    padding: 8,
    borderRadius: 6,
  },
  extractionLabel: {
    fontWeight: '600',
    color: '#0056b3',
    marginBottom: 4,
  },
  extractedText: {
    color: '#333',
    fontSize: 14,
  },
  disclaimerText: {
    fontSize: 16,
    color: '#333',
    //textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
});
