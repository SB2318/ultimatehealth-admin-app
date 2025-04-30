import {useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {ArticleData} from '../../type';
import { hp } from '../../helper/Metric';

type Props = {
  inProgressArticle: ArticleData[];
  availableArticle: ArticleData[];
  refreshing: boolean;
  onRefresh: ()=> void;
  renderItem: ({item}: {item: ArticleData}) => React.JSX.Element;
};
export default function HomeArticle({
  inProgressArticle,
  availableArticle,
  refreshing,
  onRefresh,
  renderItem,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Available');
  const categories = ['Available', 'Inprogress'];
  

  return (
    <View style={{ flex: 1, backgroundColor: ON_PRIMARY_COLOR}}>
    <View style={styles.container}>

      <View style={styles.buttonContainer}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              ...styles.button,
              backgroundColor:
                selectedCategory !== item ? 'white' : PRIMARY_COLOR,
              borderColor: selectedCategory !== item ? PRIMARY_COLOR : 'white',
            }}
            onPress={() => {
              setSelectedCategory(item);
            }}>
            <Text
              style={{
                ...styles.labelStyle,
                color: selectedCategory !== item ? 'black' : 'white',
              }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.articleContainer}>
        <FlatList
          data={
            selectedCategory === categories[0]
              ? availableArticle
              : inProgressArticle
          }
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.flatListContentContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../../assets/article_default.jpg')}
                style={styles.image}
              />
              <Text style={styles.message}>No Article Found</Text>
            </View>
          }
        />
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    //alignSelf:"center",
    flexDirection: 'row',
    paddingHorizontal: 6,
   // backgroundColor:"red"
  },
  button: {
    flex: 1,
    borderRadius: 14,
    marginHorizontal: 6,
    marginVertical: 4,
    padding: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  container: {
    flex: 1,
   // backgroundColor: '#F0F8FF',
    marginTop: hp(8),
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  articleContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
    //zIndex: -2,
  },
   flatListContentContainer: {
   // marginTop: hp(20),
      paddingHorizontal: 16,
      backgroundColor: ON_PRIMARY_COLOR,
    },
 
 image: {
     height: 160,
     width: 160,
     borderRadius: 80,
     resizeMode: 'cover',
     marginBottom: hp(4),
   },

   message: {
    fontSize: 17,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
 
});
