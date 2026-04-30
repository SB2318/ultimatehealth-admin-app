import React, {useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {Category, HomeScreenCategoriesFlatlistProps} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';
import {hp, wp} from '../helper/Metric';

const CategoriesFlatlistModal = ({
  bottomSheetModalRef2,
  categories,
  handleCategorySelection,
  selectCategoryList,
}: HomeScreenCategoriesFlatlistProps) => {
  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.7}
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ['25%', '68%', '92%'], []);

  const renderItem = useCallback(
    ({item}: {item: any}) => {
      const isSelected = selectCategoryList.includes(item?.name);

      return (
        <TouchableOpacity
          style={[
            styles.item,
            isSelected && styles.itemSelected,
          ]}
          activeOpacity={0.85}
          onPress={() => handleCategorySelection(item?.name)}
        >
          <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
            {item?.name}
          </Text>
          
          {isSelected && (
            <View style={styles.checkContainer}>
              <MaterialIcons name="check-circle" size={26} color="white" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [handleCategorySelection, selectCategoryList],
  );

  const handleDismiss = useCallback(() => {
    bottomSheetModalRef2.current?.close();
  }, [bottomSheetModalRef2]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef2}
      snapPoints={snapPoints}
      index={1}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleDismiss}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={BUTTON_COLOR} />
        </TouchableOpacity>

        <Text style={styles.title}>Select Categories</Text>
      </View>

      {/* List */}
      <BottomSheetFlatList
        data={categories}
        keyExtractor={(item: Category) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        extraData={selectCategoryList}
      />
    </BottomSheetModal>
  );
};

export default CategoriesFlatlistModal;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: ON_PRIMARY_COLOR,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  handleIndicator: {
    width: 42,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 10,
    marginTop: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  backButton: {
    padding: 8,
    marginLeft: -8,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: "#1F2024",
    marginLeft: 12,
  },

  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(4),
  },

  item: {
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(5),
    marginBottom: hp(1.2),
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  itemSelected: {
    backgroundColor: BUTTON_COLOR,
    borderColor: BUTTON_COLOR,
  },

  itemText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1F2024',
    flex: 1,
  },

  itemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },

  checkContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 50,
    padding: 2,
  },
});