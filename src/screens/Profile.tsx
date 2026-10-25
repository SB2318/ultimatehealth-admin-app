import React, {useCallback, useEffect} from 'react';
import {Alert, useColorScheme, View} from 'react-native';
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
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  BORDER_COLOR,
  CARD_BG,
  SCREEN_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  DARK_THEME,
} from '../helper/Theme';

const COLORS = {
  light: {
    background: SCREEN_BG,
    surface: CARD_BG,
    text: TEXT_PRIMARY,
    secondaryText: TEXT_SECONDARY,
    primary: PRIMARY_COLOR,
    border: BORDER_COLOR,
  },
  dark: {
    background: DARK_THEME.screenBg,
    surface: DARK_THEME.cardBg,
    text: DARK_THEME.textPrimary,
    secondaryText: DARK_THEME.textSecondary,
    primary: DARK_THEME.primary,
    border: DARK_THEME.borderColor,
  },
};

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const {user_token, isSuperAdmin, user_handle: reduxUserHandle, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const dispatch = useDispatch();

  const {data: user, refetch, isLoading} = useQuery({
    queryKey: ['get-profile', isGuest],
    queryFn: async () => {
      if (isGuest) {
        return {
          _id: 'guest_reviewer_id',
          user_name: 'Dr. Guest Explorer',
          user_handle: 'guest_explorer',
          email: 'reviewer@ultimatehealth.blog',
          Profile_avtar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop',
        } as Admin;
      }
      const res = await axios.get(GET_PROFILE_API, {
        headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
      });
      const data = res.data;
      return (data?.user || data?.data || data?.admin || data) as Admin;
    },
    enabled: isGuest || (!!user_token && isConnected),
  });

  const resolvedUser = (user as any)?.user || (user as any)?.data || user;
  const username = isGuest ? 'Dr. Guest Explorer' : (resolvedUser?.user_name || resolvedUser?.name || 'Admin');
  const userhandle = isGuest ? 'guest_explorer' : (resolvedUser?.user_handle || resolvedUser?.user_Handle || resolvedUser?.userHandle || reduxUserHandle || '');
  const profileImg = isGuest
    ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop'
    : (resolvedUser?.Profile_avtar || resolvedUser?.profile_avtar || resolvedUser?.Profile_avatar || resolvedUser?.profile_image || resolvedUser?.avatar || '');

  useEffect(() => {
    if (userhandle) {
      dispatch(setUserHandle(userhandle));
    }
  }, [userhandle, dispatch]);

  const renderHeader = () => (
    <ProfileHeader
      username={username}
      userhandle={userhandle}
      profileImg={profileImg}
      isSuperAdmin={isSuperAdmin}
      onSuperAdminClick={() => navigation.navigate('SuperAdminDashboard')}
      onOverviewClick={() => navigation.navigate('WorkHistoryScreen')}
      onEditProfileClick={() => {
        if (isGuest) {
          Alert.alert(
            'Guest Explorer Mode',
            'Profile editing is disabled in Guest Mode. You have full access to explore moderation workflows, read clinical articles, and review audio broadcasts.',
          );
        } else {
          navigation.navigate('EditProfile');
        }
      }}
      onLogoutClick={() => navigation.navigate('LogoutScreen', {
        profile_image: profileImg,
        username: username,
      })}
      userEmailID={isGuest ? 'reviewer@ultimatehealth.blog' : ''}
      contriutions={''}
    />
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
        headerHeight={isSuperAdmin ? 415 : 370} // Adjust based on ProfileHeader height
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