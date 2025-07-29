import {StyleSheet, Text, View} from 'react-native';
import React, {useCallback} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import ActivityOverview from '../components/ActivityOverview';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';

import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import {
  GET_PROFILE_API,
 
} from '../helper/APIUtils';
import {ProfileScreenProps, Admin} from '../type';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import Loader from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';
import {setUserHandle} from '../stores/UserSlice';

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const {user_token} = useSelector(
    (state: any) => state.user,
  );
  const dispatch = useDispatch();

   console.log('User token', user_token);

  const {
    data: user,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {

      const response = await axios.get(`${GET_PROFILE_API}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });
      return response.data as Admin;
    },
  });

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }
 

  const insets = useSafeAreaInsets();

 

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );


  const renderHeader = () => {
    if (user === undefined) {
      return null;
    } // Safeguard to prevent rendering if user is undefined

    return (
      <ProfileHeader
        username={user.user_name || ''}
        userhandle={user.user_handle || ''}
        profileImg={
          user?.Profile_avtar ||
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
        }
    
        userEmailID={user?.email}
        contriutions=''
    
        onOverviewClick={() => {
          if (user) {
            navigation.navigate('WorkHistoryScreen');
          }
        }}
        onEditProfileClick={()=>{
          navigation.navigate('EditProfile');
        }}
        onLogoutClick={()=>{
          navigation.navigate('LogoutScreen',{
            profile_image: user && user.Profile_avtar ? user.Profile_avtar: "",
            username: user?.user_name
          });
        }
        }
      />
    );
  };

  const renderTabBar = props => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={styles.indicatorStyle}
        style={styles.tabBarStyle}
        activeColor={PRIMARY_COLOR}
        inactiveColor="#9098A3"
        labelStyle={styles.labelStyle}
        contentContainerStyle={styles.contentContainerStyle}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>

       <View style={{marginVertical: 10, marginHorizontal:10}}>
            <Text style={styles.btnSMText}>Your Insights</Text>
        
          </View>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>

           
        <Tabs.Container
          renderHeader={renderHeader}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 1 */}
          <Tabs.Tab name="Articles">
            <Tabs.ScrollView
              automaticallyAdjustContentInsets={true}
              contentInsetAdjustmentBehavior="always"
              contentContainerStyle={styles.scrollViewContentContainer}>
              <ActivityOverview
               ctype={1}
              />
            </Tabs.ScrollView>
          </Tabs.Tab>
          {/* Tab 2 */}
          <Tabs.Tab name="Revisions">
           
          <Tabs.ScrollView
              automaticallyAdjustContentInsets={true}
              contentInsetAdjustmentBehavior="always"
              contentContainerStyle={styles.scrollViewContentContainer}>
          <ActivityOverview
              ctype={2} 
            />

            </Tabs.ScrollView>
          </Tabs.Tab>

          {/* Tab 3 */}
          <Tabs.Tab name="Podcasts">
           
          <Tabs.ScrollView
              automaticallyAdjustContentInsets={true}
              contentInsetAdjustmentBehavior="always"
              contentContainerStyle={styles.scrollViewContentContainer}>
           <ActivityOverview
              ctype={4} 
            />

            </Tabs.ScrollView>
          </Tabs.Tab>

          <Tabs.Tab name="Reports">

          <Tabs.ScrollView
              automaticallyAdjustContentInsets={true}
              contentInsetAdjustmentBehavior="always"
              contentContainerStyle={styles.scrollViewContentContainer}>
            <ActivityOverview
             ctype={3}  
            />
            </Tabs.ScrollView>
          </Tabs.Tab>
       
        </Tabs.Container>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CAFFF',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  tabsContainer: {
    backgroundColor: ON_PRIMARY_COLOR,
    overflow: 'hidden',
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
  },

  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
  },
  indicatorStyle: {
    backgroundColor: 'white',
  },
  tabBarStyle: {
    backgroundColor: ON_PRIMARY_COLOR,
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 14,
    color: 'black',
    textTransform: 'capitalize',
  },
  contentContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0,
    shadowOffset: {width: 0, height: 0},
    shadowColor: 'white',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSMText: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '600',
    //color: '#374151',
    color:"white"
  },
});
