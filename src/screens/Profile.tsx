import React, {useCallback} from 'react';
import {useColorScheme, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import {useQuery} from '@tanstack/react-query';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import ProfileHeader from '../components/ProfileHeader';
import ActivityOverview from '../components/ActivityOverview';
import Loader from '../components/Loader';

import {GET_PROFILE_API} from '../helper/APIUtils';
import {setUserHandle} from '../stores/UserSlice';
import {ProfileScreenProps, Admin} from '../type';
import axios from 'axios';

const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    primary: '#2563EB',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    primary: '#3B82F6',
    border: '#334155',
  },
};

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const dispatch = useDispatch();

  const {data: user, refetch, isLoading} = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {
      const res = await axios.get(GET_PROFILE_API);
      return res.data as Admin;
    },
    enabled: !!user_token && isConnected,
  });

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }

  useFocusEffect(useCallback(() => {
    refetch();
  }, [refetch]));

  const renderHeader = () => (
    <ProfileHeader
      username={user?.user_name || 'Admin'}
      userhandle={user?.user_handle || ''}
      profileImg={user?.Profile_avtar}
      onOverviewClick={() => navigation.navigate('WorkHistoryScreen')}
      onEditProfileClick={() => navigation.navigate('EditProfile')}
      onLogoutClick={() => navigation.navigate('LogoutScreen', {
        profile_image: user?.Profile_avtar || '',
        username: user?.user_name || 'Admin User',
      })} userEmailID={''} contriutions={''}    />
  );

  const renderTabBar = (props: any) => (
    <MaterialTabBar
      {...props}
      indicatorStyle={{backgroundColor: colors.primary, height: 3, borderRadius: 3}}
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        shadowOpacity: 0,
      }}
      activeColor={colors.primary}
      inactiveColor={colors.secondaryText}
      labelStyle={{
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize',
      }}
    />
  );

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center'}}>
        <Loader />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <Tabs.Container
        initialTabName="Articles"
        renderHeader={renderHeader}
        renderTabBar={renderTabBar}
        headerHeight={380} // Adjust based on your ProfileHeader height
        containerStyle={{backgroundColor: colors.background}}
      >
        {/* Articles Tab */}
        <Tabs.Tab name="Articles">
          <Tabs.ScrollView showsVerticalScrollIndicator={false}>
            <ActivityOverview ctype={1} />
          </Tabs.ScrollView>
        </Tabs.Tab>

        {/* Revision Tab */}
        <Tabs.Tab name="Revision">
          <Tabs.ScrollView showsVerticalScrollIndicator={false}>
            <ActivityOverview ctype={2} />
          </Tabs.ScrollView>
        </Tabs.Tab>

        {/* Podcast Tab */}
        <Tabs.Tab name="Podcast">
          <Tabs.ScrollView showsVerticalScrollIndicator={false}>
            <ActivityOverview ctype={4} />
          </Tabs.ScrollView>
        </Tabs.Tab>

        {/* Report Tab */}
        <Tabs.Tab name="Report">
          <Tabs.ScrollView showsVerticalScrollIndicator={false}>
            <ActivityOverview ctype={3} />
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </SafeAreaView>
  );
};

export default ProfileScreen;