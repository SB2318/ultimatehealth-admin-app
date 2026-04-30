import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CategoriesFlatlistModal from './CategoriesFlatlistModal';
import {
  BUTTON_COLOR,
  ON_PRIMARY_COLOR,
  PRIMARY_COLOR,
} from '../helper/Theme';
import {HomeScreenFilterModalProps} from '../type';
import {hp, wp} from '../helper/Metric';

const FilterModal = ({
  bottomSheetModalRef,
  categories,
  handleCategorySelection,
  selectCategoryList,
  handleFilterReset,
  handleFilterApply,
  setSortingType,
}: HomeScreenFilterModalProps) => {
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);
  const [selectedSort, setSelectedSort] = useState('recent');

  const sortBy = ['recent', 'popular', 'oldest'];

  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['85%', '90%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.75}
      />
    ),
    [],
  );

  const handleDismiss = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, [bottomSheetModalRef]);

  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort);
    setSortingType(sort);
  };

  const handleReset = () => {
    setSelectedSort('recent');
    handleFilterReset();
    handleDismiss();
  };

  const handleApply = () => {
    handleFilterApply();
    handleDismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      topInset={insets.top}>
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <MaterialIcons name="close" size={28} color={"#1F2024"} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Sort By Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortContainer}>
              {sortBy.map(item => {
                const isActive = selectedSort === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.sortChip, isActive && styles.sortChipActive]}
                    onPress={() => handleSortSelect(item)}>
                    <Text
                      style={[
                        styles.sortChipText,
                        isActive && styles.sortChipTextActive,
                      ]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => bottomSheetModalRef2.current?.present()}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.seeAllContainer}>
                <Text style={styles.seeAllText}>See all</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={"#1F2024"}
                />
              </View>
            </TouchableOpacity>

            {/* Selected Categories Pills */}
            {selectCategoryList.length > 0 && (
              <FlatList
                horizontal
                data={selectCategoryList}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedList}
                renderItem={({item}) => (
                  <View style={styles.selectedPill}>
                    <Text style={styles.selectedPillText}>
                      {item.length > 12 ? item.substring(0, 12) + '...' : item}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCategorySelection(item)}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <MaterialIcons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={item => item}
              />
            )}

            {/* Quick Category Options */}
            <View style={styles.quickCategories}>
              {categories.slice(0, 6).map((item, index) => {
                const isSelected = selectCategoryList.includes(item?.name);
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.quickCategoryItem,
                      isSelected && styles.quickCategoryItemSelected,
                    ]}
                    onPress={() => handleCategorySelection(item?.name)}>
                    <Text
                      style={[
                        styles.quickCategoryText,
                        isSelected && styles.quickCategoryTextSelected,
                      ]}>
                      {item?.name}
                    </Text>
                    {isSelected && (
                      <MaterialIcons
                        name="check-circle"
                        size={22}
                        color="white"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>

      {/* Category Selection Modal */}
      <CategoriesFlatlistModal
        bottomSheetModalRef2={bottomSheetModalRef2}
        categories={categories}
        handleCategorySelection={handleCategorySelection}
        selectCategoryList={selectCategoryList}
      />
    </BottomSheetModal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: ON_PRIMARY_COLOR,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 10,
    marginTop: 10,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.2),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: "#1F2024",
  },
  closeButton: {
    position: 'absolute',
    right: wp(5),
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(10),
  },
  section: {
    marginBottom: hp(3.5),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#1F2024",
    marginBottom: hp(1.8),
  },
  sortContainer: {
    paddingVertical: hp(0.5),
  },
  sortChip: {
    paddingHorizontal: wp(5.5),
    paddingVertical: hp(1.4),
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: wp(3),
  },
  sortChipActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  sortChipText: {
    fontSize: 16,
    fontWeight: '500',
    color: "#1F2024",
    textTransform: 'capitalize',
  },
  sortChipTextActive: {
    color: 'white',
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    color: "#1F2024",
    fontWeight: '500',
  },

  selectedList: {
    paddingVertical: hp(1),
    marginBottom: hp(2),
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BUTTON_COLOR,
    borderRadius: 30,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginRight: wp(2.5),
  },
  selectedPillText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },

  quickCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hp(1.2),
  },
  quickCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(4),
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    width: '48%',
  },
  quickCategoryItemSelected: {
    backgroundColor: BUTTON_COLOR,
    borderColor: BUTTON_COLOR,
  },
  quickCategoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: "#1F2024",
    flex: 1,
  },
  quickCategoryTextSelected: {
    color: 'white',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    backgroundColor: ON_PRIMARY_COLOR,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    gap: wp(3),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  resetButton: {
    flex: 1,
    paddingVertical: hp(2),
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
    alignItems: 'center',
  },
  resetButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 17,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: hp(2),
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});