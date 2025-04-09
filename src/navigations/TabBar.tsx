import React from 'react';
import {View, Pressable, StyleSheet, useColorScheme} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {  PRIMARY_COLOR} from '../helper/Theme';

const TabBar = ({state, descriptors, navigation}: any) => {
  const isDarkMode = useColorScheme() === 'dark';



  return (
    <View
      style={[
        styles.mainContainer,
        {backgroundColor: isDarkMode ? PRIMARY_COLOR : 'white'},
      ]}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={index}
            style={[
              styles.mainItemContainer,
              {borderRightWidth: label === 'notes' ? 3 : 0},
            ]}>
            <Pressable
              onPress={onPress}
              style={{
                backgroundColor: isFocused
                  ? PRIMARY_COLOR
                  : isDarkMode
                  ? PRIMARY_COLOR
                  : 'white',
                borderRadius: 50,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 5,
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                {label === 'Article' && (
                  <Ionicons
                    name="home"
                    size={26}
                    color={isFocused ? 'white' : isDarkMode ? 'white' :  PRIMARY_COLOR  }
                  />
                )}
                {label === 'Podcast' && (
                  <FontAwesome
                    name="podcast"
                    size={26}
                    color={isFocused ? 'white' : isDarkMode ? 'white' :  PRIMARY_COLOR  }
                  />
                )}

                {label === 'Notification' && (
                  <Ionicons
                    name="notifications"
                    size={26}
                    color={isFocused ? 'white' : isDarkMode ? 'white' :  PRIMARY_COLOR  }
                  />
                )}

                {label === 'Report' && (
                  <MaterialIcon
                    name="report"
                    size={26}
                    color={isFocused ? 'white' : isDarkMode ? 'white' :  PRIMARY_COLOR  }
                  />
                )}

          {label === 'Profile' && (
                  <MaterialIcon
                    name="person"
                    size={26}
                    color={isFocused ? 'white' : isDarkMode ? 'white' :  PRIMARY_COLOR  }
                  />
                )}
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 2,
    backgroundColor: 'red',
    //borderWidth: 0.19,
    zIndex: 0,
  },
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 7,
    borderRadius: 1,
    //borderColor: '#333B42',
    zIndex: 1,
  },
});

export default TabBar;
