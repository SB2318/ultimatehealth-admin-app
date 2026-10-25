import React, {useEffect, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'tamagui';
import {useDispatch} from 'react-redux';
import VersionCheck from 'react-native-version-check';
import axios from 'axios';

import {clearStorage, KEYS, retrieveItem, storeItem} from '../helper/Utils';
import {setUserHandle, setUserId, setUserToken, setIsSuperAdmin, resetUserState} from '../stores/UserSlice';
import {GET_PROFILE_API} from '../helper/APIUtils';
import {checkTokenStatusApi} from '../hooks/useGetTokenStatus';
import {SplashScreenProp} from '../type';

const PORTAL_COLORS = {
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#0284C7',
  primaryLight: '#E0F2FE',
  primarySubtle: '#F0F9FF',
  success: '#10B981',
};

export default function SplashScreen({navigation}: SplashScreenProp) {
  const dispatch = useDispatch();
  const currentVersion = VersionCheck.getCurrentVersion();
  const hasNavigated = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1400));

      try {
        const [userId, userToken, userHandle, isSuperAdminStr] = await Promise.all([
          retrieveItem(KEYS.USER_ID),
          retrieveItem(KEYS.USER_TOKEN),
          retrieveItem(KEYS.USER_HANDLE),
          retrieveItem(KEYS.IS_SUPER_ADMIN),
        ]);

        if (!userId || !userToken) {
          await minDisplayTime;
          if (isMounted && !hasNavigated.current) {
            hasNavigated.current = true;
            navigation.reset({
              index: 0,
              routes: [{name: 'LoginScreen'}],
            });
          }
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        axios.defaults.headers.common['x-type'] = 'mobile';
        axios.defaults.headers.common['x-client-type'] = 'mobile';
        axios.defaults.headers.common['x-type-header'] = 'mobile';

        dispatch(setUserId(userId));
        dispatch(setUserToken(userToken));
        if (userHandle) {
          dispatch(setUserHandle(userHandle));
        }
        if (isSuperAdminStr !== null && isSuperAdminStr !== undefined) {
          dispatch(setIsSuperAdmin(isSuperAdminStr === 'true'));
        }

        try {
          const tokenStatusPromise = checkTokenStatusApi(userToken);
          const [tokenStatus] = await Promise.all([
            tokenStatusPromise,
            minDisplayTime,
          ]);

          if (tokenStatus.isValid) {
            if (tokenStatus.user) {
              if (tokenStatus.user.userId) {
                dispatch(setUserId(tokenStatus.user.userId));
                await storeItem(KEYS.USER_ID, tokenStatus.user.userId);
              }
              if (tokenStatus.user.isSuperAdmin !== undefined) {
                const isAdmin = Boolean(tokenStatus.user.isSuperAdmin);
                dispatch(setIsSuperAdmin(isAdmin));
                await storeItem(KEYS.IS_SUPER_ADMIN, JSON.stringify(isAdmin));
              }
            }

            try {
              const profileRes = await axios.get(GET_PROFILE_API, {
                headers: {Authorization: `Bearer ${userToken}`},
                timeout: 3000,
              });
              const profile = profileRes?.data?.profile || profileRes?.data?.user;
              if (profile?.user_handle) {
                dispatch(setUserHandle(profile.user_handle));
                await storeItem(KEYS.USER_HANDLE, profile.user_handle);
              }
            } catch {
              // Non-fatal
            }
          } else if (!tokenStatus.isNetworkError) {
            await clearStorage();
            dispatch(resetUserState());
            if (isMounted && !hasNavigated.current) {
              hasNavigated.current = true;
              navigation.reset({
                index: 0,
                routes: [{name: 'LoginScreen'}],
              });
            }
            return;
          }
        } catch {
          await minDisplayTime;
        }

        if (isMounted && !hasNavigated.current) {
          hasNavigated.current = true;
          navigation.reset({
            index: 0,
            routes: [{name: 'TabScreen'}],
          });
        }
      } catch (err) {
        console.error('Splash authentication init error:', err);
        await minDisplayTime;
        if (isMounted && !hasNavigated.current) {
          hasNavigated.current = true;
          navigation.reset({
            index: 0,
            routes: [{name: 'LoginScreen'}],
          });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={PORTAL_COLORS.background} />

      {/* Center Portal Box */}
      <View style={styles.centerContainer}>
        <View style={styles.portalCard}>
          {/* Logo Frame */}
          <View style={styles.logoTile}>
            <Image
              source={require('../../assets/images/ic_admin.png')}
              style={styles.logoImage}
            />
          </View>

          {/* Portal Title */}
          <View style={styles.titleRow}>
            <Text style={styles.titleDark}>Ultimate</Text>
            <Text style={styles.titleBlue}>Health</Text>
          </View>

          <Text style={styles.portalSubtitle}>
            Administrative & Reviewer Portal
          </Text>

          {/* Connecting Indicator */}
          <View style={styles.indicatorRow}>
            <ActivityIndicator size="small" color={PORTAL_COLORS.primary} />
            <Text style={styles.indicatorText}>
              Verifying reviewer credentials...
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Compliance Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerVersion}>
          v{currentVersion} • Certified Healthcare Management System
        </Text>
        <Text style={styles.footerSub}>
          Authorized Reviewer Portal
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PORTAL_COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  topStatusStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderColor: PORTAL_COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PORTAL_COLORS.success,
  },
  topStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: PORTAL_COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  centerContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  portalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: PORTAL_COLORS.cardBg,
    borderColor: PORTAL_COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  logoTile: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: PORTAL_COLORS.primarySubtle,
    borderWidth: 1.5,
    borderColor: PORTAL_COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: PORTAL_COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  titleDark: {
    fontSize: 28,
    fontWeight: '800',
    color: PORTAL_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  titleBlue: {
    fontSize: 28,
    fontWeight: '800',
    color: PORTAL_COLORS.primary,
    letterSpacing: -0.5,
  },
  portalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: PORTAL_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  portalPill: {
    backgroundColor: PORTAL_COLORS.primarySubtle,
    borderColor: PORTAL_COLORS.primaryLight,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 24,
  },
  portalPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: PORTAL_COLORS.primary,
    letterSpacing: 1.2,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  indicatorText: {
    fontSize: 13,
    fontWeight: '500',
    color: PORTAL_COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 6,
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: PORTAL_COLORS.textSecondary,
  },
  footerSub: {
    fontSize: 11,
    color: PORTAL_COLORS.textMuted,
  },
});
