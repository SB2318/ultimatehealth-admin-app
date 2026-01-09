import {StyleSheet, Dimensions} from 'react-native';
import {useCallback, useState} from 'react';

import {YStack, Text, Card, ScrollView, View, Separator} from 'tamagui';

import {PRIMARY_COLOR} from '../helper/Theme';
//import {LineChart} from 'react-native-gifted-charts';
import {BarChart} from 'react-native-chart-kit';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {fp, hp} from '../helper/Metric';
import {useSelector} from 'react-redux';
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
  // const dispatch = useDispatch();
  //const [isFocus, setIsFocus] = useState<boolean>(false);
  // const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const {isConnected} = useSelector((state: any) => state.user);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [isYearSelected, setYearChange] = useState<number>(-1);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

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
        console.log('selected year month', selectedYear);
        const year = selectedYear === 0 ? date.getFullYear() : selectedYear;
        const month = Number(selectedMonth) + 1;
        //console.log("selected year final", year);
        let url = `${GET_MONTHLY_CONTRIBUTION}?year=${year}&month=${month}&cType=${ctype}`;
        console.log('Month Url', url);
        console.log('User token', user_token);
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
        let url = `${GET_YEARLY_CONTRIBUTION}?year=${
          selectedYear === 0 ? date.getFullYear() : selectedYear
        }&cType=${ctype}`;
        console.log('Yearly reads url', url);
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
      if (selectedMonth !== -1) refetchMonthWriteReport();

      if (selectedYear !== 0) refetchYearlyReadReport();
    }, [
      ctype,
      selectedMonth,
      refetchMonthWriteReport,
      selectedYear,
      refetchYearlyReadReport,
    ]),
  );

  if (isMonthWriteReportLoading || isYearlyReadReportLoading) {
    // eslint-disable-next-line no-unused-expressions
    <Loader />;
  }

  const getYearlyTrendMessage = () => {
    switch (ctype) {
      case 1:
        return 'Your article review contributions this year';
      case 2:
        return 'Your improvement review contributions this year';
      case 4:
        return 'Your podcast contributions this year';
      case 3:
        return 'Your report resolution contributions this year';
      default:
        return 'Your contributions this year';
    }
  };

  const getMonthlyTrendMessage = () => {
    switch (ctype) {
      case 1:
        return 'Your article review contributions this month';
      case 2:
        return 'Your improvement review contributions this month';
      case 4:
        return 'Your podcast contributions this month';
      case 3:
        return 'Your report resolution contributions this month';
      default:
        return 'Your contributions this month';
    }
  };

  const screenWidth = Dimensions.get('window').width;

  const dayToWeekData = (data: LineDataItem[]): LineDataItem[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const weeks: LineDataItem[] = [];
    let weekIndex = 1;

    for (let i = 0; i < data.length; i += 7) {
      const chunk = data.slice(i, i + 7);

      const weekSum = chunk.reduce(
        (sum, day) => sum + Number(day.value || 0),
        0,
      );

      weeks.push({
        label: `W${weekIndex}`,
        value: weekSum,
      });

      weekIndex++;
    }

    return weeks;
  };

  const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const groupYearlyData = (data: LineDataItem[]) => {
    const map = new Map<string, number>();

    data.forEach(item => {
      map.set(item.label.toString(), item.value || 0);
    });

    const normalized = MONTH_LABELS.map((month, index) => ({
      label: month,
      value: map.get(month) ?? map.get((index + 1).toString()) ?? 0,
    }));

    return [
      normalized.slice(0, 3), // Q1
      normalized.slice(3, 6), // Q2
      normalized.slice(6, 9), // Q3
      normalized.slice(9, 12), // Q4
    ];
  };

  const YearlyChartSection = () => {
    const yearlyData = yearlyReadReport ?? [];
    const groupedData = groupYearlyData(yearlyData);

    const CHART_HORIZONTAL_PADDING = 32;
    const chartWidth = screenWidth - CHART_HORIZONTAL_PADDING - 16;

    const QUARTER_LABELS = ['Jan – Mar', 'Apr – Jun', 'Jul – Sep', 'Oct – Dec'];

    return (
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 2,
          paddingBottom: 32,
          // backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}>
        <Card
          padding={16}
          borderRadius={16}
          backgroundColor="#fff"
          overflow="hidden"
          bordered
          borderWidth={0.6}>
          <Text
            fontSize={15}
            color="$gray700"
            textAlign="center"
            fontWeight={"700"}
            marginBottom={12}>
            {getYearlyTrendMessage()}
          </Text>
          {groupedData.map((group, index) => {
            const isLast = index === groupedData.length - 1;

            return (
              <View key={index}>
                {/* Quarter Title */}
                <Text
                  fontSize={15}
                  fontWeight="600"
                  color="#000"
                  marginBottom={8}>
                  {QUARTER_LABELS[index]}
                </Text>

                {/* Chart */}
                <View>
                  <BarChart
                    yAxisLabel=""
                    yAxisSuffix=""
                    width={chartWidth}
                    height={170}
                    fromZero
                    withInnerLines={false}
                    style={{
                      marginLeft: -8,
                      backgroundColor: '#fff',
                    }}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 1,
                      formatYLabel: y => Number(y).toFixed(1),
                      color: () => PRIMARY_COLOR,
                      labelColor: () => '#9CA3AF',
                      barPercentage: 0.5,
                      propsForBackgroundLines: {strokeWidth: 0},
                    }}
                    data={{
                      labels: group.map(i => i.label),
                      datasets: [{data: group.map(i => i.value)}],
                    }}
                  />
                </View>

                {/* Separator only between groups */}
                {!isLast && <Separator marginVertical={20} opacity={0.6} />}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    );
  };

  const WeeklyChartSection = () => {
    const rawMonthlyData = monthlyWriteReport ?? [];

    const weeklyData = dayToWeekData(rawMonthlyData);

    const labels = weeklyData.map(w => w.label);
    const values = weeklyData.map(w => w.value);

    return (
      // <ScrollView
      //  // horizontal
      //   contentContainerStyle={{paddingHorizontal: 16, marginTop: hp(2)}}
      //   showsHorizontalScrollIndicator={false}>
      <Card
        padding={16}
        borderRadius={16}
        backgroundColor="#fff"
        overflow="hidden"
        bordered
        borderWidth={0.6}>
        <Text
          fontSize={15}
          color="$gray700"
          fontWeight={"700"}
          textAlign="center"
          marginBottom={12}>
          {getMonthlyTrendMessage()}
        </Text>

        <BarChart
          yAxisLabel=""
          yAxisSuffix=""
          data={{labels, datasets: [{data: values}]}}
          width={screenWidth - 64}
          height={220}
          fromZero
          withInnerLines={false}
          showValuesOnTopOfBars={false}
          style={{marginLeft: -8}}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            formatYLabel: y => Number(y).toFixed(1),
            color: () => PRIMARY_COLOR,
            labelColor: () => '#9CA3AF',
            barPercentage: 0.45,
            propsForBackgroundLines: {strokeWidth: 0},
          }}
        />
      </Card>
      // </ScrollView>
    );
  };

  // const ChartSection = () => {
  //   return (
  //     <View>
  //       {(selectedMonth !== -1 || selectedYear !== 0) && (
  //         <ScrollView horizontal marginTop="$5" paddingHorizontal="$3">
  //           <Card
  //             //elevate
  //             padding="$4"
  //             borderRadius="$4"
  //             backgroundColor="$background"
  //             bordered
  //             // boc="$color3"
  //             borderWidth={0.6}>
  //             <Text fontSize={19} fontWeight="700" marginBottom="$3">
  //               {userState === 0 ? 'Reading Trend' : 'Writing Trend'}
  //             </Text>

  //             <Text fontSize={14} color="#6A6A6A" marginBottom="$3">
  //               {getTrendMessage()}
  //             </Text>

  //             <LineChart
  //               data={{
  //                 labels: processLabels(
  //                   selectedMonth !== 1
  //                     ? monthlyWriteReport
  //                     : isYearSelected
  //                     ? yearlyReadReport
  //                     : monthlyWriteReport,
  //                 ),

  //                 datasets: [
  //                   {
  //                     data: processData(
  //                       selectedMonth !== 1
  //                         ? monthlyWriteReport
  //                         : isYearSelected
  //                         ? yearlyReadReport
  //                         : monthlyWriteReport,
  //                     ),
  //                     strokeWidth: 2,
  //                     color: () => '#6A85F1',
  //                   },
  //                 ],
  //               }}
  //               width={screenWidth - 40}
  //               height={350}
  //               withInnerLines={false}
  //               withOuterLines={false}
  //               withHorizontalLabels={true}
  //               withVerticalLabels={false}
  //               bezier={false}
  //               yAxisSuffix=""
  //               //yAxisInterval={1}
  //               chartConfig={{
  //                 backgroundColor: '#fff',
  //                 backgroundGradientFrom: '#fff',
  //                 backgroundGradientTo: '#fff',
  //                 // decimalPlaces: 0,
  //                 color: opacity => `${PRIMARY_COLOR}`,
  //                 labelColor: () => '#6A6A6A',
  //                 propsForDots: {
  //                   r: '5',
  //                   strokeWidth: '2',
  //                   stroke: '#6A85F1',
  //                   fill: '#6A85F1',
  //                 },
  //               }}
  //               renderDotContent={({x, y, index, indexData}) => (
  //                 <Text
  //                   key={index}
  //                   style={{
  //                     position: 'absolute',
  //                     top: y - 20,
  //                     left: x - 10,
  //                     fontSize: 12,
  //                     fontWeight: '600',
  //                     color: '#000',
  //                   }}>
  //                   {indexData}
  //                 </Text>
  //               )}
  //             />
  //           </Card>
  //         </ScrollView>
  //       )}
  //     </View>
  //   );
  // };

  const BarChartSection = () => {
    return (
      <View background="$background">
        {selectedMonth !== -1 ? <WeeklyChartSection /> : <YearlyChartSection />}
      </View>
    );
  };

  return (
    <ScrollView
      flex={1}
      paddingBottom="$1"
      contentContainerStyle={{
        marginBottom: hp(8),
      }}>
      {/* Filters */}
      <YStack paddingHorizontal="$1" marginTop="$4" gap="$3">
        <View style={styles.rowContainer}>
          <Dropdown
            style={{
              ...styles.button,
              backgroundColor: selectedMonth === -1 ? '#c1c1c1' : PRIMARY_COLOR,
            }}
            data={monthlyDrops}
            labelField="label"
            valueField="value"
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
              setYearChange(new Date().getFullYear());

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
            data={yearlyDrops}
            labelField="label"
            valueField="value"
            value={selectedYear}
            onFocus={() => {}}
            onBlur={() => {}}
            onChange={item => {
              setSelectedYear(item.value);
              // setSelectedDay(-1);
              setSelectedMonth(new Date().getMonth());
              setYearChange(new Date().getFullYear());
              // setIsFocus(false);
            }}
            placeholder={'Yearly'}
          />
        </View>

        <View marginTop="$4">
          <BarChartSection />
        </View>
      </YStack>

      {/* Chart Section */}
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
