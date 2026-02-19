/* eslint-disable react-native/no-inline-styles */
import {useQuery} from '@tanstack/react-query';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {ChangesHistoryScreenProp} from '../type';
import axios from 'axios';
import {GET_CHANGES_HISTORY} from '../helper/APIUtils';
import React, {useMemo, useRef} from 'react';
import WebView from 'react-native-webview';
import Loader from '../components/Loader';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import {baseHeight, height, scalePerChar, hp} from '../helper/Metric';
import {useSelector} from 'react-redux';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';

export default function ChangesHistoryScreen({
  route,
}: ChangesHistoryScreenProp) {
  const {requestId} = route.params;
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const {data: history, isLoading} = useQuery({
    queryKey: ['get-chages-history'],
    queryFn: async () => {
      //console.log("Headers", axios.defaults.headers);
      // console.log("request id", requestId);
      const response = await axios.get(
        `${GET_CHANGES_HISTORY}?requestId=${requestId}`,
      );
      // console.log("response", response);
      return response.data.diff as string;
    },
    enabled: !!isConnected && !!user_token,
  });


  if (isLoading) {
    return <Loader />;
  }
  console.log('History Length', history?.length);
  return (
    <ScrollView style={styles.container}>
      {/* <WebView
        style={{
          //minHeight: history ? history.length-6000 : 1,
          minHeight: minHeight,
          backgroundColor: ON_PRIMARY_COLOR,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        ref={webViewRef}
        originWhitelist={['*']}
        injectedJavaScript={cssCode}
        source={{html: history ? history : '<p>No changes made </p>'}}
        textZoom={100}
      /> */}

      <AutoHeightWebView
        style={{
          width: Dimensions.get('window').width - 15,
          marginTop: 35,
          marginBottom: hp(15)
        }}
        customStyle={`* { font-family: 'Times New Roman'; margin-left: 14px; } p { font-size: 16px; }`}
        onSizeUpdated={size => console.log(size.height)}
        files={[
          {
            href: 'cssfileaddress',
            type: 'text/css',
            rel: 'stylesheet',
          },
        ]}
        originWhitelist={['*']}
        source={{html: history ? history : '<p>No changes made </p>'}}
        scalesPageToFit={true}
        viewportContent={'width=device-width, user-scalable=no'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    //height:"100%",
    padding: 0,
    //width:"100%",
    // backgroundColor: ON_PRIMARY_COLOR,
  },

  descriptionContainer: {
    // flex: 1,
    marginTop: 7,

    backgroundColor: ON_PRIMARY_COLOR,
  },
});
