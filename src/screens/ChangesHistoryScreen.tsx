/* eslint-disable react-native/no-inline-styles */
import {useQuery} from '@tanstack/react-query';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ChangesHistoryScreenProp} from '../type';
import axios from 'axios';
import {GET_CHANGES_HISTORY} from '../helper/APIUtils';
import {useMemo, useRef} from 'react';
import WebView from 'react-native-webview';
import Loader from '../components/Loader';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import {baseHeight, height, scalePerChar} from '../helper/Metric';
import React from 'react';

export default function ChangesHistoryScreen({
  route,
}: ChangesHistoryScreenProp) {
  const {requestId} = route.params;
  const webViewRef = useRef<WebView>();

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
  });

  const cssCode = `
      const style = document.createElement('style');
      style.innerHTML = \`
        body {
          font-size: 46px;
          line-height: 1.5;
          color: #333;
        }
      \`;
      document.head.appendChild(style);
    `;

  const scalePerChar = 1 / 1000;
  const maxMultiplier = 4.3;
  const baseMultiplier = 0.8;

  const minHeight = useMemo(() => {
    let content = history ?? '';
    const scaleFactor = Math.min(content.length * scalePerChar, maxMultiplier);
    const scaledHeight = height * (baseMultiplier + scaleFactor);
    const cappedHeight = Math.min(scaledHeight, height * 6);
    return cappedHeight;
  }, [history, scalePerChar]);
  if (isLoading) {
    return <Loader />;
  }
  console.log('History Length', history?.length);
  return (
    <ScrollView style={styles.container}>
      <WebView
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
