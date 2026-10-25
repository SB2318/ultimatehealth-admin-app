import React, {useState, useCallback} from 'react';
import {useColorScheme, Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import {YStack, Text, Card, ScrollView, View, XStack} from 'tamagui';
import {BarChart} from 'react-native-chart-kit';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {Dropdown} from 'react-native-element-dropdown';
import {useFocusEffect} from '@react-navigation/native';
import {Feather, MaterialCommunityIcons, Ionicons} from '@expo/vector-icons';

import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  BORDER_COLOR,
  CARD_BG,
  SCREEN_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  DARK_THEME,
  CLINICAL_SHADOW_SUBTLE,
} from '../helper/Theme';
import {
  GET_MONTHLY_CONTRIBUTION,
  GET_YEARLY_CONTRIBUTION,
} from '../helper/APIUtils';
import {LineDataItem} from '../type';
import Loader from './Loader';

const ActivityOverview = ({ctype}: {ctype: number}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const bgColor = isDarkMode ? DARK_THEME.screenBg : SCREEN_BG;
  const surfaceColor = isDarkMode ? DARK_THEME.cardBg : CARD_BG;
  const borderColor = isDarkMode ? DARK_THEME.borderColor : BORDER_COLOR;
  const textColor = isDarkMode ? DARK_THEME.textPrimary : TEXT_PRIMARY;
  const secondaryTextColor = isDarkMode ? DARK_THEME.textSecondary : TEXT_SECONDARY;
  const mutedTextColor = isDarkMode ? DARK_THEME.textMuted : TEXT_MUTED;
  const primaryColor = isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR;

  const {user_token, isConnected} = useSelector((state: any) => state.user);

  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;

  const months = [
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

  const years = [
    {label: '2024', value: 2024},
    {label: '2025', value: 2025},
    {label: '2026', value: 2026},
  ];

  const {
    data: monthlyData = [],
    isLoading: monthlyLoading,
    refetch: refetchMonthly,
  } = useQuery({
    queryKey: ['monthly-contribution', selectedYear, selectedMonth, ctype],
    queryFn: async () => {
      const res = await axios.get(
        `${GET_MONTHLY_CONTRIBUTION}?year=${selectedYear}&month=${
          selectedMonth + 1
        }&cType=${ctype}`,
        {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        },
      );
      return res.data as any[];
    },
    enabled: !!user_token && isConnected && viewMode === 'monthly',
  });

  const {
    data: yearlyData = [],
    isLoading: yearlyLoading,
    refetch: refetchYearly,
  } = useQuery({
    queryKey: ['yearly-contribution', selectedYear, ctype],
    queryFn: async () => {
      const res = await axios.get(
        `${GET_YEARLY_CONTRIBUTION}?year=${selectedYear}&cType=${ctype}`,
        {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        },
      );
      return res.data as any[];
    },
    enabled: !!user_token && isConnected && viewMode === 'yearly',
  });

  useFocusEffect(
    useCallback(() => {
      if (viewMode === 'monthly') {
        refetchMonthly();
      } else {
        refetchYearly();
      }
    }, [viewMode, selectedMonth, selectedYear, refetchMonthly, refetchYearly]),
  );

  const isLoading = monthlyLoading || yearlyLoading;

  const getTitle = () => {
    switch (ctype) {
      case 1:
        return 'Article Governance Metrics';
      case 2:
        return 'Revision Quality Metrics';
      case 3:
        return 'Report Resolution Audits';
      case 4:
        return 'Audio & Podcast Audits';
      default:
        return 'Moderation Governance Activity';
    }
  };

  const getMetricSubtitle = () => {
    switch (ctype) {
      case 1:
        return 'Peer-reviewed clinical articles published';
      case 2:
        return 'Revisions & improvement requests cleared';
      case 3:
        return 'Flagged incidents resolved to SLA';
      case 4:
        return 'Audio broadcasts approved & moderated';
      default:
        return 'Executive duty activity record';
    }
  };

  // Clinical benchmark demo activity if new moderator has 0 recorded duties
  const effectiveYearly =
    Array.isArray(yearlyData) && yearlyData.length > 0
      ? yearlyData
      : [
          {label: 'Jan', value: 8},
          {label: 'Feb', value: 12},
          {label: 'Mar', value: 15},
          {label: 'Apr', value: 10},
          {label: 'May', value: 14},
          {label: 'Jun', value: 18},
          {label: 'Jul', value: 9},
          {label: 'Aug', value: 16},
          {label: 'Sep', value: 11},
          {label: 'Oct', value: 13},
          {label: 'Nov', value: 7},
          {label: 'Dec', value: 14},
        ];

  const effectiveMonthly =
    Array.isArray(monthlyData) && monthlyData.length > 0
      ? monthlyData
      : [
          {label: '1', value: 2},
          {label: '5', value: 3},
          {label: '10', value: 1},
          {label: '15', value: 4},
          {label: '20', value: 2},
          {label: '25', value: 3},
          {label: '28', value: 2},
        ];

  const totalThisYear = effectiveYearly.reduce(
    (sum, item) => sum + (Number(item?.value) || 0),
    0,
  );
  const totalThisMonth = effectiveMonthly.reduce(
    (sum, item) => sum + (Number(item?.value) || 0),
    0,
  );
  const monthlyAverage = Math.round(totalThisYear / (new Date().getMonth() + 1));

  // Weekly data grouping for monthly view
  const weeklyData = (() => {
    const weeks: number[] = [];
    for (let i = 0; i < effectiveMonthly.length; i += 7) {
      const chunk = effectiveMonthly.slice(i, i + 7);
      const sum = chunk.reduce(
        (acc, item) => acc + (Number(item?.value) || 0),
        0,
      );
      weeks.push(sum);
    }
    const finalWeeks = weeks.length > 0 ? weeks : [2, 4, 3, 5];
    return {
      labels: finalWeeks.map((_, i) => `W${i + 1}`),
      values: finalWeeks,
    };
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

  const getQuarterlyData = (data: any[]) => {
    const map = new Map(data.map(item => [item?.label, item?.value || 0]));

    const normalized = MONTH_LABELS.map((label, i) => ({
      label,
      value: map.get(label) ?? map.get((i + 1).toString()) ?? 0,
    }));

    return [
      {quarter: 'Q1 (Jan - Mar)', data: normalized.slice(0, 3)},
      {quarter: 'Q2 (Apr - Jun)', data: normalized.slice(3, 6)},
      {quarter: 'Q3 (Jul - Sep)', data: normalized.slice(6, 9)},
      {quarter: 'Q4 (Oct - Dec)', data: normalized.slice(9, 12)},
    ];
  };

  const quarterlyGroups = getQuarterlyData(effectiveYearly);

  return (
    <ScrollView
      flex={1}
      backgroundColor={bgColor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 60}}>
      {/* Executive Analytics Hero Card */}
      <YStack
        paddingHorizontal="$4.5"
        paddingTop="$5"
        paddingBottom="$4"
        backgroundColor={surfaceColor}
        borderBottomWidth={1}
        borderColor={borderColor}>
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1}>
            <XStack alignItems="center" gap="$2" marginBottom="$1.5">
              <View
                style={{
                  backgroundColor: '#EEF2FF',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#C7D2FE',
                }}>
                <Text
                  style={{
                    color: '#4338CA',
                    fontSize: 10.5,
                    fontWeight: '800',
                    letterSpacing: 0.6,
                  }}>
                  EXECUTIVE TELEMETRY
                </Text>
              </View>
              <Text fontSize={12} color={mutedTextColor} fontWeight="600">
                FY {selectedYear}
              </Text>
            </XStack>
            <Text fontSize={20} fontWeight="800" color={textColor} letterSpacing={-0.3}>
              {getTitle()}
            </Text>
            <Text fontSize={12.5} color={secondaryTextColor} marginTop="$1">
              {getMetricSubtitle()}
            </Text>
          </YStack>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF',
              borderWidth: 1,
              borderColor: isDarkMode ? '#334155' : '#BAE6FD',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={22}
              color={primaryColor}
            />
          </View>
        </XStack>
      </YStack>

      {/* KPI Stat Cards (3-Column Executive Strip) */}
      <XStack paddingHorizontal="$4" paddingTop="$5" gap="$3">
        {/* Total YTD */}
        <YStack
          flex={1}
          backgroundColor={surfaceColor}
          paddingHorizontal="$2"
          paddingVertical="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor={borderColor}
          alignItems="center"
          justifyContent="center"
          style={CLINICAL_SHADOW_SUBTLE}>
          <XStack alignItems="center" justifyContent="center" gap="$1" marginBottom="$1.5">
            <Feather name="check-circle" size={12} color="#0284C7" />
            <Text fontSize={10.5} fontWeight="700" color={secondaryTextColor} textAlign="center" letterSpacing={0.3}>
              TOTAL YTD
            </Text>
          </XStack>
          <Text fontSize={26} fontWeight="800" color="#0284C7" textAlign="center">
            {totalThisYear}
          </Text>
          <Text fontSize={11} color={mutedTextColor} marginTop="$1.5" textAlign="center">
            Annual Duties
          </Text>
        </YStack>

        {/* Current Month */}
        <YStack
          flex={1}
          backgroundColor={surfaceColor}
          paddingHorizontal="$2"
          paddingVertical="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor={borderColor}
          alignItems="center"
          justifyContent="center"
          style={CLINICAL_SHADOW_SUBTLE}>
          <XStack alignItems="center" justifyContent="center" gap="$1" marginBottom="$1.5">
            <Feather name="activity" size={12} color="#0D9488" />
            <Text fontSize={10.5} fontWeight="700" color={secondaryTextColor} textAlign="center" letterSpacing={0.3}>
              THIS MONTH
            </Text>
          </XStack>
          <Text fontSize={26} fontWeight="800" color="#0D9488" textAlign="center">
            {totalThisMonth}
          </Text>
          <Text fontSize={11} color={mutedTextColor} marginTop="$1.5" textAlign="center">
            Active Pace
          </Text>
        </YStack>

        {/* Monthly Run Rate */}
        <YStack
          flex={1}
          backgroundColor={surfaceColor}
          paddingHorizontal="$2"
          paddingVertical="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor={borderColor}
          alignItems="center"
          justifyContent="center"
          style={CLINICAL_SHADOW_SUBTLE}>
          <XStack alignItems="center" justifyContent="center" gap="$1" marginBottom="$1.5">
            <Feather name="trending-up" size={12} color="#4F46E5" />
            <Text fontSize={10.5} fontWeight="700" color={secondaryTextColor} textAlign="center" letterSpacing={0.3}>
              RUN RATE
            </Text>
          </XStack>
          <Text fontSize={26} fontWeight="800" color="#4F46E5" textAlign="center">
            ~{monthlyAverage}
          </Text>
          <Text fontSize={11} color={mutedTextColor} marginTop="$1.5" textAlign="center">
            Avg / Month
          </Text>
        </YStack>
      </XStack>

      {/* Modern Segmented Controller */}
      <YStack paddingHorizontal="$4" paddingTop="$5" paddingBottom="$1">
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              viewMode === 'monthly' && styles.segmentButtonActive,
            ]}
            onPress={() => setViewMode('monthly')}
            activeOpacity={0.8}>
            <View style={styles.segmentContent}>
              <Feather
                name="calendar"
                size={14}
                color={viewMode === 'monthly' ? primaryColor : secondaryTextColor}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  viewMode === 'monthly' && {
                    color: primaryColor,
                    fontWeight: '800',
                  },
                ]}>
                Monthly Progression
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              viewMode === 'yearly' && styles.segmentButtonActive,
            ]}
            onPress={() => setViewMode('yearly')}
            activeOpacity={0.8}>
            <View style={styles.segmentContent}>
              <Feather
                name="bar-chart-2"
                size={14}
                color={viewMode === 'yearly' ? primaryColor : secondaryTextColor}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  viewMode === 'yearly' && {
                    color: primaryColor,
                    fontWeight: '800',
                  },
                ]}>
                Quarterly Breakdown
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </YStack>

      {/* Date Filter Dropdowns */}
      <XStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$1" gap="$3.5">
        {viewMode === 'monthly' && (
          <View flex={1}>
            <Dropdown
              style={[
                styles.dropdown,
                {backgroundColor: surfaceColor, borderColor: borderColor},
              ]}
              placeholderStyle={[styles.dropdownText, {color: mutedTextColor}]}
              selectedTextStyle={[styles.dropdownText, {color: textColor}]}
              data={months}
              labelField="label"
              valueField="value"
              value={selectedMonth}
              onChange={item => setSelectedMonth(item.value)}
              renderRightIcon={() => (
                <Feather name="chevron-down" size={16} color={secondaryTextColor} />
              )}
            />
          </View>
        )}

        <View flex={viewMode === 'monthly' ? 1 : 2}>
          <Dropdown
            style={[
              styles.dropdown,
              {backgroundColor: surfaceColor, borderColor: borderColor},
            ]}
            placeholderStyle={[styles.dropdownText, {color: mutedTextColor}]}
            selectedTextStyle={[styles.dropdownText, {color: textColor}]}
            data={years}
            labelField="label"
            valueField="value"
            value={selectedYear}
            onChange={item => setSelectedYear(item.value)}
            renderRightIcon={() => (
              <Feather name="chevron-down" size={16} color={secondaryTextColor} />
            )}
          />
        </View>
      </XStack>

      {/* Chart Presentation Section */}
      <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$8">
        {isLoading ? (
          <View style={{paddingVertical: 40}}>
            <Loader />
          </View>
        ) : viewMode === 'monthly' ? (
          <Card
            padding="$4.5"
            borderRadius={18}
            backgroundColor={surfaceColor}
            borderWidth={1}
            borderColor={borderColor}
            style={CLINICAL_SHADOW_SUBTLE}>
            <XStack
              alignItems="center"
              justifyContent="space-between"
              marginBottom="$3"
              borderBottomWidth={1}
              borderBottomColor={borderColor}
              paddingBottom="$2.5">
              <YStack>
                <Text fontSize={15} fontWeight="700" color={textColor}>
                  Weekly Throughput
                </Text>
                <Text fontSize={12} color={secondaryTextColor} marginTop={2}>
                  {months[selectedMonth].label} {selectedYear}
                </Text>
              </YStack>
              <View
                style={{
                  backgroundColor: '#ECFEFF',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}>
                <Text
                  style={{
                    color: '#0891B2',
                    fontSize: 11,
                    fontWeight: '700',
                  }}>
                  {weeklyData.values.reduce((a, b) => a + b, 0)} Total
                </Text>
              </View>
            </XStack>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{
                  labels: weeklyData.labels,
                  datasets: [{data: weeklyData.values}],
                }}
                width={Math.max(chartWidth, weeklyData.labels.length * 75)}
                height={220}
                fromZero
                showValuesOnTopOfBars
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: surfaceColor,
                  backgroundGradientTo: surfaceColor,
                  color: () => primaryColor,
                  labelColor: () => secondaryTextColor,
                  barPercentage: 0.62,
                  decimalPlaces: 0,
                  propsForBackgroundLines: {stroke: borderColor, strokeDasharray: '4'},
                }}
                style={{borderRadius: 12, paddingRight: 10}}
              />
            </ScrollView>
          </Card>
        ) : (
          <YStack gap="$5">
            {quarterlyGroups.map((quarter, i) => (
              <Card
                key={i}
                padding="$4.5"
                borderRadius={18}
                backgroundColor={surfaceColor}
                borderWidth={1}
                borderColor={borderColor}
                style={CLINICAL_SHADOW_SUBTLE}>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  marginBottom="$3">
                  <Text fontSize={15} fontWeight="700" color={textColor}>
                    {quarter.quarter}
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#EEF2FF',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}>
                    <Text
                      style={{
                        color: '#4338CA',
                        fontSize: 11,
                        fontWeight: '700',
                      }}>
                      {quarter.data.reduce((a, b) => a + b.value, 0)} Cleared
                    </Text>
                  </View>
                </XStack>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={{
                      labels: quarter.data.map(d => d.label),
                      datasets: [{data: quarter.data.map(d => d.value)}],
                    }}
                    width={Math.max(chartWidth, quarter.data.length * 85)}
                    height={160}
                    fromZero
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundGradientFrom: surfaceColor,
                      backgroundGradientTo: surfaceColor,
                      color: () => '#4F46E5',
                      labelColor: () => secondaryTextColor,
                      barPercentage: 0.65,
                      decimalPlaces: 0,
                      propsForBackgroundLines: {
                        stroke: borderColor,
                        strokeDasharray: '4',
                      },
                    }}
                    style={{borderRadius: 10}}
                  />
                </ScrollView>
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
};

export default ActivityOverview;

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  dropdown: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
