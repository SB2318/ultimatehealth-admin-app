// import { StyleSheet, Dimensions } from 'react-native';
// import React, { useCallback, useState } from 'react';

// import {
//   YStack,
//   Text,
//   Card,
//   ScrollView,
//   View,
//   XStack,
//   Separator,
// } from 'tamagui';

// import { PRIMARY_COLOR } from '../helper/Theme';
// import { BarChart } from 'react-native-chart-kit';
// import { useQuery } from '@tanstack/react-query';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import {
//   GET_MONTHLY_CONTRIBUTION,
//   GET_YEARLY_CONTRIBUTION,
// } from '../helper/APIUtils';
// import { LineDataItem } from '../type';
// import Loader from './Loader';
// import { useFocusEffect } from '@react-navigation/native';
// import { Dropdown } from 'react-native-element-dropdown';
// import { hp } from '../helper/Metric';

// const ActivityOverview = ({ ctype }: { ctype: number }) => {
//   const { user_token, isConnected } = useSelector((state: any) => state.user);

//   const [selectedMonth, setSelectedMonth] = useState<number>(
//     new Date().getMonth(),
//   );
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear(),
//   );
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

//   const screenWidth = Dimensions.get('window').width;
//   const chartWidth = screenWidth - 72;

//   const months = [
//     { label: 'Jan', value: 0 },
//     { label: 'Feb', value: 1 },
//     { label: 'Mar', value: 2 },
//     { label: 'Apr', value: 3 },
//     { label: 'May', value: 4 },
//     { label: 'Jun', value: 5 },
//     { label: 'Jul', value: 6 },
//     { label: 'Aug', value: 7 },
//     { label: 'Sep', value: 8 },
//     { label: 'Oct', value: 9 },
//     { label: 'Nov', value: 10 },
//     { label: 'Dec', value: 11 },
//   ];

//   const years = [
//     { label: '2024', value: 2024 },
//     { label: '2025', value: 2025 },
//     { label: '2026', value: 2026 },
//   ];

//   const {
//     data: monthlyData = [],
//     isLoading: monthlyLoading,
//     refetch: refetchMonthly,
//   } = useQuery({
//     queryKey: ['monthly-contribution', selectedYear, selectedMonth, ctype],
//     queryFn: async () => {
//       const res = await axios.get(
//         `${GET_MONTHLY_CONTRIBUTION}?year=${selectedYear}&month=${
//           selectedMonth + 1
//         }&cType=${ctype}`,
//       );
//       return res.data as LineDataItem[];
//     },
//     enabled: !!user_token && isConnected && viewMode === 'monthly',
//   });

//   const {
//     data: yearlyData = [],
//     isLoading: yearlyLoading,
//     refetch: refetchYearly,
//   } = useQuery({
//     queryKey: ['yearly-contribution', selectedYear, ctype],
//     queryFn: async () => {
//       const res = await axios.get(
//         `${GET_YEARLY_CONTRIBUTION}?year=${selectedYear}&cType=${ctype}`,
//       );
//       return res.data as LineDataItem[];
//     },
//     enabled: !!user_token && isConnected && viewMode === 'yearly',
//   });

//   useFocusEffect(
//     useCallback(() => {
//       if (viewMode === 'monthly') {
//         refetchMonthly();
//       } else {
//         refetchYearly();
//       }
//     }, [viewMode, selectedMonth, selectedYear]),
//   );

//   const isLoading = monthlyLoading || yearlyLoading;

//   const getTitle = () => {
//     switch (ctype) {
//       case 1:
//         return 'Article Review Contributions';
//       case 2:
//         return 'Improvement Review Contributions';
//       case 3:
//         return 'Report Resolution Contributions';
//       case 4:
//         return 'Podcast Contributions';
//       default:
//         return 'Moderator Activity';
//     }
//   };

//   const getWeeklyData = (data: LineDataItem[]) => {
//     if (!data.length) {
//       return { labels: [], values: [] };
//     }

//     const weeks = [];
//     let weekIndex = 1;

//     for (let i = 0; i < data.length; i += 7) {
//       const chunk = data.slice(i, i + 7);
//       const sum = chunk.reduce(
//         (acc, item) => acc + Number(item.value || 0),
//         0,
//       );

//       weeks.push({
//         label: `W${weekIndex}`,
//         value: sum,
//       });

//       weekIndex++;
//     }

//     return {
//       labels: weeks.map(w => w.label),
//       values: weeks.map(w => w.value),
//     };
//   };

//   const weeklyData = getWeeklyData(monthlyData);

//   const MONTH_LABELS = [
//     'Jan',
//     'Feb',
//     'Mar',
//     'Apr',
//     'May',
//     'Jun',
//     'Jul',
//     'Aug',
//     'Sep',
//     'Oct',
//     'Nov',
//     'Dec',
//   ];

//   const getQuarterlyData = (data: LineDataItem[]) => {
//     const map = new Map(data.map(item => [item.label, item.value || 0]));

//     const normalized = MONTH_LABELS.map((label, i) => ({
//       label,
//       value: map.get(label) ?? map.get((i + 1).toString()) ?? 0,
//     }));

//     return [
//       { quarter: 'Q1 (Jan-Mar)', data: normalized.slice(0, 3) },
//       { quarter: 'Q2 (Apr-Jun)', data: normalized.slice(3, 6) },
//       { quarter: 'Q3 (Jul-Sep)', data: normalized.slice(6, 9) },
//       { quarter: 'Q4 (Oct-Dec)', data: normalized.slice(9, 12) },
//     ];
//   };

//   const quarterlyGroups = getQuarterlyData(yearlyData);

//   return (
//     <ScrollView
//       flex={1}
//      // backgroundColor="#f8f9fa"
//      backgroundColor="#f1f5f9"
//       showsVerticalScrollIndicator={false}>
//       <YStack padding="$4" backgroundColor="white">
//         <Text fontSize={21} fontWeight="700" color="#1f2937">
//           {getTitle()}
//         </Text>
//         <Text fontSize={14} color="#6b7280">
//           Moderator Analytics
//         </Text>
//       </YStack>

//       <XStack paddingHorizontal="$4" gap="$3" marginTop="$2">
//         <Card
//           flex={1}
//           padding="$4"
//           borderRadius={14}
//           backgroundColor="white"
          
//           elevate>
//           <Text color="#6b7280" fontSize={13}>
//             Total This Year
//           </Text>
//           <Text fontSize={28} fontWeight="700" color={PRIMARY_COLOR}>
//             {yearlyData.reduce((sum, item) => sum + (item.value || 0), 0)}
//           </Text>
//         </Card>

//         <Card
//           flex={1}
//           padding="$4"
//           borderRadius={14}
//           backgroundColor="white"
          
//           elevate>
//           <Text color="#6b7280" fontSize={13}>
//             This Month
//           </Text>
//           <Text fontSize={28} fontWeight="700" color={PRIMARY_COLOR}>
//             {monthlyData.reduce((sum, item) => sum + (item.value || 0), 0)}
//           </Text>
//         </Card>
//       </XStack>

//       <YStack padding="$4" gap="$3">
//         <XStack gap="$2">
//           <Card
//             flex={1}
//             padding="$3.5"
//             height={"$5"}
//             alignItems='center'
//             justifyContent='center'
//             borderRadius={12}
//             backgroundColor={
//               viewMode === 'monthly' ? PRIMARY_COLOR : 'white'
//             }
//             borderWidth={1.2}
//             borderColor={
//               viewMode === 'monthly' ? PRIMARY_COLOR : '#e5e7eb'
//             }
//             onPress={() => setViewMode('monthly')}>
//             <Text
//               textAlign="center"
//               fontSize={"$4"}
//               color={viewMode === 'monthly' ? 'white' : '#374151'}
//               fontWeight="600">
//               Monthly View
//             </Text>
//           </Card>

//           <Card
//             flex={1}
//             padding="$3.5"
//             height={"$5"}
//             alignItems='center'
//             justifyContent='center'
//             borderRadius={12}
//             backgroundColor={
//               viewMode === 'yearly' ? PRIMARY_COLOR : 'white'
//             }
//             borderWidth={1.2}
//             borderColor={
//               viewMode === 'yearly' ? PRIMARY_COLOR : '#e5e7eb'
//             }
//             onPress={() => setViewMode('yearly')}>
//             <Text
//               textAlign="center"
//               //fontSize={"$4"}
//               fontSize={"$4"}
//               color={viewMode === 'yearly' ? 'white' : '#374151'}
//               fontWeight="600">
//               Yearly View
//             </Text>
//           </Card>
//         </XStack>

//         <XStack gap="$3">
//           <Dropdown
//             style={styles.dropdown}
//             data={months}
//             labelField="label"
//             valueField="value"
//             value={selectedMonth}
//             onChange={item => setSelectedMonth(item.value)}
//           />
//           <Dropdown
//             style={styles.dropdown}
//             data={years}
//             labelField="label"
//             valueField="value"
//             value={selectedYear}
//             onChange={item => setSelectedYear(item.value)}
//           />
//         </XStack>
//       </YStack>

//       <Separator />

//       <YStack padding="$2" gap="$5">
//         {isLoading ? (
//           <Loader />
//         ) : viewMode === 'monthly' ? (
//           <Card padding={14} borderRadius={16} marginBottom={hp(12)} backgroundColor="white" elevate>
//             <Text
//               fontSize={17}
//               fontWeight="700"
//               textAlign="center"
//               marginBottom={16}
//               color="#1f2937">
//               Weekly Contribution • {months[selectedMonth].label}{' '}
//               {selectedYear}
//             </Text>

//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <BarChart
//                 data={{
//                   labels: weeklyData.labels,
//                   datasets: [{ data: weeklyData.values }],
//                 }}
//                 width={Math.max(chartWidth, weeklyData.labels.length * 70)}
//                 height={250}
//                 fromZero
//                 showValuesOnTopOfBars
//                 yAxisLabel=""
//                 yAxisSuffix=""
//                 chartConfig={{
//                   backgroundGradientFrom: '#ffffff',
//                   backgroundGradientTo: '#ffffff',
//                   color: () => PRIMARY_COLOR,
//                   labelColor: () => '#4b5563',
//                   barPercentage: 0.6,
//                   decimalPlaces: 0,
//                   propsForBackgroundLines: {
//                     stroke: '#e5e7eb',
//                   },
//                 }}
//                 style={{ borderRadius: 12 }}
//               />
//             </ScrollView>
//           </Card>
//         ) : (
//           <Card padding={14} borderRadius={16} marginBottom={hp(12)} backgroundColor="white" elevate>
//             <Text
//               fontSize={17}
//               fontWeight="700"
//               textAlign="center"
//               marginBottom={18}
//               color="#1f2937">
//               Quarterly Performance • {selectedYear}
//             </Text>

//             {quarterlyGroups.map((quarter, i) => (
//               <View key={i} marginBottom={i < 3 ? 32 : 0}>
//                 <Text
//                   fontSize={15}
//                   fontWeight="600"
//                   marginBottom={10}
//                   color="#374151">
//                   {quarter.quarter}
//                 </Text>

//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   <BarChart
//                     data={{
//                       labels: quarter.data.map(d => d.label),
//                       datasets: [
//                         {
//                           data: quarter.data.map(d => d.value),
//                         },
//                       ],
//                     }}
//                     width={Math.max(chartWidth, quarter.data.length * 85)}
//                     height={190}
//                     fromZero
//                     yAxisLabel=""
//                     yAxisSuffix=""
//                     chartConfig={{
//                       backgroundGradientFrom: '#ffffff',
//                       backgroundGradientTo: '#ffffff',
//                       color: () => PRIMARY_COLOR,
//                       labelColor: () => '#4b5563',
//                       barPercentage: 0.65,
//                       decimalPlaces: 0,
//                       propsForBackgroundLines: {
//                         stroke: '#e5e7eb',
//                       },
//                     }}
//                     style={{ borderRadius: 12 }}
//                   />
//                 </ScrollView>
//               </View>
//             ))}
//           </Card>
//         )}
//       </YStack>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   dropdown: {
//     flex: 1,
//     height: 52,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
// });

// export default ActivityOverview;

import {
  YStack,
  Text,
  Card,
  ScrollView,
  View,
  XStack,
  Separator,
  Button,
} from 'tamagui';

import { PRIMARY_COLOR } from '../helper/Theme';
import { BarChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  GET_MONTHLY_CONTRIBUTION,
  GET_YEARLY_CONTRIBUTION,
} from '../helper/APIUtils';
import { LineDataItem } from '../type';
import Loader from './Loader';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { hp } from '../helper/Metric';
import React, { useState, useCallback } from 'react';
import { useColorScheme, Dimensions } from 'react-native';


const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
    cardBg: '#FFFFFF',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    cardBg: '#1E2937',
  },
};

const ActivityOverview = ({ctype}: {ctype: number}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const {user_token, isConnected} = useSelector((state: any) => state.user);

  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48;

  const months = [
    {label: 'January', value: 0}, {label: 'February', value: 1},
    {label: 'March', value: 2}, {label: 'April', value: 3},
    {label: 'May', value: 4}, {label: 'June', value: 5},
    {label: 'July', value: 6}, {label: 'August', value: 7},
    {label: 'September', value: 8}, {label: 'October', value: 9},
    {label: 'November', value: 10}, {label: 'December', value: 11},
  ];

  const years = [{label: '2024', value: 2024}, {label: '2025', value: 2025}, {label: '2026', value: 2026}];

  const {data: monthlyData = [], isLoading: monthlyLoading, refetch: refetchMonthly} = useQuery({
    queryKey: ['monthly-contribution', selectedYear, selectedMonth, ctype],
    queryFn: async () => {
      const res = await axios.get(`${GET_MONTHLY_CONTRIBUTION}?year=${selectedYear}&month=${selectedMonth + 1}&cType=${ctype}`);
      return res.data as any[];
    },
    enabled: !!user_token && isConnected && viewMode === 'monthly',
  });

  const {data: yearlyData = [], isLoading: yearlyLoading, refetch: refetchYearly} = useQuery({
    queryKey: ['yearly-contribution', selectedYear, ctype],
    queryFn: async () => {
      const res = await axios.get(`${GET_YEARLY_CONTRIBUTION}?year=${selectedYear}&cType=${ctype}`);
      return res.data as any[];
    },
    enabled: !!user_token && isConnected && viewMode === 'yearly',
  });

  useFocusEffect(useCallback(() => {
    if (viewMode === 'monthly') refetchMonthly();
    else refetchYearly();
  }, [viewMode, selectedMonth, selectedYear]));

  const isLoading = monthlyLoading || yearlyLoading;

  const getTitle = () => {
    const titles = {
      1: 'Article Review Contributions',
      2: 'Improvement Review Contributions',
      3: 'Report Resolution Contributions',
      4: 'Podcast Contributions',
    };
    return titles[ctype as number] || 'Moderator Activity';
  };

  const totalThisYear = yearlyData.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalThisMonth = monthlyData.reduce((sum, item) => sum + (item.value || 0), 0);

  // Weekly data for monthly view
  const weeklyData = (() => {
    const weeks: number[] = [];
    let weekIndex = 1;
    for (let i = 0; i < monthlyData.length; i += 7) {
      const chunk = monthlyData.slice(i, i + 7);
      const sum = chunk.reduce((acc, item) => acc + (item.value || 0), 0);
      weeks.push(sum);
    }
    return {labels: weeks.map((_, i) => `W${i + 1}`), values: weeks};
  })();


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

const getQuarterlyData = (data: LineDataItem[]) => {
  const map = new Map(data.map(item => [item.label, item.value || 0]));

  const normalized = MONTH_LABELS.map((label, i) => ({
    label,
    value: map.get(label) ?? map.get((i + 1).toString()) ?? 0,
  }));

  return [
    {quarter: 'Q1 (Jan-Mar)', data: normalized.slice(0, 3)},
    {quarter: 'Q2 (Apr-Jun)', data: normalized.slice(3, 6)},
    {quarter: 'Q3 (Jul-Sep)', data: normalized.slice(6, 9)},
    {quarter: 'Q4 (Oct-Dec)', data: normalized.slice(9, 12)},
  ];
};

const quarterlyGroups = getQuarterlyData(yearlyData);

  return (
    <ScrollView flex={1} backgroundColor={colors.background} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <YStack padding="$5" backgroundColor={colors.surface} borderBottomWidth={1} borderColor={colors.border}>
        <Text fontSize={24} fontWeight="700" color={colors.text}>
          {getTitle()}
        </Text>
        <Text fontSize={15} color={colors.secondaryText} marginTop="$1">
          Moderator Analytics • {new Date().getFullYear()}
        </Text>
      </YStack>

      {/* Summary Cards */}
      <XStack padding="$4" gap="$3">
        <Card flex={1} padding="$4" borderRadius={16} backgroundColor={colors.surface} elevate>
          <Text fontSize={13} color={colors.secondaryText}>Total This Year</Text>
          <Text fontSize={32} fontWeight="700" color={colors.primary} marginTop="$2">
            {totalThisYear}
          </Text>
        </Card>

        <Card flex={1} padding="$4" borderRadius={16} backgroundColor={colors.surface} elevate>
          <Text fontSize={13} color={colors.secondaryText}>This Month</Text>
          <Text fontSize={32} fontWeight="700" color={colors.primary} marginTop="$2">
            {totalThisMonth}
          </Text>
        </Card>
      </XStack>

      {/* View Toggle */}
      <XStack paddingHorizontal="$4" gap="$3" marginBottom="$4">
        <Button
          flex={1}
          height={52}
          backgroundColor={viewMode === 'monthly' ? colors.primary : colors.surface}
          borderWidth={1.5}
          borderRadius={10}
          borderColor={viewMode === 'monthly' ? colors.primary : colors.border}
          onPress={() => setViewMode('monthly')}
          pressStyle={{scale: 0.98}}>
          <Text color={viewMode === 'monthly' ? 'white' : colors.text} fontWeight="600">
            Monthly View
          </Text>
        </Button>

        <Button
          flex={1}
          height={52}
          backgroundColor={viewMode === 'yearly' ? colors.primary : colors.surface}
          borderWidth={1.5}
          borderRadius={10}
          borderColor={viewMode === 'yearly' ? colors.primary : colors.border}
          onPress={() => setViewMode('yearly')}
          pressStyle={{scale: 0.98}}>
          <Text color={viewMode === 'yearly' ? 'white' : colors.text} fontWeight="600">
            Yearly View
          </Text>
        </Button>
      </XStack>

      {/* Filters */}
      <XStack paddingHorizontal="$4" gap="$3" marginBottom="$55">
        <Dropdown
          style={{
            flex: 1,
            height: 52,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            borderWidth: 1.5,
            borderColor: colors.border,
          }}
          data={months}
          labelField="label"
          valueField="value"
          value={selectedMonth}
          onChange={item => setSelectedMonth(item.value)}
        />
        <Dropdown
          style={{
            flex: 1,
            height: 52,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            borderWidth: 1.5,
            borderColor: colors.border,
          }}
          data={years}
          labelField="label"
          valueField="value"
          value={selectedYear}
          onChange={item => setSelectedYear(item.value)}
        />
      </XStack>

      <Separator />

      {/* Chart Section */}
      <YStack padding="$4" gap="$5">
        {isLoading ? (
          <Loader />
        ) : viewMode === 'monthly' ? (
          <Card padding="$5" borderRadius={20} backgroundColor={colors.surface} elevate>
            <Text fontSize={18} fontWeight="700" color={colors.text} textAlign="center" marginBottom="$4">
              Weekly Contribution • {months[selectedMonth].label} {selectedYear}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{labels: weeklyData.labels, datasets: [{data: weeklyData.values}]}}
                width={Math.max(chartWidth, weeklyData.labels.length * 80)}
                height={280}
                fromZero
                showValuesOnTopOfBars
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  color: () => colors.primary,
                  labelColor: () => colors.secondaryText,
                  barPercentage: 0.65,
                  decimalPlaces: 0,
                  propsForBackgroundLines: {stroke: colors.border},
                }}
                style={{borderRadius: 12}}
              />
            </ScrollView>
          </Card>
        ) : (
          <Card padding="$5" borderRadius={20} backgroundColor={colors.surface} elevate>
            <Text fontSize={18} fontWeight="700" color={colors.text} textAlign="center" marginBottom="$5">
              Quarterly Performance • {selectedYear}
            </Text>

            {/* Quarterly Charts */}
            {quarterlyGroups.map((quarter, i) => (
              <View key={i} marginBottom={i < 3 ? 32 : 0}>
                 <Text
                   fontSize={15}
                   fontWeight="600"
                   marginBottom={10}
                   color="#374151">
                   {quarter.quarter}
                 </Text>

                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                   <BarChart
                     data={{
                       labels: quarter.data.map(d => d.label),
                       datasets: [
                         {
                           data: quarter.data.map(d => d.value),
                         },
                       ],
                     }}
                     width={Math.max(chartWidth, quarter.data.length * 85)}
                     height={190}
                     fromZero
                     yAxisLabel=""
                     yAxisSuffix=""
                     chartConfig={{
                       backgroundGradientFrom: '#ffffff',
                       backgroundGradientTo: '#ffffff',
                       color: () => PRIMARY_COLOR,
                       labelColor: () => '#4b5563',
                       barPercentage: 0.65,
                       decimalPlaces: 0,
                       propsForBackgroundLines: {
                         stroke: '#e5e7eb',
                       },
                     }}
                     style={{ borderRadius: 12 }}
                   />
                 </ScrollView>
               </View>
             ))}
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
};

export default ActivityOverview;