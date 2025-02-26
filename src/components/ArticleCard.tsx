import {
    StyleSheet,
    Text,
    View,
    Image,
    Pressable,
  } from 'react-native';
  import React from 'react';
  import {fp, hp} from '../helper/Metric';
  import {ArticleCardProps,} from '../type';
  import moment from 'moment';
  import {BUTTON_COLOR} from '../helper/Theme';
import { GET_IMAGE } from '../helper/APIUtils';
 // import {formatCount} from '../helper/Utils';
 /*
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
  } from 'react-native-reanimated';
   */
  //import ArticleFloatingMenu from './ArticleFloatingMenu';
  //import io from 'socket.io-client';
  //import Share from 'react-native-share';
  //import RNFS from 'react-native-fs';
  //import RNHTMLtoPDF from 'react-native-html-to-pdf';
  //import {useSocket} from '../../SocketContext';
  
  const ArticleCard = ({
    item,
    //navigation,
   // isSelected,
   // setSelectedCardId,
    success,
   // handleRepostAction,
    //handleReportAction,
  }: ArticleCardProps) => {
  
  
    //const socket = io('http://51.20.1.81:8084');
   // const socket = useSocket();
   // const width = useSharedValue(0);
   // const yValue = useSharedValue(60);
  
    /*
    const menuStyle = useAnimatedStyle(() => {
      return {
        width: width.value,
        transform: [{translateY: yValue.value}],
      };
    });
    */
    //console.log('Image Utils', item?.imageUtils[0]);
  /*
    const handleAnimation = () => {
      if (width.value === 0) {
        width.value = withTiming(250, {duration: 250});
        yValue.value = withTiming(-1, {duration: 250});
        setSelectedCardId(item._id);
      } else {
        width.value = withTiming(0, {duration: 250});
        yValue.value = withTiming(100, {duration: 250});
        setSelectedCardId('');
      }
    };
    */
  


    return (
      <Pressable
        onPress={() => {
         // width.value = withTiming(0, {duration: 250});
         // yValue.value = withTiming(100, {duration: 250});
       //   setSelectedCardId('');
         // navigation.navigate('ArticleScreen', {
         //   articleId: Number(item._id),
         //   authorId: item.authorId,
         // });
         success();
        }}>
        <View style={styles.cardContainer}>
          {/* Image Section */}
          {item?.imageUtils[0] && item?.imageUtils[0].length !== 0 ? (
            <Image
              source={{
                uri: item?.imageUtils[0].startsWith('http')
                  ? item?.imageUtils[0]
                  : `${GET_IMAGE}/${item?.imageUtils[0]}`,
              }}
              style={styles.image}
            />
          ) : (
            <Image
              source={require('../../assets/article_default.jpg')}
              style={styles.image}
            />
          )}
  
          <View style={styles.textContainer}>
            {/* Share Icon */}
            {
            /*isSelected && (
              <Animated.View style={[menuStyle, styles.shareIconContainer]}>
                <ArticleFloatingMenu
                  items={[
                    {
                      name: 'Share this post',
                      action: () => {
                        handleShare();
                        handleAnimation();
                      },
                      icon: 'sharealt',
                    },
                    {
                      name: 'Download as pdf',
                      action: () => {
                        handleAnimation();
                        if (item?.content?.endsWith('html')) {
                          generatePDFFromUrl(
                            `${GET_STORAGE_DATA}/${item?.content}`,
                            item?.title,
                          );
                        } else {
                          generatePDF(item?.title, item?.content);
                        }
                      },
                      icon: 'download',
                    },
                    {
                      name: 'Request to edit',
                      action: () => {
                        handleAnimation();
                      },
                      icon: 'edit',
                    },
                    {
                      name: 'Report this post',
                      action: () => {
                        handleReportAction(item);
                        handleAnimation();
                      },
                      icon: 'infocirlce',
                    },
                  ]}
                />
              </Animated.View>
            )
              */}
  
            {/* Icon for more options 
            <TouchableOpacity
              style={styles.shareIconContainer}
              onPress={() => handleAnimation()}>
              <Entypo name="dots-three-vertical" size={20} color={'black'} />
            </TouchableOpacity>
            */}
  
            {/* Title & Footer Text */}
            <Text style={styles.footerText}>
              {item?.tags.map(tag => tag.name).join(' | ')}
            </Text>
            <Text style={styles.title}>{item?.title}</Text>
  
            <Text style={styles.footerText1}>
              {item?.authorName} {''}
            </Text>
        
            <Text style={styles.footerText1}>
              Last updated: {''}
              {moment(new Date(item?.lastUpdated)).format('DD/MM/YYYY')}
            </Text>
  
            {/* Like, Save, and Comment Actions */}
        
          </View>
        </View>
      </Pressable>
  
   
    );
  };
  
  export default ArticleCard;
  
  const styles = StyleSheet.create({
    cardContainer: {
      flex: 0,
      width: '100%',
      maxHeight: 390,
      backgroundColor: '#ffffff',
      flexDirection: 'row',
      marginVertical: 14,
      overflow: 'hidden',
      elevation: 4,
  
      borderRadius: 12,
    },
    image: {
      flex: 0.8,
      resizeMode: 'cover',
    },
  
    likeSaveContainer: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 6,
      justifyContent: 'space-between',
    },
  
    likeSaveChildContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginHorizontal: hp(0),
      marginVertical: hp(1),
    },
    textContainer: {
      flex: 1,
      backgroundColor: 'white',
      paddingHorizontal: 10,
      paddingVertical: 13,
    },
    title: {
      fontSize: fp(5.5),
      fontWeight: 'bold',
      color: '#121a26',
      marginBottom: 4,
      fontFamily: 'Lobster-Regular',
    },
    description: {
      fontSize: fp(3),
      fontWeight: '500',
      lineHeight: 18,
      color: '#778599',
      marginBottom: 10,
      fontFamily: 'monospace',
    },
    footerText: {
      fontSize: fp(3.9),
      fontWeight: '700',
      color: BUTTON_COLOR,
      marginBottom: 3,
    },
  
    footerText1: {
      fontSize: fp(3.5),
      fontWeight: '600',
      color: '#121a26',
      marginBottom: 3,
    },
  
    footerContainer: {
      flex: 0,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    shareIconContainer: {
      position: 'absolute',
      top: 2,
      right: 1,
      zIndex: 1,
    },
});