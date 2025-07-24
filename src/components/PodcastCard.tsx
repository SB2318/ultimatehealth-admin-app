import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {hp, wp} from '../helper/Metric';
import {Category} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';

interface PodcastProps {
  id: string;
  title: string;
  host: string;
  imageUri: string;
  tags: Category[];
  duration: string;
  handleClick: () => void;
  status: string;
}

const PodcastCard = ({
  title,
  host,
  imageUri,
  duration,
  status,
  tags,
  handleClick,
}: PodcastProps) => {
  type StatusType =
    | 'unassigned'
    | 'in-progress'
    | 'review-pending'
    | 'published'
    | 'discarded'
    | 'awaiting-user';

  type StatusStyle = {
    backgroundColor: string;
    textColor: string;
  };

  const STATUS_STYLES: Record<StatusType, StatusStyle> = {
    unassigned: {backgroundColor: '#A9A9A9', textColor: '#FFFFFF'},
    'in-progress': {backgroundColor: '#007AFF', textColor: '#FFFFFF'},
    'review-pending': {backgroundColor: '#FF9F0A', textColor: '#FFFFFF'},
    published: {backgroundColor: '#34C759', textColor: '#FFFFFF'},
    discarded: {backgroundColor: '#FF3B30', textColor: '#FFFFFF'},
    'awaiting-user': {backgroundColor: '#FFD60A', textColor: '#1C1C1E'},
  };

  const lowerStatus = status?.toLowerCase() as StatusType;
  const {backgroundColor, textColor} = STATUS_STYLES[lowerStatus] || {
    backgroundColor: '#D1D1D6',
    textColor: '#000000',
  };

  return (
    // Main container for the podcast card
    <View style={styles.container}>
      <View style={styles.imageTextContainer}>
        {/* Display the podcast image */}
        <Image
          source={{
            uri:
              imageUri && imageUri !== ''
                ? imageUri
                : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
          }}
          style={styles.image}
        />
        <View>
          {/* Display the podcast title */}
          <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
            {title}
          </Text>
          {/* Display the podcast host */}
          <Text style={styles.host}>{host}</Text>

          <View style={styles.tagsContainer}>
            {tags?.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.tagText}>
                #{tag.name}
              </Text>
            ))}
          </View>


        <Text style={[styles.statusText, { color: backgroundColor }]}>
          {status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
    
        </View>
      </View>

  
    
      <View style={styles.playContainer}>
        <TouchableOpacity onPress={handleClick}>
          <Feather name="chevrons-right" size={26} color={'black'} />
        </TouchableOpacity>

        <Text style={styles.durationText}>{duration}</Text>
      </View>

      
    </View>
  );
};

// Styles for the PodcastCard component
const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    padding: 7,
  },
  imageTextContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    height: hp(16),
    width: wp(29),
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
    maxWidth: wp(40),
  },
  host: {
    fontSize: 14,
    fontWeight: 'regular',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  playContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginLeft: 6,
    bottom: hp(2.5),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    rowGap: 4,
    columnGap: 8,
  },

  tagText: {
    backgroundColor: '#f0f0f0',
    color: PRIMARY_COLOR,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  shareIconContainer: {
    position: 'absolute',
    top: 1,
    right: 1,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  stausTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  statusBox: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },



});

export default PodcastCard;
