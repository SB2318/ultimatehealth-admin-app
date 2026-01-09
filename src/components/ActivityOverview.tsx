// import {View, Text, StyleSheet, ScrollView} from 'react-native';
// import React, {useCallback, useState} from 'react';
// import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// import {Dropdown} from 'react-native-element-dropdown';

// import {LineChart} from 'react-native-chart-kit';
// import {useQuery} from '@tanstack/react-query';
// import moment from 'moment';
// import {fp} from '../helper/Metric';
// import {useSelector} from 'react-redux';
// import axios from 'axios';
// import {
//   GET_MONTHLY_CONTRIBUTION,
//   GET_YEARLY_CONTRIBUTION,
// } from '../helper/APIUtils';

// import Loader from './Loader';
// import {useFocusEffect} from '@react-navigation/native';
// import { LineDataItem } from '../type';

// const ActivityOverview = ({ctype}: {ctype: number}) => {
//   const {user_token} = useSelector((state: any) => state.user);

//   const [selectedMonth, setSelectedMonth] = useState<number>(
//     new Date().getMonth(),
//   );
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear(),
//   );
//   const [isYearSelected, setYearChange] = useState<number>(-1);
//   //const [isFocus, setIsFocus] = useState(false);

//   const monthlyDrops = [
//     {label: 'Monthly', value: -1},
//     {label: 'January', value: 0},
//     {label: 'February', value: 1},
//     {label: 'March', value: 2},
//     {label: 'April', value: 3},
//     {label: 'May', value: 4},
//     {label: 'June', value: 5},
//     {label: 'July', value: 6},
//     {label: 'August', value: 7},
//     {label: 'September', value: 8},
//     {label: 'October', value: 9},
//     {label: 'November', value: 10},
//     {label: 'December', value: 11},
//   ];

//   const yearlyDrops = [
//     {label: 'Yearly', value: -1},
//     {label: '2024', value: 2024},
//     {label: '2025', value: 2025},
//   ];

//   // GET MONTHLY READ REPORT
//   const {
//     data: monthlyWriteReport,
//     isLoading: isMonthWriteReportLoading,
//     refetch: refetchMonthWriteReport,
//   } = useQuery({
//     queryKey: ['get-month-write-reports'],
//     queryFn: async () => {
//       try {
//         // console.log('URL', url);
//         const date = new Date();
//         const year = selectedYear !== -1 ? date.getFullYear() : selectedYear;
//         const month = Number(selectedMonth) + 1;
//         let url = `${GET_MONTHLY_CONTRIBUTION}?year=${year}&month=${month}&cType=${ctype}`;
//         // console.log("Month Url", url);
//         const response = await axios.get(url, {
//           // headers: {
//           //  Authorization: `Bearer ${user_token}`,
//           // },
//         });
//        // console.log('Month response', response.data);

//         return response.data as LineDataItem[];
//       } catch (err) {
//         console.error('Error fetching articles writes monthly:', err);
//       }
//     },
//     enabled: !!(user_token && selectedMonth !== -1),
//   });

//   // GET YEARLY READ REPORT
//   const {
//     data: yearlyReadReport,
//     isLoading: isYearlyReadReportLoading,
//     refetch: refetchYearlyReadReport,
//   } = useQuery({
//     queryKey: ['get-yearly-read-reports'],
//     queryFn: async () => {
//       try {
//         let url = `${GET_YEARLY_CONTRIBUTION}?year=${selectedYear}&cType=${ctype}`;
//         const response = await axios.get(url, {
//           // headers: {
//           //  Authorization: `Bearer ${user_token}`,
//           // },
//         });

//         // console.log("Yearly response", response.data);
//         return response.data as LineDataItem[];
//       } catch (err) {
//         console.error('Error fetching articles reads yearly:', err);
//       }
//     },
//     enabled: !!(user_token && selectedYear !== -1),
//   });

//   useFocusEffect(
//     useCallback(() => {
//       if(ctype === 5) {return;}
//       refetchMonthWriteReport();
//       refetchYearlyReadReport();
//     }, [refetchMonthWriteReport, refetchYearlyReadReport, ctype]),
//   );

//   if (isMonthWriteReportLoading || isYearlyReadReportLoading) {
//     <Loader />;
//   }

//   /*
//     const processData = data => {
//       if (!data) {
//         return [];
//       }

//       console.log('data', data.map(item => ({
//         value: item.value, // Ensure the value is an integer
//         label: item.label,
//       })));
//       return data.map(item => ({
//         value: item.value, // Ensure the value is an integer
//         label: item.label
//       }));
//     };

//  */

//   return (
//     <ScrollView
//       style={{
//         flex: 1,
//         marginBottom: 120,
//         backgroundColor: ON_PRIMARY_COLOR,
//       }}>
//       <View style={styles.rowContainer}>
//         <Text style={styles.btnText}>
//           {moment(new Date()).format('DD MMM, YYYY')}
//         </Text>
//       </View>

//       {selectedMonth !== -1 && (
//         <View style={{marginTop: 10, flex: 1}}>

//           {Array.isArray(monthlyWriteReport) &&
//           monthlyWriteReport.length > 0 ? (

//             <ScrollView horizontal>
//             <LineChart
//               data={{
//                 labels: monthlyWriteReport.map(
//                   item => item.label?.toString() ?? '-',
//                 ),
//                 datasets: [
//                   {
//                     data: monthlyWriteReport.map(item =>
//                       Number.isFinite(Number(item.value))
//                         ? Math.round(Number(item.value))
//                         : 0,
//                     ),
//                     strokeWidth: 1,
//                     color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
//                   },
//                 ],
//               }}
//               //width={screenWidth *20}
//                width={monthlyWriteReport.length * 40}
//               height={350}

//               chartConfig={{
//                  backgroundGradientFrom: ON_PRIMARY_COLOR,
//                  backgroundGradientTo: ON_PRIMARY_COLOR,

//                 color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//                 labelColor: () => '#999',
//                  formatYLabel: y => parseInt(y).toString(),
//                 propsForDots: {
//                   r: '3',
//                   strokeWidth: '2',
//                   stroke: PRIMARY_COLOR,
//                 },
//               }}
//               bezier
//               withInnerLines={false}
//               style={{
//                 //flex:1,
//                 marginVertical: 2,
//                 borderRadius: 12,
//               }}
//             />
//             </ScrollView>
//           ) : (
//             <Text>No data available</Text>
//           )}
//         </View>
//       )}
//       {isYearSelected !== -1 && (
//         <View style={{marginTop: 10, flex: 1}}>
//           {/*
//           <LineChart
//             data2={yearlyReadReport?.map(item => ({
//               value: item.value,
//               label: moment(item.label).format('MMM'),
//             }))}
//             areaChart
//           />
//           */}

//           {Array.isArray(yearlyReadReport) && yearlyReadReport.length > 0 ? (

//             <ScrollView horizontal>
//             <LineChart
//               data={{
//                 labels: yearlyReadReport.map(
//                   item => item.label?.toString() ?? '-',
//                 ),
//                 datasets: [
//                   {
//                     data: yearlyReadReport.map(item =>
//                       Number.isFinite(Number(item.value))
//                         ? Math.round(Number(item.value))
//                         : 0,
//                     ),
//                     strokeWidth: 2,
//                     color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
//                   },
//                 ],
//               }}
//               //width={screenWidth - 20}
//               width={yearlyReadReport.length * 40}
//               height={350}
//               chartConfig={{
//                 backgroundGradientFrom: ON_PRIMARY_COLOR,
//                 backgroundGradientTo: ON_PRIMARY_COLOR,
//                 color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//                // fromZero = {true},
//                 labelColor: () => '#999',
//                 formatYLabel: y => parseInt(y).toString(),

//                 propsForDots: {
//                   r: '3',
//                   strokeWidth: '2',
//                   stroke: PRIMARY_COLOR,
//                 },
//               }}
//               bezier
//               withInnerLines={false}
//               style={{
//                 marginVertical: 8,
//                 borderRadius: 12,
//               }}
//             />
//             </ScrollView>
//           ) : (
//             <Text>No data available</Text>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   rowContainer: {
//     flex: 0,
//     width: '100%',
//     flexDirection: 'row',
//     padding: 6,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   colContainer: {
//     flex: 0,
//     width: '100%',
//     flexDirection: 'column',
//     padding: 1,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   box: {
//     width: '95%',
//     // height: 120,
//     flex: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     margin: 4,
//     //borderWidth: 1,
//     padding: 3,
//     borderColor: 'black',
//     borderRadius: 8,
//     //flexDirection: 'column',
//   },

//   titleText: {
//     fontSize: 16,
//     color: 'black',
//     marginVertical: 4,
//     fontWeight: '600',
//   },

//   valueText: {
//     fontSize: 17,
//     color: PRIMARY_COLOR,
//     marginVertical: 4,
//     fontWeight: '700',
//   },

//   dropdown: {
//     height: 30,
//     width: '35%',
//     borderColor: '#c1c1c1',
//     borderWidth: 0.4,
//     borderRadius: 5,
//     paddingHorizontal: 6,
//     marginVertical: 3,
//     paddingRight: 2,
//     marginStart: 4,
//   },

//   button: {
//     width: '40%',
//     padding: 6,
//     borderRadius: 8,
//     margin: 2,
//     marginTop: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#c1c1c1',
//     borderColor: 'black',
//   },
//   btnText: {
//     fontSize: 16,
//     color: 'black',
//   },
//   cardContainer: {
//     flex: 0,
//     width: '100%',
//     maxHeight: 150,
//     backgroundColor: '#E6E6E6',
//     flexDirection: 'row',

//     marginVertical: 14,
//     overflow: 'hidden',
//     elevation: 4,

//     borderRadius: 12,
//   },
//   image: {
//     flex: 0.6,
//     resizeMode: 'cover',
//   },
//   textContainer: {
//     flex: 0.9,
//     backgroundColor: 'white',
//     paddingHorizontal: 10,
//     paddingVertical: 13,
//   },
//   title: {
//     fontSize: fp(4.5),
//     fontWeight: 'bold',
//     color: '#121a26',
//     marginBottom: 4,
//     fontFamily: 'Lobster-Regular',
//   },
//   footerText: {
//     fontSize: fp(3.3),
//     fontWeight: '600',
//     color: '#121a26',
//     marginBottom: 3,
//   },
// });

// export default ActivityOverview;

import {StyleSheet, Dimensions} from 'react-native';
import {useCallback, useState} from 'react';

import {YStack, Text, Card, ScrollView, View} from 'tamagui';

import {PRIMARY_COLOR} from '../helper/Theme';
//import {LineChart} from 'react-native-gifted-charts';
import {LineChart, BarChart} from 'react-native-chart-kit';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {fp, hp} from '../helper/Metric';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {
  GET_MONTHLY_CONTRIBUTION,
  GET_YEARLY_CONTRIBUTION,
} from '../helper/APIUtils';
import {LineDataItem} from '../type';
import Loader from './Loader';

import {useFocusEffect} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';

const ActivityOverview = ({ctype}: {ctype: number}) => {
  const [userState, setUserState] = useState<number>(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const [isFocus, setIsFocus] = useState<boolean>(false);
  // const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const {isConnected} = useSelector((state: any) => state.user);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [isYearSelected, setYearChange] = useState<number>(-1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const monthlyDrops = [
    {label: 'Monthly', value: -1},
    {label: 'January', value: 0},
    {label: 'February', value: 1},
    {label: 'March', value: 2},
    {label: 'April', value: 3},
    {label: 'May', value: 4},
    {label: 'June', value: 5},
    {label: 'July', value: 6},
    {label: 'August', value: 7},
    {label: 'September', value: 8},
    {label: 'October', value: 9},
    {label: 'November', value: 10},
    {label: 'December', value: 11},
  ];

  const yearlyDrops = [
    {label: 'Yearly', value: -1},
    {label: '2024', value: 2024},
    {label: '2025', value: 2025},
  ];

  // GET MONTHLY READ REPORT
  const {
    data: monthlyWriteReport,
    isLoading: isMonthWriteReportLoading,
    refetch: refetchMonthWriteReport,
  } = useQuery({
    queryKey: ['get-month-write-reports'],
    queryFn: async () => {
      try {
        // console.log('URL', url);
        const date = new Date();
        console.log("selected year month", selectedYear);
        const year = selectedYear === 0 ? date.getFullYear() : selectedYear;
        const month = Number(selectedMonth) + 1;
        //console.log("selected year final", year);
        let url = `${GET_MONTHLY_CONTRIBUTION}?year=${year}&month=${month}&cType=${ctype}`;
         console.log("Month Url", url);
         console.log("User token", user_token);
        const response = await axios.get(url, {
          // headers: {
          //  Authorization: `Bearer ${user_token}`,
          // },
        });
        // console.log('Month response', response.data);

        return response.data as LineDataItem[];
      } catch (err) {
        console.error('Error fetching articles writes monthly:', err);
      }
    },
    enabled: !!(user_token && selectedMonth !== 1),
  });

  // GET YEARLY READ REPORT
  const {
    data: yearlyReadReport,
    isLoading: isYearlyReadReportLoading,
    refetch: refetchYearlyReadReport,
  } = useQuery({
    queryKey: ['get-yearly-read-reports'],
    queryFn: async () => {
      try {
        const date = new Date();
        let url = `${GET_YEARLY_CONTRIBUTION}?year=${selectedYear === 0 ? date.getFullYear(): selectedYear }&cType=${ctype}`;
        console.log("Yearly reads url", url);
        const response = await axios.get(url, {
          // headers: {
          //  Authorization: `Bearer ${user_token}`,
          // },
        });

        // console.log("Yearly response", response.data);
        return response.data as LineDataItem[];
      } catch (err) {
        console.error('Error fetching articles reads yearly:', err);
      }
    },
   // enabled: !!(user_token && selectedYear !== -1),
    enabled: !!selectedYear && !!user_token,
  });

  useFocusEffect(
    useCallback(() => {
      if (ctype === 5) {
        return;
      }
      refetchMonthWriteReport();
      refetchYearlyReadReport();
    }, [refetchMonthWriteReport, refetchYearlyReadReport, ctype]),
  );

  if (isMonthWriteReportLoading || isYearlyReadReportLoading) {
    // eslint-disable-next-line no-unused-expressions
    <Loader />;
  }

  const processData = (data: any[]) => {
    if ( !data || !Array.isArray(data) || data.length === 0) {
      return [0,0,0,0,0,0];
    }

    return data.map(item => {
      const val = Number(item.value);
      return isFinite(val) ? val : 0;
    });
  };

  const processLabels = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return ['-'];
    }

    return data.map(item => (item.date ? item.date.substring(8) : '-'));
  };

  const getTrendMessage = () => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // If month selected
    if (selectedMonth !== 1) {
      const monthName = monthNames[selectedMonth];
      const year = moment().year(); // current year
      return `Your ${
        userState === 0 ? 'Reading' : 'Writing'
      } activity for ${monthName} ${year}`;
    }

    // If year selected
    if (selectedYear !== 0) {
      return `Your ${
        userState === 0 ? 'Reading' : 'Writing'
      } activity for the year ${selectedYear}`;
    }

    return '';
  };

  const screenWidth = Dimensions.get('window').width;

  const ChartSection = () => {
    return (
      <View>
        {(selectedMonth !== -1 || selectedYear !== 0) && (
          <ScrollView horizontal marginTop="$5" paddingHorizontal="$3">
            <Card
              //elevate
              padding="$4"
              borderRadius="$4"
              backgroundColor="$background"
              bordered
              // boc="$color3"
              borderWidth={0.6}>
              <Text fontSize={19} fontWeight="700" marginBottom="$3">
                {userState === 0 ? 'Reading Trend' : 'Writing Trend'}
              </Text>

              <Text fontSize={14} color="#6A6A6A" marginBottom="$3">
                {getTrendMessage()}
              </Text>

              <LineChart
                data={{
                  labels: processLabels(
                    selectedMonth !== 1
                      ? monthlyWriteReport
                      : isYearSelected
                      ? yearlyReadReport
                      : monthlyWriteReport,
                  ),

                  datasets: [
                    {
                      data: processData(
                        selectedMonth !== 1
                          ? monthlyWriteReport
                          : isYearSelected
                          ? yearlyReadReport
                          : monthlyWriteReport,
                      ),
                      strokeWidth: 2,
                      color: () => '#6A85F1',
                    },
                  ],
                }}
                width={screenWidth - 40}
                height={350}
                withInnerLines={false}
                withOuterLines={false}
                withHorizontalLabels={true}
                withVerticalLabels={false}
                bezier={false}
                yAxisSuffix=""
                //yAxisInterval={1}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  // decimalPlaces: 0,
                  color: opacity => `${PRIMARY_COLOR}`,
                  labelColor: () => '#6A6A6A',
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#6A85F1',
                    fill: '#6A85F1',
                  },
                }}
                renderDotContent={({x, y, index, indexData}) => (
                  <Text
                    key={index}
                    style={{
                      position: 'absolute',
                      top: y - 20,
                      left: x - 10,
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#000',
                    }}>
                    {indexData}
                  </Text>
                )}
              />
            </Card>
          </ScrollView>
        )}
      </View>
    );
  };

  const BarChartSection = () => {
  return (
    <View>
      {(selectedMonth !== -1 || selectedYear !== 0) && (
        <ScrollView horizontal marginTop="$5" paddingHorizontal="$3">
          <Card
            padding="$4"
            borderRadius="$4"
            backgroundColor="$background"
            bordered
            borderWidth={0.6}
          >
            <Text fontSize={19} fontWeight="700" marginBottom="$3">
              {userState === 0 ? 'Reading Trend' : 'Writing Trend'}
            </Text>

            <Text fontSize={14} color="#6A6A6A" marginBottom="$3">
              {getTrendMessage()}
            </Text>

            <BarChart
             yAxisLabel=""
            yAxisSuffix=""
              data={{
                labels: processLabels(
                  selectedMonth !== 1
                    ? monthlyWriteReport || []
                    : isYearSelected
                    ? yearlyReadReport || []
                    : monthlyWriteReport || [],
                ),
                datasets: [
                  {
                    data: processData(
                      selectedMonth !== 1
                        ? monthlyWriteReport || []
                        : isYearSelected
                        ? yearlyReadReport || []
                        : monthlyWriteReport || [],
                    ),
                  },
                ],
              }}
              width={screenWidth - 40}
              height={350}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: () => PRIMARY_COLOR,     // bar color
                labelColor: () => '#6A6A6A',
                barPercentage: 0.6,
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
              }}
              style={{
                borderRadius: 8,
              }}
            />
          </Card>
        </ScrollView>
      )}
    </View>
  );
};


  return (
    <ScrollView flex={1} backgroundColor="$background" paddingBottom="$12">
      {/* Filters */}
      <YStack paddingHorizontal="$2" marginTop="$4" gap="$3">
        <View style={styles.rowContainer}>
          <Dropdown
            style={{
              ...styles.button,
              backgroundColor: selectedMonth === -1 ? '#c1c1c1' : PRIMARY_COLOR,
            }}
            //placeholderStyle={styles.placeholderStyle}

            data={monthlyDrops}
            labelField="label"
            valueField="value"
            //placeholder={!isFocus ? 'Select your role' : '...'}
            itemTextStyle={{
              fontSize: 14,
            }}
            value={selectedMonth}
            onFocus={() => {
              // setIsFocus(true)
            }}
            onBlur={() => {
              // setIsFocus(false)
            }}
            onChange={item => {
              setSelectedMonth(item.value);
              // setSelectedDay(-1);
              //setSelectedYear(-1);
              // setIsFocus(false);
              setYearChange(-1);

              //setSelectedYear()
              refetchMonthWriteReport();
            }}
            placeholder={'Monthly'}
          />
          <Dropdown
            style={{
              ...styles.button,
              backgroundColor: selectedYear === -1 ? '#c1c1c1' : PRIMARY_COLOR,
            }}
            //placeholderStyle={styles.placeholderStyle}
            //placeholderStyle={styles.placeholderStyle}
            data={yearlyDrops}
            labelField="label"
            valueField="value"
            //placeholder={!isFocus ? 'Select your role' : '...'}
            value={selectedYear}
            onFocus={() => {}}
            onBlur={() => {}}
            onChange={item => {
              setSelectedYear(item.value);
              // setSelectedDay(-1);
              setSelectedMonth(-1);
              setYearChange(0);
              // setIsFocus(false);
            }}
            placeholder={'Yearly'}
          />
        </View>
      </YStack>

      {/* Chart Section */}
      {/* <ChartSection /> */}
      <BarChartSection/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  colContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'column',
    padding: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  box: {
    width: '95%',
    // height: 120,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 4,
    //borderWidth: 1,
    padding: 3,
    borderColor: 'black',
    borderRadius: 8,
    //flexDirection: 'column',
  },

  titleText: {
    fontSize: 16,
    color: 'black',
    marginVertical: 4,
    fontWeight: '600',
  },

  valueText: {
    fontSize: 17,
    color: PRIMARY_COLOR,
    marginVertical: 4,
    fontWeight: '700',
  },

  dropdown: {
    height: 40,
    width: '45%',
    borderColor: '#c1c1c1',
    borderWidth: 0.4,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 3,
    paddingRight: 2,
    marginStart: 4,
  },

  button: {
    width: '45%',
    height: hp(6),
    padding: 8,
    borderRadius: 8,
    margin: 2,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c1c1c1',
    borderColor: 'black',
  },
  btnText: {
    fontSize: 16,
    color: 'black',
  },
  cardContainer: {
    flex: 0,
    width: '100%',
    maxHeight: 150,
    backgroundColor: '#E6E6E6',
    flexDirection: 'row',

    marginVertical: 14,
    overflow: 'hidden',
    elevation: 4,

    borderRadius: 12,
  },
  image: {
    flex: 0.6,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 0.9,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 13,
  },
  title: {
    fontSize: fp(4.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
  },
  footerText: {
    fontSize: fp(3.3),
    fontWeight: '600',
    color: '#121a26',
    marginBottom: 3,
  },
});

export default ActivityOverview;
