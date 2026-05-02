// import React, {useEffect} from 'react';
// import {View, Text, StyleSheet, Image} from 'react-native';
// import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// //import {SplashScreenProp, User} from '../type';
// import {clearStorage, KEYS, retrieveItem} from '../helper/Utils';
// import {useDispatch} from 'react-redux';
// import VersionCheck from 'react-native-version-check';

// import {setUserHandle, setUserId, setUserToken} from '../stores/UserSlice';
// import axios from 'axios';
// import {SplashScreenProp} from '../type';
// import {useCheckTokenStatus} from '../hooks/useGetTokenStatus';
// // eslint-disable-next-line @typescript-eslint/no-unused-vars

// export default function SplashScreen({navigation}: SplashScreenProp) {
//   const dispatch = useDispatch();
//   const currentVersion = VersionCheck.getCurrentVersion();

//   const {data: tokenRes, isLoading} = useCheckTokenStatus();

//   useEffect(() => {
//     console.log('Token status:', tokenRes);
//     if (tokenRes && tokenRes.isValid) {
//       checkLoginStatus();
//     } else {
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{name: 'LoginScreen'}],
//         });
//       }, 2000);
//     }
//   }, [tokenRes]);

//   // function isDateMoreThanSevenDaysOld(dateString: string) {
//   //   const inputDate = new Date(dateString).getTime();
//   //   const currentDate = new Date().getTime();
//   //   const timeDifference = currentDate - inputDate;
//   //   const daysDifference = timeDifference / (1000 * 3600 * 24);
//   //   return daysDifference >= 6;
//   // }

//   // const getUserData = async (user_token: string) => {
//   //   try {
//   //     const response = await axios.get(`${GET_PROFILE_API}`, {
//   //       //headers: {
//   //       //  Authorization: `Bearer ${user_token}`,
//   //       //},
//   //     });

//   //     return response.data.profile as Admin;
//   //   } catch (err: any) {
//   //     // Token is blacklisted
//   //     const status = err.response.status;
//   //     //console.log('lOGIN STATUS', status);

//   //     if (status === 403) {
//   //       Alert.alert(
//   //         'Session Expired',
//   //         'You have logged in from a different device. Please create a new login session. Your previous session has been terminated.',
//   //         [
//   //           {
//   //             text: 'continue',
//   //             onPress: () => {
//   //               navigation.reset({
//   //                 index: 0,
//   //                 routes: [{name: 'LoginScreen'}],
//   //               });
//   //             },
//   //           },
//   //           {
//   //             text: 'exit',
//   //             onPress: () => {
//   //               BackHandler.exitApp(); // This works on Android, for iOS it is not possible
//   //             },
//   //           },
//   //         ],
//   //         {cancelable: false},
//   //       );
//   //     }
//   //   }
//   // };

//   const checkLoginStatus = async () => {
//     if (!tokenRes) {
//       return;
//     }
//     try {
//       const userId = await retrieveItem(KEYS.USER_ID);
//       const user = await retrieveItem(KEYS.USER_TOKEN);
//       const user_handle = await retrieveItem(KEYS.USER_HANDLE);
//       if (tokenRes?.isValid) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${user}`;
//         dispatch(setUserId(userId));
//         dispatch(setUserToken(user));
//         dispatch(setUserHandle(user_handle));

//         setTimeout(() => {
//           navigation.reset({
//             index: 0,
//             routes: [{name: 'TabScreen'}],
//           });
//         }, 2000);
//       } else {
//         await clearStorage();
//         navigation.reset({
//           index: 0,
//           routes: [{name: 'LoginScreen'}],
//         });
//       }
//     } catch (error) {
//       console.error('Error retrieving user data from storage', error);
//       await clearStorage();
//       // navigation.navigate('LoginScreen');
//       navigation.reset({
//         index: 0,
//         routes: [{name: 'LoginScreen'}],
//       });
//     }
//   };

//   // const checkLoginStatus = async () => {
//   //   try {
//   //     const userId = await retrieveItem(KEYS.USER_ID);
//   //     //console.log('User Id', userId);
//   //     const user = await retrieveItem(KEYS.USER_TOKEN);

//   //     const user_handle = await retrieveItem(KEYS.USER_HANDLE);
//   //     const expiryDate = await retrieveItem(KEYS.USER_TOKEN_EXPIRY_DATE);
//   //     if (
//   //       user_handle &&
//   //       user &&
//   //       expiryDate &&
//   //       !isDateMoreThanSevenDaysOld(expiryDate)
//   //     ) {
//   //       // check if token blacklisted or not, later more than 7 days check will remove no need

//   //      // set default axios header
//   //      axios.defaults.headers.common['Authorization'] = `Bearer ${user}`;

//   //       await getUserData(user);

//   //       dispatch(setUserId(userId));
//   //       dispatch(setUserToken(user));
//   //       dispatch(setUserHandle(user_handle));

//   //       navigation.reset({
//   //         index: 0,
//   //         routes: [{name: 'TabScreen'}], // Send user to LoginScreen after logout
//   //       });
//   //     } else {
//   //       await clearStorage();
//   //       navigation.reset({
//   //         index: 0,
//   //         routes: [{name: 'LoginScreen'}], // Send user to LoginScreen after logout
//   //       });
//   //     }
//   //   } catch (error) {
//   //     console.error('Error retrieving user data from storage', error);
//   //     await clearStorage();
//   //     // navigation.navigate('LoginScreen'); // Navigate to LoginPage if there's an error
//   //     navigation.reset({
//   //       index: 0,
//   //       routes: [{name: 'LoginScreen'}], // Send user to LoginScreen after logout
//   //     });
//   //   }
//   // };

//   // useEffect(() => {
//   //   const timer = setTimeout(() => {
//   //     checkLoginStatus();
//   //   // navigation.navigate('LoginScreen');
//   //   }, 3000);

//   //   return () => {
//   //     clearTimeout(timer);
//   //   };
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [navigation]);

//   // return (
//   //   <View style={styles.container}>
//   //     <Image
//   //       source={require('../../assets/images/icon.png')}
//   //       style={styles.icon}
//   //     />
//   //     <Text style={styles.text}>Ultimate</Text>
//   //     <Text style={styles.text}>Health</Text>
//   //     <Text style={styles.text}>Admin</Text>
//   //   </View>
//   // );

//   return (
//     <View style={styles.container}>
//       <View style={styles.logoWrapper}>
//         <Image
//           source={require('../../assets/images/icon.png')}
//           style={styles.icon}
//         />
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.brandText}>
//           Ultimate<Text style={styles.boldText}>Health</Text>
//         </Text>
//         <Text style={styles.adminTag}>ADMIN</Text>
//       </View>

//       <Text style={styles.versionText}>v{currentVersion}</Text>
//     </View>
//   );
// }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: PRIMARY_COLOR,
// //   },
// //   icon: {
// //     width: 120,
// //     height: 120,
// //     borderRadius: 60,
// //     marginBottom: 10,
// //   },
// //   text: {
// //     fontSize: 22,
// //     // fontWeight: 'bold',
// //     color: ON_PRIMARY_COLOR,
// //     textAlign: 'center',
// //     fontFamily: 'Lobster-Regular',
// //   },
// // });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: PRIMARY_COLOR,
//   },
//   logoWrapper: {
//     // Subtle shadow for depth
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 5},
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     marginBottom: 20,
//   },
//   icon: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     borderWidth: 3,
//     borderColor: ON_PRIMARY_COLOR,
//   },
//   textContainer: {
//     alignItems: 'center',
//   },
//   brandText: {
//     fontSize: 32,
//     color: ON_PRIMARY_COLOR,
//     fontFamily: 'Lobster-Regular',
//     letterSpacing: 1,
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
//   adminTag: {
//     fontSize: 14,
//     color: ON_PRIMARY_COLOR,
//     fontWeight: '700',
//     letterSpacing: 4,
//     marginTop: 5,
//     opacity: 0.8,
//     textTransform: 'uppercase',
//   },
//   versionText: {
//     position: 'absolute',
//     bottom: 30,
//     fontSize: 12,
//     color: ON_PRIMARY_COLOR,
//     opacity: 0.5,
//   },
// });



import React, {useEffect} from 'react';
import {View, Image, useColorScheme} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {YStack, Text} from 'tamagui';
import {useDispatch} from 'react-redux';
import VersionCheck from 'react-native-version-check';

import {clearStorage, KEYS, retrieveItem} from '../helper/Utils';
import {setUserHandle, setUserId, setUserToken} from '../stores/UserSlice';
import {useCheckTokenStatus} from '../hooks/useGetTokenStatus';
import axios from 'axios';
import { SplashScreenProp } from '../type';

const COLORS = {
  background: '#0B1425',
  text: '#F1F5F9',
  accent: '#4ACDFF',
};

export default function SplashScreen({navigation}: SplashScreenProp) {
  const dispatch = useDispatch();
  const currentVersion = VersionCheck.getCurrentVersion();

  const {data: tokenRes} = useCheckTokenStatus();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (tokenRes?.isValid) {
        await checkLoginStatus();
      } else {
        await clearStorage();
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [tokenRes]);

  const checkLoginStatus = async () => {
    try {
      const userId = await retrieveItem(KEYS.USER_ID);
      const userToken = await retrieveItem(KEYS.USER_TOKEN);
      const userHandle = await retrieveItem(KEYS.USER_HANDLE);

      if (userId && userToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

        dispatch(setUserId(userId));
        dispatch(setUserToken(userToken));
        dispatch(setUserHandle(userHandle));

        navigation.reset({
          index: 0,
          routes: [{name: 'TabScreen'}],
        });
      } else {
        await clearStorage();
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        });
      }
    } catch (error) {
      console.error('Splash Error:', error);
      await clearStorage();
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <YStack alignItems="center" gap="$6">
        {/* Logo with Glow */}
        <View
          style={{
            shadowColor: COLORS.accent,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.6,
            shadowRadius: 30,
            elevation: 30,
          }}>
          <Image
            source={require('../../assets/images/ic_admin.png')}
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 4,
              borderColor: COLORS.accent,
            }}
          />
        </View>

        {/* Brand Text */}
        <YStack alignItems="center">
          <Text
            fontSize={42}
            fontWeight="700"
            color={COLORS.text}
            letterSpacing={1.5}>
            Ultimate
          </Text>
          <Text
            fontSize={42}
            fontWeight="700"
            color={COLORS.background}
            letterSpacing={1.5}
            marginTop={-8}>
            Health
          </Text>
          <Text
            fontSize={18}
            fontWeight="700"
            color="#0A3878"
            letterSpacing={6}
            marginTop={8}
            textTransform="uppercase">
            ADMIN
          </Text>
        </YStack>

        {/* Version */}
        <Text
          position="absolute"
          bottom={40}
          fontSize={13}
          color="#64748B"
          opacity={0.6}>
          v{currentVersion}
        </Text>
      </YStack>
    </SafeAreaView>
  );
}