import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import {fp, hp, wp} from '../helper/Metric';
import {ReviewCardProps} from '../type';
import moment from 'moment';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {StatusEnum} from '../helper/Utils';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
import {Entypo, AntDesign} from '@expo/vector-icons';
import { GET_STORAGE_DATA } from '../helper/APIUtils';

const ReviewCard = ({
  item,
  onclick,
  isSelected,
  setSelectedCardId,
  onNavigate,
}: ReviewCardProps) => {

  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

  const backgroundColor =
    item?.status === StatusEnum.PUBLISHED
      ? '#10b981'
      : item?.status === StatusEnum.DISCARDED
      ? '#ef4444'
      : BUTTON_COLOR;

  const statusTextColor =
    item?.status === StatusEnum.PUBLISHED
      ? '#10b981'
      : item?.status === StatusEnum.DISCARDED
      ? '#ef4444'
      : BUTTON_COLOR;

  const menuStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ translateY: yValue.value }],
    opacity: width.value > 0 ? 1 : 0,
  }));

  const handleAnimation = () => {
    if (width.value === 0) {
      width.value = withTiming(260, { duration: 280 });
      yValue.value = withTiming(4, { duration: 280 });
      setSelectedCardId(item._id);
    } else {
      width.value = withTiming(0, { duration: 220 });
      yValue.value = withTiming(70, { duration: 220 });
      setSelectedCardId('');
    }
  };

  const unAssignActions = [
    {
      name: 'Pick Article',
      action: () => {
        onclick(item, 0, '');
        handleAnimation();
      },
      icon: 'hand-point-right',
      color: BUTTON_COLOR,
    },
    {
      name: 'Discard Article',
      action: () => {
        onclick(item, 1, '');
        handleAnimation();
      },
      icon: 'times-circle',
      color: '#ef4444',
    },
  ];

  const progressActions = [
    {
      name: 'Discard Article',
      action: () => {
        onclick(item, 1, '');
        handleAnimation();
      },
      icon: 'ban',
      color: '#ef4444',
    },
    {
      name: 'Unassign Yourself',
      action: () => {
        onclick(item, 2, '');
        handleAnimation();
      },
      icon: 'minus-circle',
      color: '#10b981',
    },
  ];

  // Banner Image
  const bannerImage =
  item?.imageUtils?.[0]?.startsWith('http')
    ? item.imageUtils[0]
    : `${GET_STORAGE_DATA}/${item?.imageUtils?.[0] ?? ''}`;

 return (
  <Pressable
    onPress={() => {
      width.value = withTiming(0, { duration: 200 });
      yValue.value = withTiming(70, { duration: 200 });
      setSelectedCardId('');
      onNavigate(item);
    }}
    style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}>
    <View style={styles.cardContainer}>
      {isSelected && (
        <Animated.View style={[menuStyle, styles.floatingMenuContainer]}>
          <ArticleFloatingMenu
            items={
              item.status === StatusEnum.UNASSIGNED
                ? unAssignActions
                : progressActions
            }
            top={hp(1.5)}
            left={wp(2)}
          />
        </Animated.View>
      )}

      <View style={styles.contentContainer}>
        {/* Banner */}
        {bannerImage ? (
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: bannerImage }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            {item.status !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                style={styles.imageMoreButton}
                onPress={handleAnimation}
                activeOpacity={0.8}>
                <Entypo
                  name="dots-three-vertical"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Tags */}
        {item?.tags?.length > 0 && (
          <Text style={styles.tags}>
            {item.tags.map((tag: any) => tag.name).join(' • ')}
          </Text>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {item?.title}
        </Text>

        {/* Author */}
        {item?.authorName ? (
          <Text style={styles.author}>By {item.authorName}</Text>
        ) : null}

        {/* Description */}
        <Text style={styles.description} numberOfLines={4}>
          {item?.description}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.dateText}>
              Last updated:{' '}
              {moment(new Date(item?.lastUpdated)).format('DD MMM YYYY')}
            </Text>

            <View style={{ marginTop: 4 }}>
              <Text style={[styles.status, { color: statusTextColor }]}>
                {item?.status ? item.status.toUpperCase() : 'UNKNOWN'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onNavigate(item)}
            activeOpacity={0.8}>
            <Text style={styles.viewButtonText}>View Article</Text>
            <AntDesign
              name="arrow-right"
              size={15}
              color={PRIMARY_COLOR}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Pressable>
);
};

export default ReviewCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '99%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: '#f1f1f1',
    // Height ab flexible hai
  },

  floatingMenuContainer: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 10,
  },


contentContainer: {
  paddingHorizontal: 4,
  paddingBottom: 6,
},

bannerContainer: {
  position: 'relative',
  marginBottom: 14,
},

bannerImage: {
  width: '100%',
  height: hp(21),
  borderRadius: 14,
},

tags: {
  fontSize: fp(3.5),
  fontWeight: '600',
  color: BUTTON_COLOR,
  marginBottom: 10,
  marginTop: 6,
},

title: {
  fontSize: fp(7.3),
  lineHeight: 24,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 8,
},

author: {
  fontSize: fp(3.7),
  color: '#6b7280',
  fontWeight: '500',
  marginBottom: 10,
},

description: {
  fontSize: fp(4),
  lineHeight: 20,
  color: '#64748b',
  marginBottom: 18,
},

footer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginTop: 8,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#f1f5f9',
},

dateText: {
  fontSize: fp(3.5),
  color: '#94a3b8',
  marginBottom: 6,
},

status: {
  fontSize: fp(3.8),
  fontWeight: '700',
  letterSpacing: 0.4,
  marginTop: 2,
},

viewButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  paddingVertical: 9,
  paddingHorizontal: 16,
  borderRadius: 30,
  borderWidth: 1,
  borderColor: '#e2e8f0',
},

imageMoreButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 10,
  backgroundColor: 'rgba(0,0,0,0.28)',
  padding: 8,
  borderRadius: 22,
},

  moreButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 5,
    padding: 6,
  },



  viewButtonText: {
    fontSize: fp(4.1),
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
});