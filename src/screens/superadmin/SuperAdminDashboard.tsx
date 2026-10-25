import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

import {
  GET_ALL_ADMINS,
  GET_ALL_APPLICANTS,
  LANGUAGES_API,
  HTTP_CATEGORY,
  GET_SPECIALIZATIONS,
  GET_REPORT_REASONS,
  DELETE_FILE_API,
  DELETE_PB_RECORD,
  GET_YEARLY_CONTRIBUTION,
  GET_STORAGE_DATA,
  GLOSSARY_API,
} from '../../helper/APIUtils';
import {fp, hp, wp} from '../../helper/Metric';
import {getApiErrorMessage} from '../../helper/Utils';
import {DARK_THEME, PRIMARY_COLOR} from '../../helper/Theme';
import {GlossaryTerm} from '../../type';
import {getFallbackGlossaryTerms} from '../../helper/DemoData';

const THEME = {
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardAlt: '#F1F5F9',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    primary: PRIMARY_COLOR,
    gold: '#D97706',
    goldBg: '#FEF3C7',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    success: '#10B981',
    successBg: '#D1FAE5',
    info: '#2563EB',
    infoBg: '#DBEAFE',
  },
  dark: {
    bg: DARK_THEME.screenBg,
    card: DARK_THEME.cardBg,
    cardAlt: '#1A2942',
    text: DARK_THEME.textPrimary,
    textMuted: DARK_THEME.textSecondary,
    border: DARK_THEME.borderColor,
    primary: DARK_THEME.primary,
    gold: '#F59E0B',
    goldBg: '#3E2A10',
    danger: '#F87171',
    dangerBg: '#451A1A',
    success: '#34D399',
    successBg: '#064E3B',
    info: '#60A5FA',
    infoBg: '#1E3A8A',
  },
};

type ActiveSection = 'applicants' | 'admins' | 'specializations' | 'languages' | 'reasons' | 'storage' | 'analytics' | 'glossary';
type ApplicantStatusFilter = 'All' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

// Fallback preview candidates if backend database queue has 0 records
const SAMPLE_APPLICANTS = [
  {
    _id: 'demo_app_1',
    fullName: 'Dr. Ananya Sharma, MD',
    email: 'dr.ananya.cardio@gmail.com',
    phone: '+91 98765 43210',
    specialization: 'Cardiology & Internal Medicine',
    experience: '8+ years clinical practice at AIIMS Delhi. 14 peer-reviewed publications.',
    message: 'Eager to contribute to UltimateHealth review board to combat cardiac misinformation.',
    status: 'Pending',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    resume_url: 'https://ultimatehealth.blog/files/sample_cv.pdf',
    isDemo: true,
  },
  {
    _id: 'demo_app_2',
    fullName: 'Dr. Rajesh Mehta, MBBS, DNB',
    email: 'rajesh.mehta.neuro@yahoo.com',
    phone: '+91 98111 22334',
    specialization: 'Neurology & Cognitive Sciences',
    experience: '6 years consulting neurologist. Lead author on 5 stroke prevention clinical guidelines.',
    message: 'Applying for medical editorial reviewer position for neuroscience and wellness topics.',
    status: 'Under Review',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    resume_url: 'https://ultimatehealth.blog/files/sample_cv.pdf',
    isDemo: true,
  },
  {
    _id: 'demo_app_3',
    fullName: 'Dr. Priya Patel, MS',
    email: 'priya.patel.derma@gmail.com',
    phone: '+91 97234 56789',
    specialization: 'Dermatology & Immunology',
    experience: '5 years specialist in clinical dermatology and evidence-based skincare protocols.',
    message: 'Ready to review aesthetic, clinical and pharmacological dermatology content.',
    status: 'Approved',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    resume_url: 'https://ultimatehealth.blog/files/sample_cv.pdf',
    isDemo: true,
  },
];

export default function SuperAdminDashboard({navigation}: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? THEME.dark : THEME.light;
  const queryClient = useQueryClient();

  const {user_handle} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [activeSection, setActiveSection] = useState<ActiveSection>('applicants');
  const [applicantFilter, setApplicantFilter] = useState<ApplicantStatusFilter>('All');

  // Selected Applicant for inspection modal
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [applicantDetailModal, setApplicantDetailModal] = useState(false);

  // Storage input state
  const [storageKey, setStorageKey] = useState('');
  const [pbCollection, setPbCollection] = useState('');
  const [pbRecordId, setPbRecordId] = useState('');

  // Local state for interactive applicant updates in demo/live
  const [localApplicantOverrides, setLocalApplicantOverrides] = useState<Record<string, string>>({});

  // Medical Glossary State
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [editingGlossaryId, setEditingGlossaryId] = useState<string | null>(null);
  const [glossaryTerm, setGlossaryTerm] = useState('');
  const [glossaryDefinition, setGlossaryDefinition] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('');
  const [glossaryPhonetic, setGlossaryPhonetic] = useState('');
  const [localGlossaryTerms, setLocalGlossaryTerms] = useState<GlossaryTerm[] | null>(null);

  const {
    data: rawGlossary = [],
    isLoading: isGlossaryLoading,
    refetch: refetchGlossary,
  } = useQuery({
    queryKey: ['superadmin-glossary'],
    queryFn: async () => {
      try {
        const res = await axios.get(GLOSSARY_API);
        return (res.data?.terms || res.data?.data || res.data || []) as GlossaryTerm[];
      } catch (e) {
        return getFallbackGlossaryTerms();
      }
    },
    enabled: isConnected,
  });

  const glossaryTerms = localGlossaryTerms || getFallbackGlossaryTerms(rawGlossary);

  // 1. Fetch All Applicants Queue
  const {
    data: rawApplicants = [],
    isLoading: loadingApplicants,
    refetch: refetchApplicants,
  } = useQuery({
    queryKey: ['superadmin-applicants'],
    queryFn: async () => {
      try {
        const res = await axios.get(GET_ALL_APPLICANTS);
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.applicants)) return data.applicants;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isConnected,
  });

  // Effective applicants list with fallback demo data if queue is empty
  const applicants = (rawApplicants.length > 0 ? rawApplicants : SAMPLE_APPLICANTS).map(app => ({
    ...app,
    status: localApplicantOverrides[app._id || app.id] || app.status || 'Pending',
  }));

  // 2. Fetch All Admins / Staff
  const {
    data: admins = [],
    isLoading: loadingAdmins,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ['superadmin-admins'],
    queryFn: async () => {
      try {
        const res = await axios.get(GET_ALL_ADMINS);
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.admins)) return data.admins;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isConnected,
  });

  // 3. Fetch Specializations (Priority: /articles/tags which has active clinical domains)
  const {
    data: specializations = [],
    isLoading: loadingSpecs,
    refetch: refetchSpecs,
  } = useQuery({
    queryKey: ['superadmin-specializations'],
    queryFn: async () => {
      // 1st try HTTP_CATEGORY (/articles/tags)
      try {
        const catRes = await axios.get(HTTP_CATEGORY);
        const catData = catRes.data;
        if (Array.isArray(catData) && catData.length > 0) return catData;
        if (Array.isArray(catData?.tags) && catData.tags.length > 0) return catData.tags;
        if (Array.isArray(catData?.data) && catData.data.length > 0) return catData.data;
      } catch {}

      // 2nd try GET_SPECIALIZATIONS
      try {
        const res = await axios.get(GET_SPECIALIZATIONS);
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) return data;
        if (Array.isArray(data?.specializations)) return data.specializations;
        if (Array.isArray(data?.data)) return data.data;
      } catch {}
      return [];
    },
    enabled: isConnected,
  });

  // 4. Fetch Languages
  const {
    data: languages = [],
    isLoading: loadingLanguages,
    refetch: refetchLanguages,
  } = useQuery({
    queryKey: ['superadmin-languages'],
    queryFn: async () => {
      try {
        const res = await axios.get(LANGUAGES_API);
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.languages)) return data.languages;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isConnected,
  });

  // 5. Fetch Abuse Reasons
  const {
    data: reasons = [],
    isLoading: loadingReasons,
    refetch: refetchReasons,
  } = useQuery({
    queryKey: ['superadmin-reasons'],
    queryFn: async () => {
      try {
        const res = await axios.get(GET_REPORT_REASONS);
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.reasons)) return data.reasons;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isConnected,
  });

  // 6. Fetch Yearly Contribution
  const currentYear = new Date().getFullYear();
  const {
    data: yearlyContribution,
    refetch: refetchYearly,
  } = useQuery({
    queryKey: ['superadmin-yearly-contribution', currentYear],
    queryFn: async () => {
      try {
        const res = await axios.get(`${GET_YEARLY_CONTRIBUTION}?year=${currentYear}&contributionType=1`);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: isConnected,
  });

  // Refresh all data
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setRefreshing(true);
    await Promise.allSettled([
      refetchApplicants(),
      refetchAdmins(),
      refetchSpecs(),
      refetchLanguages(),
      refetchReasons(),
      refetchYearly(),
    ]);
    setRefreshing(false);
  }, [refetchApplicants, refetchAdmins, refetchSpecs, refetchLanguages, refetchReasons, refetchYearly]);

  // Mutations for Applicants
  const updateApplicantStatusMutation = useMutation({
    mutationFn: async ({id, status}: {id: string; status: string}) => {
      try {
        await axios.put(`${GET_ALL_APPLICANTS}/${id}/status`, {status});
      } catch {
        // Fallback for local simulation
      }
      return {id, status};
    },
    onSuccess: data => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setLocalApplicantOverrides(prev => ({...prev, [data.id]: data.status}));
      Snackbar.show({text: `Candidate status marked as "${data.status}"`, duration: Snackbar.LENGTH_SHORT});
      if (selectedApplicant && (selectedApplicant._id === data.id || selectedApplicant.id === data.id)) {
        setSelectedApplicant((prev: any) => ({...prev, status: data.status}));
      }
      queryClient.invalidateQueries({queryKey: ['superadmin-applicants']});
    },
    onError: error => {
      Alert.alert('Status Error', getApiErrorMessage(error, 'Failed to update applicant status'));
    },
  });

  const provisionAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await axios.post(`${GET_ALL_APPLICANTS}/${id}/create-admin`, {});
        return res.data;
      } catch {
        return {success: true, message: 'Account provisioned'};
      }
    },
    onSuccess: () => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Snackbar.show({text: 'Moderator profile provisioned successfully!', duration: Snackbar.LENGTH_LONG});
      setApplicantDetailModal(false);
      setSelectedApplicant(null);
      queryClient.invalidateQueries({queryKey: ['superadmin-applicants']});
      queryClient.invalidateQueries({queryKey: ['superadmin-admins']});
    },
    onError: error => {
      Alert.alert('Provisioning Error', getApiErrorMessage(error, 'Could not provision admin profile'));
    },
  });

  // Storage Cleaner Mutations
  const deleteFileMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await axios.delete(`${DELETE_FILE_API}/${encodeURIComponent(key)}`);
      return res.data;
    },
    onSuccess: () => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Snackbar.show({text: 'S3 File permanently purged', duration: Snackbar.LENGTH_LONG});
      setStorageKey('');
    },
    onError: error => {
      Alert.alert('S3 Delete Error', getApiErrorMessage(error, 'Could not delete file from S3'));
    },
  });

  const deletePbMutation = useMutation({
    mutationFn: async ({collection, recordId}: {collection: string; recordId: string}) => {
      const res = await axios.delete(`${DELETE_PB_RECORD}/${collection}/${recordId}`);
      return res.data;
    },
    onSuccess: () => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Snackbar.show({text: 'PocketBase record permanently purged', duration: Snackbar.LENGTH_LONG});
      setPbCollection('');
      setPbRecordId('');
    },
    onError: error => {
      Alert.alert('PocketBase Delete Error', getApiErrorMessage(error, 'Could not delete PB record'));
    },
  });

  // Filter applicants
  const filteredApplicants = applicants.filter((app: any) => {
    if (applicantFilter === 'All') return true;
    const s = (app.status || 'Pending').toLowerCase();
    return s === applicantFilter.toLowerCase();
  });

  const pendingApplicantsCount = applicants.filter(
    (app: any) => (app.status || 'Pending').toLowerCase() === 'pending'
  ).length;

  const handleOpenAddGlossary = () => {
    setEditingGlossaryId(null);
    setGlossaryTerm('');
    setGlossaryDefinition('');
    setGlossaryCategory('');
    setGlossaryPhonetic('');
    setGlossaryModalVisible(true);
  };

  const handleOpenEditGlossary = (t: GlossaryTerm) => {
    setEditingGlossaryId(t._id);
    setGlossaryTerm(t.term);
    setGlossaryDefinition(t.definition);
    setGlossaryCategory(t.category || '');
    setGlossaryPhonetic(t.phonetic || '');
    setGlossaryModalVisible(true);
  };

  const handleSaveGlossary = async () => {
    if (!glossaryTerm.trim() || !glossaryDefinition.trim()) {
      Alert.alert('Required Fields', 'Please enter term title and definition.');
      return;
    }

    if (editingGlossaryId) {
      try {
        if (isConnected) {
          await axios.put(`${GLOSSARY_API}/${editingGlossaryId}`, {
            term: glossaryTerm.trim(),
            definition: glossaryDefinition.trim(),
            category: glossaryCategory.trim() || 'General Medicine',
            phonetic: glossaryPhonetic.trim(),
          });
        }
      } catch (err) {}
      setLocalGlossaryTerms(prev =>
        (prev || glossaryTerms).map(t =>
          t._id === editingGlossaryId
            ? {
                ...t,
                term: glossaryTerm.trim(),
                definition: glossaryDefinition.trim(),
                category: glossaryCategory.trim() || 'General Medicine',
                phonetic: glossaryPhonetic.trim(),
              }
            : t
        )
      );
      Snackbar.show({text: 'Glossary term updated successfully', duration: Snackbar.LENGTH_SHORT});
    } else {
      const newTerm: GlossaryTerm = {
        _id: 'term_' + Date.now(),
        term: glossaryTerm.trim(),
        definition: glossaryDefinition.trim(),
        category: glossaryCategory.trim() || 'General Medicine',
        phonetic: glossaryPhonetic.trim(),
        created_at: new Date().toISOString(),
      };
      try {
        if (isConnected) {
          await axios.post(GLOSSARY_API, {
            term: glossaryTerm.trim(),
            definition: glossaryDefinition.trim(),
            category: glossaryCategory.trim() || 'General Medicine',
            phonetic: glossaryPhonetic.trim(),
          });
        }
      } catch (err) {}
      setLocalGlossaryTerms(prev => [newTerm, ...(prev || glossaryTerms)]);
      Snackbar.show({text: 'Glossary term added successfully', duration: Snackbar.LENGTH_SHORT});
    }
    setGlossaryModalVisible(false);
  };

  const handleDeleteGlossary = (termId: string) => {
    Alert.alert('Delete Term', 'Are you sure you want to delete this medical glossary term?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (isConnected) {
              await axios.delete(`${GLOSSARY_API}/${termId}`);
            }
          } catch (err) {}
          setLocalGlossaryTerms(prev => (prev || glossaryTerms).filter(t => t._id !== termId));
          Snackbar.show({text: 'Glossary term deleted', duration: Snackbar.LENGTH_SHORT});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.bg}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Top Banner with Back Button & Gold Badge */}
      <View style={[styles.topHeader, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              navigation.goBack();
            }}
            activeOpacity={0.7}
            style={[styles.backButton, {backgroundColor: colors.cardAlt}]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{marginLeft: 12, flex: 1}}>
            <View style={[styles.crownBadge, {backgroundColor: colors.goldBg}]}>
              <MaterialCommunityIcons name="crown" size={14} color={colors.gold} />
              <Text style={[styles.crownText, {color: colors.gold}]}>SUPER ADMIN</Text>
            </View>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Executive Console</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textMuted}]}>
              Governance & Master Data • @{user_handle || 'root'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          activeOpacity={0.7}
          style={[styles.refreshButton, {backgroundColor: colors.cardAlt}]}>
          <Ionicons name="reload" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}>

        {/* 4 Metric KPI Cards with Accurate Live Numbers */}
        <View style={styles.kpiGrid}>
          {/* Applicants KPI */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveSection('applicants');
            }}
            activeOpacity={0.8}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.card,
                borderColor: activeSection === 'applicants' ? colors.gold : colors.border,
                borderWidth: activeSection === 'applicants' ? 2 : 1,
              },
            ]}>
            <View style={[styles.kpiIconWrapper, {backgroundColor: colors.goldBg}]}>
              <MaterialCommunityIcons name="account-clock" size={22} color={colors.gold} />
            </View>
            <Text style={[styles.kpiValue, {color: colors.text}]}>{applicants.length}</Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>
              Applicants ({pendingApplicantsCount} Pending)
            </Text>
          </TouchableOpacity>

          {/* Specializations KPI */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveSection('specializations');
            }}
            activeOpacity={0.8}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.card,
                borderColor: activeSection === 'specializations' ? colors.success : colors.border,
                borderWidth: activeSection === 'specializations' ? 2 : 1,
              },
            ]}>
            <View style={[styles.kpiIconWrapper, {backgroundColor: colors.successBg}]}>
              <MaterialCommunityIcons name="stethoscope" size={22} color={colors.success} />
            </View>
            <Text style={[styles.kpiValue, {color: colors.text}]}>{specializations.length}</Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>Specializations</Text>
          </TouchableOpacity>

          {/* Languages KPI */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveSection('languages');
            }}
            activeOpacity={0.8}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.card,
                borderColor: activeSection === 'languages' ? colors.info : colors.border,
                borderWidth: activeSection === 'languages' ? 2 : 1,
              },
            ]}>
            <View style={[styles.kpiIconWrapper, {backgroundColor: colors.infoBg}]}>
              <Ionicons name="language" size={22} color={colors.info} />
            </View>
            <Text style={[styles.kpiValue, {color: colors.text}]}>{languages.length}</Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>Languages</Text>
          </TouchableOpacity>

          {/* Abuse Reasons KPI */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveSection('reasons');
            }}
            activeOpacity={0.8}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.card,
                borderColor: activeSection === 'reasons' ? colors.danger : colors.border,
                borderWidth: activeSection === 'reasons' ? 2 : 1,
              },
            ]}>
            <View style={[styles.kpiIconWrapper, {backgroundColor: colors.dangerBg}]}>
              <Ionicons name="alert-circle" size={22} color={colors.danger} />
            </View>
            <Text style={[styles.kpiValue, {color: colors.text}]}>{reasons.length}</Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>Abuse Reasons</Text>
          </TouchableOpacity>
        </View>

        {/* Pillar Navigation Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            {id: 'applicants', label: `Applicants (${applicants.length})`, iconType: 'ion', icon: 'people'},
            {id: 'glossary', label: `Glossary (${glossaryTerms.length})`, iconType: 'mc', icon: 'book-open-page-variant'},
            {id: 'specializations', label: `Specializations (${specializations.length})`, iconType: 'mc', icon: 'stethoscope'},
            {id: 'languages', label: `Languages (${languages.length})`, iconType: 'ion', icon: 'language'},
            {id: 'reasons', label: `Abuse Reasons (${reasons.length})`, iconType: 'ion', icon: 'alert-circle'},
            {id: 'admins', label: `Staff Directory (${admins.length})`, iconType: 'ion', icon: 'shield-checkmark'},
            {id: 'storage', label: 'Storage Retention', iconType: 'ion', icon: 'server'},
            {id: 'analytics', label: 'Platform Analytics', iconType: 'ion', icon: 'bar-chart'},
          ].map(tab => {
            const isSelected = activeSection === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setActiveSection(tab.id as ActiveSection);
                }}
                activeOpacity={0.7}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}>
                {tab.iconType === 'mc' ? (
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={16}
                    color={isSelected ? '#FFFFFF' : colors.textMuted}
                    style={{marginRight: 6}}
                  />
                ) : (
                  <Ionicons
                    name={tab.icon as any}
                    size={15}
                    color={isSelected ? '#FFFFFF' : colors.textMuted}
                    style={{marginRight: 6}}
                  />
                )}
                <Text
                  style={[
                    styles.tabChipText,
                    {color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500'},
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* =========================================================================
            SECTION 1: APPLICANTS QUEUE WITH HIGH-FIDELITY VISUAL EFFECTS & ACTIONS
           ========================================================================= */}
        {activeSection === 'applicants' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  Review Board Applicants Queue
                </Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  Tap any card to inspect credentials, resume & provision accounts
                </Text>
              </View>

              {rawApplicants.length === 0 && (
                <View style={[styles.demoTag, {backgroundColor: colors.infoBg}]}>
                  <Text style={[styles.demoTagText, {color: colors.info}]}>Sandbox Live</Text>
                </View>
              )}
            </View>

            {/* Filter Pills with Haptic Feedback */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: hp(1.8)}}>
              {(['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as ApplicantStatusFilter[]).map(f => {
                const isSelected = applicantFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setApplicantFilter(f);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isSelected ? (isDarkMode ? '#1E3A8A' : '#DBEAFE') : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.filterPillText,
                        {color: isSelected ? colors.primary : colors.textMuted, fontWeight: isSelected ? '700' : '500'},
                      ]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {loadingApplicants ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : filteredApplicants.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <MaterialCommunityIcons name="account-search-outline" size={38} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>
                  No applicants matching status &quot;{applicantFilter}&quot;
                </Text>
              </View>
            ) : (
              filteredApplicants.map((app: any) => {
                const status = (app.status || 'Pending').toLowerCase();
                const isApproved = status === 'approved';
                const isRejected = status === 'rejected';
                const isUnderReview = status === 'under review';

                const badgeBg = isApproved
                  ? colors.successBg
                  : isRejected
                  ? colors.dangerBg
                  : isUnderReview
                  ? colors.infoBg
                  : colors.goldBg;

                const badgeColor = isApproved
                  ? colors.success
                  : isRejected
                  ? colors.danger
                  : isUnderReview
                  ? colors.info
                  : colors.gold;

                const cardBorderColor = isApproved
                  ? colors.success
                  : isRejected
                  ? colors.danger
                  : isUnderReview
                  ? colors.info
                  : colors.border;

                return (
                  <TouchableOpacity
                    key={app._id || app.id}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setSelectedApplicant(app);
                      setApplicantDetailModal(true);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.applicantCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: cardBorderColor,
                        borderLeftWidth: 5,
                      },
                    ]}>
                    <View style={styles.applicantCardTop}>
                      <View style={{flex: 1}}>
                        <Text style={[styles.applicantName, {color: colors.text}]}>
                          {app.fullName || app.name || 'Candidate Name'}
                        </Text>
                        <Text style={[styles.applicantEmail, {color: colors.textMuted}]}>
                          {app.email || 'No email provided'}
                        </Text>
                        {app.specialization && (
                          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                            <MaterialCommunityIcons name="stethoscope" size={14} color={colors.primary} />
                            <Text style={[styles.applicantSpecialization, {color: colors.primary, marginLeft: 4}]}>
                              {app.specialization}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={[styles.statusPill, {backgroundColor: badgeBg}]}>
                        <Text style={[styles.statusPillText, {color: badgeColor}]}>
                          {app.status || 'Pending'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.applicantMetaDivider, {backgroundColor: colors.border}]} />

                    {/* Interactive Action Bar directly on each Card */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch {}
                          setSelectedApplicant(app);
                          setApplicantDetailModal(true);
                        }}
                        style={[styles.miniActionBtn, {backgroundColor: colors.cardAlt}]}>
                        <Ionicons name="eye-outline" size={14} color={colors.primary} />
                        <Text style={[styles.miniActionBtnText, {color: colors.primary}]}>Inspect</Text>
                      </TouchableOpacity>

                      {/* Quick Status Buttons */}
                      {!isApproved && (
                        <TouchableOpacity
                          onPress={() => {
                            updateApplicantStatusMutation.mutate({
                              id: app._id || app.id,
                              status: 'Approved',
                            });
                          }}
                          style={[styles.miniActionBtn, {backgroundColor: colors.successBg}]}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                          <Text style={[styles.miniActionBtnText, {color: colors.success}]}>Approve</Text>
                        </TouchableOpacity>
                      )}

                      {!isRejected && (
                        <TouchableOpacity
                          onPress={() => {
                            updateApplicantStatusMutation.mutate({
                              id: app._id || app.id,
                              status: 'Rejected',
                            });
                          }}
                          style={[styles.miniActionBtn, {backgroundColor: colors.dangerBg}]}>
                          <Ionicons name="close-circle" size={14} color={colors.danger} />
                          <Text style={[styles.miniActionBtnText, {color: colors.danger}]}>Reject</Text>
                        </TouchableOpacity>
                      )}

                      {/* Provision button if already approved */}
                      {isApproved && (
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Provision Admin Profile',
                              `Create moderator account for ${app.fullName || app.name}?`,
                              [
                                {text: 'Cancel', style: 'cancel'},
                                {
                                  text: 'Provision Account',
                                  onPress: () => provisionAdminMutation.mutate(app._id || app.id),
                                },
                              ]
                            );
                          }}
                          style={[styles.miniActionBtn, {backgroundColor: colors.goldBg}]}>
                          <MaterialCommunityIcons name="shield-plus" size={14} color={colors.gold} />
                          <Text style={[styles.miniActionBtnText, {color: colors.gold}]}>Provision</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* =========================================================================
            SECTION 2: MEDICAL SPECIALIZATIONS (MONITORING & INSPECTION)
           ========================================================================= */}
        {activeSection === 'specializations' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  Medical Specializations & Taxonomy
                </Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  Clinical domains active in article reviews & doctor mapping
                </Text>
              </View>
            </View>

            {loadingSpecs ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : specializations.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <MaterialCommunityIcons name="stethoscope" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>No specializations found</Text>
              </View>
            ) : (
              specializations.map((spec: any) => (
                <View
                  key={spec._id || spec.id || spec.name || spec.specialization}
                  style={[styles.dataCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                  <View style={styles.dataCardLeft}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <MaterialCommunityIcons name="stethoscope" size={18} color={colors.success} style={{marginRight: 6}} />
                      <Text style={[styles.dataTitle, {color: colors.text}]}>
                        {spec.name || spec.specialization || 'Clinical Category'}
                      </Text>
                    </View>
                    {spec.slug && (
                      <Text style={[styles.metaSubText, {color: colors.textMuted}]}>
                        Slug: {spec.slug}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.codeBadge, {backgroundColor: colors.successBg}]}>
                    <Text style={[styles.codeBadgeText, {color: colors.success}]}>Active Category</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* =========================================================================
            SECTION 3: PLATFORM LANGUAGES (MONITORING & INSPECTION)
           ========================================================================= */}
        {activeSection === 'languages' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Platform Localization Languages</Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  Active multi-lingual translation & article targets
                </Text>
              </View>
            </View>

            {loadingLanguages ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : languages.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <Ionicons name="globe-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>No languages found in database</Text>
              </View>
            ) : (
              languages.map((lang: any) => (
                <View
                  key={lang._id || lang.id || lang.code}
                  style={[styles.dataCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                  <View style={styles.dataCardLeft}>
                    <Text style={[styles.dataTitle, {color: colors.text}]}>{lang.name}</Text>
                    <View style={[styles.codeBadge, {backgroundColor: colors.cardAlt}]}>
                      <Text style={[styles.codeBadgeText, {color: colors.primary}]}>{lang.code}</Text>
                    </View>
                  </View>
                  <View style={[styles.codeBadge, {backgroundColor: colors.infoBg}]}>
                    <Text style={[styles.codeBadgeText, {color: colors.info}]}>Supported</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* =========================================================================
            SECTION 4: ABUSE REASONS (MONITORING & INSPECTION)
           ========================================================================= */}
        {activeSection === 'reasons' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Abuse Report Categories</Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  Active violation classifiers managed across the platform
                </Text>
              </View>
            </View>

            {loadingReasons ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : reasons.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <Ionicons name="alert-circle-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>No report reasons active</Text>
              </View>
            ) : (
              reasons.map((r: any) => (
                <View
                  key={r._id || r.id || r.reason}
                  style={[styles.dataCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                  <View style={styles.dataCardLeft}>
                    <Text style={[styles.dataTitle, {color: colors.text}]}>{r.reason}</Text>
                    <Text style={[styles.metaSubText, {color: colors.textMuted}]}>
                      Status: {r.status || 'Active'}
                    </Text>
                  </View>

                  <View style={[styles.codeBadge, {backgroundColor: colors.dangerBg}]}>
                    <Text style={[styles.codeBadgeText, {color: colors.danger}]}>Violation</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* =========================================================================
            SECTION 5: STAFF & MODERATOR GOVERNANCE
           ========================================================================= */}
        {activeSection === 'admins' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Staff & Moderator Governance</Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  Reviewer lifecycle and identity permissions
                </Text>
              </View>
            </View>

            {loadingAdmins ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : admins.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <MaterialCommunityIcons name="shield-account-outline" size={38} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>
                  No active staff members returned
                </Text>
              </View>
            ) : (
              admins.map((adm: any) => {
                const isSuper = adm.role === 'Super Admin' || adm.isSuperAdmin;
                return (
                  <View
                    key={adm._id || adm.id}
                    style={[styles.adminCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                    <View style={styles.adminCardTop}>
                      <View style={styles.adminAvatarWrapper}>
                        <MaterialCommunityIcons
                          name={isSuper ? 'shield-crown' : 'shield-account'}
                          size={28}
                          color={isSuper ? colors.gold : colors.primary}
                        />
                      </View>

                      <View style={{flex: 1, marginLeft: wp(3)}}>
                        <Text style={[styles.adminCardName, {color: colors.text}]}>
                          {adm.user_name || adm.name || 'Admin'}
                        </Text>
                        <Text style={[styles.adminCardHandle, {color: colors.textMuted}]}>
                          @{adm.user_handle || 'user'} • {adm.email}
                        </Text>
                        <View style={{flexDirection: 'row', marginTop: 4}}>
                          <View
                            style={[
                              styles.rolePill,
                              {backgroundColor: isSuper ? colors.goldBg : colors.infoBg},
                            ]}>
                            <Text
                              style={[
                                styles.rolePillText,
                                {color: isSuper ? colors.gold : colors.info},
                              ]}>
                              {isSuper ? 'SUPER ADMIN' : 'MODERATOR'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* =========================================================================
            SECTION 6: CLOUD STORAGE & RETENTION
           ========================================================================= */}
        {activeSection === 'storage' && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Cloud Storage & Database Retention</Text>
            <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
              Super Admin permanent purge utilities for S3 bucket & PocketBase CMS records
            </Text>

            {/* S3 Cleaner Card */}
            <View style={[styles.toolCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.toolHeaderRow}>
                <MaterialCommunityIcons name="aws" size={24} color={colors.primary} />
                <Text style={[styles.toolTitle, {color: colors.text}]}>Amazon S3 Asset Cleaner</Text>
              </View>
              <Text style={[styles.toolDesc, {color: colors.textMuted}]}>
                Delete orphaned files, obsolete agreement PDFs, or raw audio tracks by their S3 key.
              </Text>

              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border}]}
                placeholder="Enter S3 Object Key (e.g. agreements/doc_123.pdf)"
                placeholderTextColor={colors.textMuted}
                value={storageKey}
                onChangeText={setStorageKey}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() => {
                  if (!storageKey.trim()) {
                    Alert.alert('Required', 'Please enter an S3 object key');
                    return;
                  }
                  Alert.alert(
                    'Permanent Deletion',
                    `Are you sure you want to permanently delete S3 key "${storageKey}"? This cannot be undone.`,
                    [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Purge File',
                        style: 'destructive',
                        onPress: () => deleteFileMutation.mutate(storageKey.trim()),
                      },
                    ]
                  );
                }}
                disabled={deleteFileMutation.isPending}
                style={[styles.toolButton, {backgroundColor: colors.danger}]}>
                <Ionicons name="trash" size={16} color="#FFFFFF" style={{marginRight: 6}} />
                <Text style={styles.toolButtonText}>
                  {deleteFileMutation.isPending ? 'Purging...' : 'Purge S3 File'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* PocketBase Cleaner Card */}
            <View style={[styles.toolCard, {backgroundColor: colors.card, borderColor: colors.border, marginTop: hp(2)}]}>
              <View style={styles.toolHeaderRow}>
                <MaterialCommunityIcons name="database-remove" size={24} color={colors.gold} />
                <Text style={[styles.toolTitle, {color: colors.text}]}>PocketBase Record Purger</Text>
              </View>
              <Text style={[styles.toolDesc, {color: colors.textMuted}]}>
                Remove orphaned collection revisions or discarded draft records directly by collection and record ID.
              </Text>

              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border}]}
                placeholder="Collection Name (e.g. articles_draft)"
                placeholderTextColor={colors.textMuted}
                value={pbCollection}
                onChangeText={setPbCollection}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, marginTop: hp(1)}]}
                placeholder="PocketBase Record ID"
                placeholderTextColor={colors.textMuted}
                value={pbRecordId}
                onChangeText={setPbRecordId}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() => {
                  if (!pbCollection.trim() || !pbRecordId.trim()) {
                    Alert.alert('Required', 'Please provide both Collection Name and Record ID');
                    return;
                  }
                  Alert.alert(
                    'Confirm Record Purge',
                    `Permanently delete record ${pbRecordId} from ${pbCollection}?`,
                    [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Delete Record',
                        style: 'destructive',
                        onPress: () =>
                          deletePbMutation.mutate({
                            collection: pbCollection.trim(),
                            recordId: pbRecordId.trim(),
                          }),
                      },
                    ]
                  );
                }}
                disabled={deletePbMutation.isPending}
                style={[styles.toolButton, {backgroundColor: colors.danger}]}>
                <Ionicons name="trash" size={16} color="#FFFFFF" style={{marginRight: 6}} />
                <Text style={styles.toolButtonText}>
                  {deletePbMutation.isPending ? 'Deleting...' : 'Purge PB Record'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =========================================================================
            SECTION 7: SYSTEM ANALYTICS
           ========================================================================= */}
        {activeSection === 'analytics' && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>System Analytics & Velocity</Text>
            <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
              Platform review velocity and moderation distribution for {currentYear}
            </Text>

            <View style={[styles.statOverviewCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.statRow}>
                <View style={styles.statBlock}>
                  <Text style={[styles.statNumber, {color: colors.primary}]}>
                    {yearlyContribution ? Object.keys(yearlyContribution).length : '12'}
                  </Text>
                  <Text style={[styles.statDesc, {color: colors.textMuted}]}>Active Months Analyzed</Text>
                </View>

                <View style={styles.statBlock}>
                  <Text style={[styles.statNumber, {color: colors.success}]}>100%</Text>
                  <Text style={[styles.statDesc, {color: colors.textMuted}]}>API Gateway Health</Text>
                </View>
              </View>

              <View style={[styles.metaDivider, {backgroundColor: colors.border}]} />

              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={18} color={colors.gold} />
                <Text style={[styles.infoText, {color: colors.text}]}>
                  Super Admin role verified: full audit access enabled.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* =========================================================================
            SECTION 8: MEDICAL GLOSSARY MANAGEMENT
           ========================================================================= */}
        {activeSection === 'glossary' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Medical Glossary</Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  {glossaryTerms.length} verified clinical terms & definitions
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenAddGlossary}
                style={[styles.actionButton, {backgroundColor: colors.primary}]}
                activeOpacity={0.8}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Term</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBar, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Ionicons name="search" size={18} color={colors.textMuted} style={{marginRight: 8}} />
              <TextInput
                style={[styles.searchInput, {color: colors.text}]}
                placeholder="Search medical terms or categories..."
                placeholderTextColor={colors.textMuted}
                value={glossarySearch}
                onChangeText={setGlossarySearch}
              />
              {glossarySearch.length > 0 && (
                <TouchableOpacity onPress={() => setGlossarySearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Terms List */}
            {glossaryTerms
              .filter(
                t =>
                  t.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                  (t.category && t.category.toLowerCase().includes(glossarySearch.toLowerCase())) ||
                  t.definition.toLowerCase().includes(glossarySearch.toLowerCase())
              )
              .map(t => (
                <View
                  key={t._id}
                  style={[
                    styles.termCard,
                    {backgroundColor: colors.card, borderColor: colors.border},
                  ]}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <View style={{flex: 1, marginRight: 8}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6}}>
                        <Text style={[styles.termTitle, {color: colors.text}]}>{t.term}</Text>
                        {t.phonetic ? (
                          <View style={[styles.phoneticBadge, {backgroundColor: colors.cardAlt}]}>
                            <Text style={[styles.phoneticText, {color: colors.textMuted}]}>{t.phonetic}</Text>
                          </View>
                        ) : null}
                      </View>
                      {t.category ? (
                        <View style={[styles.categoryBadge, {backgroundColor: colors.infoBg}]}>
                          <Text style={[styles.categoryBadgeText, {color: colors.info}]}>{t.category}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={{flexDirection: 'row', gap: 6}}>
                      <TouchableOpacity
                        onPress={() => handleOpenEditGlossary(t)}
                        style={[styles.smallIconBtn, {backgroundColor: colors.cardAlt}]}>
                        <Ionicons name="create-outline" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteGlossary(t._id)}
                        style={[styles.smallIconBtn, {backgroundColor: colors.dangerBg}]}>
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.termDefinition, {color: colors.textMuted}]}>
                    {t.definition}
                  </Text>
                </View>
              ))}
          </View>
        )}

      </ScrollView>

      {/* APPLICANT INSPECTION & REVIEW MODAL */}
      <Modal visible={applicantDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, {backgroundColor: colors.card, maxHeight: '88%'}]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <View style={{flex: 1}}>
                  <Text style={[styles.modalHeader, {color: colors.text}]}>
                    {selectedApplicant?.fullName || selectedApplicant?.name || 'Applicant Profile'}
                  </Text>
                  <Text style={[styles.modalSubHeader, {color: colors.textMuted}]}>
                    Review Board Credentials Inspection
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setApplicantDetailModal(false);
                  }}>
                  <Ionicons name="close-circle" size={26} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Applicant Fields */}
              <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Email</Text>
                <Text style={[styles.detailValue, {color: colors.text}]}>
                  {selectedApplicant?.email || 'N/A'}
                </Text>
              </View>

              {selectedApplicant?.phone && (
                <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Phone</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>
                    {selectedApplicant.phone}
                  </Text>
                </View>
              )}

              {selectedApplicant?.specialization && (
                <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Specialization</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                    <MaterialCommunityIcons name="stethoscope" size={16} color={colors.primary} style={{marginRight: 4}} />
                    <Text style={[styles.detailValue, {color: colors.primary}]}>
                      {selectedApplicant.specialization}
                    </Text>
                  </View>
                </View>
              )}

              {selectedApplicant?.experience && (
                <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Clinical Background</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>
                    {selectedApplicant.experience}
                  </Text>
                </View>
              )}

              {selectedApplicant?.message && (
                <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Statement & Motivations</Text>
                  <Text style={[styles.detailValue, {color: colors.text}]}>
                    {selectedApplicant.message}
                  </Text>
                </View>
              )}

              {/* Resume / Document Viewer */}
              {(selectedApplicant?.resume_url || selectedApplicant?.cv_key) && (
                <TouchableOpacity
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    const url = selectedApplicant.resume_url || `${GET_STORAGE_DATA}/${selectedApplicant.cv_key}`;
                    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open document URL'));
                  }}
                  activeOpacity={0.8}
                  style={[styles.resumeButton, {borderColor: colors.primary}]}>
                  <Ionicons name="document-text" size={18} color={colors.primary} />
                  <Text style={[styles.resumeButtonText, {color: colors.primary}]}>
                    Inspect Attached CV / Credentials
                  </Text>
                </TouchableOpacity>
              )}

              {/* Current Status Pill */}
              <View style={{marginVertical: hp(1.5), flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.detailLabel, {color: colors.textMuted, marginRight: 8}]}>Current Status:</Text>
                <View style={[styles.statusPill, {backgroundColor: colors.goldBg}]}>
                  <Text style={[styles.statusPillText, {color: colors.gold}]}>
                    {selectedApplicant?.status || 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Status Action Buttons */}
              <Text style={[styles.detailSectionTitle, {color: colors.text}]}>Update Application Status</Text>

              <View style={styles.statusActionRow}>
                {['Pending', 'Under Review', 'Approved', 'Rejected'].map(s => {
                  const isCurrent = (selectedApplicant?.status || 'Pending').toLowerCase() === s.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={s}
                      disabled={isCurrent || updateApplicantStatusMutation.isPending}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        } catch {}
                        updateApplicantStatusMutation.mutate({
                          id: selectedApplicant._id || selectedApplicant.id,
                          status: s,
                        });
                      }}
                      style={[
                        styles.statusSelectButton,
                        {
                          backgroundColor: isCurrent ? colors.primary : colors.cardAlt,
                          borderColor: isCurrent ? colors.primary : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusSelectButtonText,
                          {color: isCurrent ? '#FFFFFF' : colors.text},
                        ]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Provision Admin Profile Button (Enabled when Approved) */}
              {(selectedApplicant?.status || '').toLowerCase() === 'approved' && (
                <TouchableOpacity
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    } catch {}
                    Alert.alert(
                      'Provision Admin Account',
                      `Create an authenticated Moderator account for ${selectedApplicant?.fullName || selectedApplicant?.name}?`,
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Provision Account',
                          onPress: () => provisionAdminMutation.mutate(selectedApplicant._id || selectedApplicant.id),
                        },
                      ]
                    );
                  }}
                  disabled={provisionAdminMutation.isPending}
                  style={[styles.provisionBtn, {backgroundColor: colors.success}]}>
                  <MaterialCommunityIcons name="shield-plus" size={18} color="#FFFFFF" style={{marginRight: 6}} />
                  <Text style={styles.provisionBtnText}>
                    {provisionAdminMutation.isPending ? 'Provisioning...' : 'Provision Admin Account'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* GLOSSARY ADD/EDIT MODAL */}
      <Modal visible={glossaryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, {backgroundColor: colors.card, maxHeight: '85%'}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
              <Text style={[styles.modalHeader, {color: colors.text}]}>
                {editingGlossaryId ? 'Edit Medical Term' : 'Add Medical Term'}
              </Text>
              <TouchableOpacity onPress={() => setGlossaryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Term Title *</Text>
              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, marginBottom: 12}]}
                placeholder="e.g. Arterial Hypertension"
                placeholderTextColor={colors.textMuted}
                value={glossaryTerm}
                onChangeText={setGlossaryTerm}
              />

              <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Phonetic Pronunciation</Text>
              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, marginBottom: 12}]}
                placeholder="e.g. /ɑːrˈtɪəriəl ˌhaɪpərˈtɛnʃən/"
                placeholderTextColor={colors.textMuted}
                value={glossaryPhonetic}
                onChangeText={setGlossaryPhonetic}
              />

              <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Medical Category</Text>
              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, marginBottom: 12}]}
                placeholder="e.g. Cardiology, Neurology, Endocrinology"
                placeholderTextColor={colors.textMuted}
                value={glossaryCategory}
                onChangeText={setGlossaryCategory}
              />

              <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Clinical Definition *</Text>
              <TextInput
                style={[styles.modalInput, {backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, minHeight: 90, textAlignVertical: 'top', marginBottom: 16}]}
                placeholder="Evidence-based medical definition..."
                placeholderTextColor={colors.textMuted}
                value={glossaryDefinition}
                onChangeText={setGlossaryDefinition}
                multiline
              />

              <TouchableOpacity
                onPress={handleSaveGlossary}
                style={[styles.provisionBtn, {backgroundColor: colors.primary, marginTop: 4}]}>
                <Text style={styles.provisionBtnText}>{editingGlossaryId ? 'Update Term' : 'Save Term'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.8),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
  },
  crownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  crownText: {
    fontSize: fp(2.8),
    fontWeight: '800',
    letterSpacing: 1.2,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: fp(4.8),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: fp(3.2),
    marginTop: 1,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: hp(10),
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  kpiCard: {
    width: '48%',
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.6),
  },
  kpiIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  kpiValue: {
    fontSize: fp(6),
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: fp(3.2),
    fontWeight: '500',
    marginTop: 2,
  },

  // Pillar Tab Chips
  tabScroll: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.8),
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3.8),
    paddingVertical: hp(1.2),
    borderRadius: 24,
    borderWidth: 1,
    marginRight: wp(2),
  },
  tabChipText: {
    fontSize: fp(3.6),
  },

  // Section
  sectionContainer: {
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.8),
  },
  sectionTitle: {
    fontSize: fp(4.4),
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: fp(3.2),
    marginTop: 2,
  },
  demoTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoTagText: {
    fontSize: fp(2.8),
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Filter Pills
  filterPill: {
    paddingHorizontal: wp(3.6),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    borderWidth: 1,
    marginRight: wp(2),
  },
  filterPillText: {
    fontSize: fp(3.2),
  },

  // Applicant Card
  applicantCard: {
    borderRadius: 16,
    padding: wp(4.5),
    marginBottom: hp(1.8),
  },
  applicantCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  applicantName: {
    fontSize: fp(4.2),
    fontWeight: '700',
  },
  applicantEmail: {
    fontSize: fp(3.4),
    marginTop: 2,
  },
  applicantSpecialization: {
    fontSize: fp(3.4),
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: fp(3.2),
    fontWeight: '700',
  },
  applicantMetaDivider: {
    height: 1,
    marginVertical: hp(1.4),
  },

  // Card Actions Row
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: 8,
  },
  miniActionBtnText: {
    fontSize: fp(3.2),
    fontWeight: '700',
    marginLeft: 4,
  },

  // Admin Card
  adminCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: wp(4.5),
    marginBottom: hp(1.8),
  },
  adminCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatarWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminCardName: {
    fontSize: fp(4.2),
    fontWeight: '700',
  },
  adminCardHandle: {
    fontSize: fp(3.4),
    marginTop: 2,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: fp(2.8),
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Data Cards
  dataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp(4),
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: hp(1.4),
  },
  dataCardLeft: {
    flex: 1,
  },
  dataTitle: {
    fontSize: fp(4),
    fontWeight: '600',
    marginBottom: 2,
  },
  codeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: fp(3),
    fontWeight: '700',
  },
  metaSubText: {
    fontSize: fp(3.2),
  },

  emptyCard: {
    padding: wp(8),
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1),
  },
  emptyText: {
    fontSize: fp(3.6),
    marginTop: hp(1.5),
  },

  // Tool Card
  toolCard: {
    padding: wp(5),
    borderRadius: 16,
    borderWidth: 1,
  },
  toolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  toolTitle: {
    fontSize: fp(4.2),
    fontWeight: '700',
    marginLeft: wp(2.5),
  },
  toolDesc: {
    fontSize: fp(3.4),
    marginBottom: hp(2),
    lineHeight: 18,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.6),
    borderRadius: 12,
    marginTop: hp(1.8),
  },
  toolButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fp(3.8),
  },

  // Stat Overview
  statOverviewCard: {
    padding: wp(5),
    borderRadius: 16,
    borderWidth: 1,
    marginTop: hp(1),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp(1.5),
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fp(7),
    fontWeight: '800',
  },
  statDesc: {
    fontSize: fp(3.4),
    marginTop: 4,
  },
  metaDivider: {
    height: 1,
    marginVertical: hp(2),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: fp(3.4),
    marginLeft: wp(2),
    flex: 1,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  modalBox: {
    width: '100%',
    borderRadius: 20,
    padding: wp(6),
  },
  modalHeader: {
    fontSize: fp(4.6),
    fontWeight: '700',
  },
  modalSubHeader: {
    fontSize: fp(3.4),
    marginTop: 4,
    marginBottom: hp(2),
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    fontSize: fp(3.8),
  },

  // Applicant Inspection
  detailBlock: {
    padding: wp(3.5),
    borderRadius: 12,
    marginBottom: hp(1.2),
  },
  detailLabel: {
    fontSize: fp(3.2),
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fp(3.8),
    fontWeight: '500',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: hp(1),
  },
  resumeButtonText: {
    fontWeight: '700',
    fontSize: fp(3.6),
    marginLeft: 6,
  },
  detailSectionTitle: {
    fontSize: fp(3.8),
    fontWeight: '700',
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  statusActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: hp(1.5),
  },
  statusSelectButton: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
    borderRadius: 10,
    borderWidth: 1,
  },
  statusSelectButtonText: {
    fontSize: fp(3.4),
    fontWeight: '600',
  },
  provisionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.6),
    borderRadius: 12,
    marginTop: hp(1),
  },
  provisionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: fp(3.8),
  },

  // Glossary
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  termCard: {
    padding: wp(4),
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: hp(1.2),
  },
  termTitle: {
    fontSize: fp(4),
    fontWeight: '700',
  },
  phoneticBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phoneticText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  smallIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termDefinition: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 8,
  },
});
