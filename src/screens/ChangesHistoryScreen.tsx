import {useQuery} from '@tanstack/react-query';
import {StyleSheet, View} from 'react-native';
import {ChangesHistoryScreenProp} from '../type';
import axios from 'axios';
import {GET_CHANGES_HISTORY} from '../helper/APIUtils';
import { useRef } from 'react';
import WebView from 'react-native-webview';
import Loader from '../components/Loader';
import { ON_PRIMARY_COLOR } from '../helper/Theme';

export default function ChangesHistoryScreen({
  route,
}: ChangesHistoryScreenProp) {

  const {requestId} = route.params;
  const webViewRef = useRef<WebView>();

  const {data: history, isLoading} = useQuery({
    queryKey: ['get-chages-history'],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_CHANGES_HISTORY}?requestId=${requestId}`,
      );

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

    if(isLoading){
        return (
        <Loader/>
        )
    }
  return (
    <View style={styles.container}>
      <View style={styles.descriptionContainer}>
        <WebView
          style={{
            padding: 7,

            minHeight: history ? history.length : 1,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: ON_PRIMARY_COLOR,
  },

    descriptionContainer: {
    flex: 1,
    marginTop: 10,
    backgroundColor: ON_PRIMARY_COLOR
  },
});
