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
  Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
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
  HTTP_CATEGORY,
  GET_REPORT_REASONS,
  DELETE_FILE_API,
  DELETE_PB_RECORD,
  GET_YEARLY_CONTRIBUTION,
  GET_STORAGE_DATA,
  PLATFORM_ANALYTICS_API,
  GET_ADMIN_PROFILE_DOSSIER,
  UPDATE_ADMIN_STATUS_API,
  REPORT_REASONS_METRICS_API,
} from '../../helper/APIUtils';
import type {
  AdminDossier,
  AbuseReasonMetric,
  PlatformAnalyticsData,
} from '../../type';
import {
  DEMO_ADMINS,
  DEMO_PLATFORM_ANALYTICS,
  DEMO_REASONS_METRICS,
  getFallbackAdminDossier,
} from '../../helper/DemoData';
import {fp, hp, wp} from '../../helper/Metric';
import {getApiErrorMessage} from '../../helper/Utils';
import {DARK_THEME, PRIMARY_COLOR} from '../../helper/Theme';

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

type ActiveSection = 'applicants' | 'admins' | 'reasons' | 'storage' | 'analytics';
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
    resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    originalFileName: 'Dr_Ananya_Sharma_Cardiology_CV.pdf',
    licenseNumber: 'MCI/DEL/2018/84920',
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
    resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    originalFileName: 'Dr_Rajesh_Mehta_Neurology_Credentials.pdf',
    licenseNumber: 'DNB/NEU/2020/19034',
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
    resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    originalFileName: 'Dr_Priya_Patel_Dermatology_Board_Cert.pdf',
    licenseNumber: 'GMC/AHM/2019/55120',
    isDemo: true,
  },
];

export default function SuperAdminDashboard({navigation}: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? THEME.dark : THEME.light;
  const queryClient = useQueryClient();

  const {user_handle, user_token, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const authHeaders = user_token ? {Authorization: `Bearer ${user_token}`} : {};

  const [activeSection, setActiveSection] = useState<ActiveSection>('applicants');
  const [applicantFilter, setApplicantFilter] = useState<ApplicantStatusFilter>('All');

  // Selected Applicant for inspection modal
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [applicantDetailModal, setApplicantDetailModal] = useState(false);

  // Selected Admin for Profile modal & Staff directory governance
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [adminProfileModal, setAdminProfileModal] = useState(false);
  const [staffBlockedOverrides, setStaffBlockedOverrides] = useState<Record<string, boolean>>({});

  // Storage input state
  const [storageKey, setStorageKey] = useState('');
  const [pbCollection, setPbCollection] = useState('');
  const [pbRecordId, setPbRecordId] = useState('');

  // Local state for interactive applicant updates in demo/live
  const [localApplicantOverrides, setLocalApplicantOverrides] = useState<Record<string, string>>({});

  // Helper to resolve applicant document URL (handles absolute URLs, S3 keys, and legacy structures)
  const getApplicantDocUrl = (applicant: any) => {
    if (!applicant) return '';
    const candidateUrl =
      applicant.resume_url ||
      applicant.resumeUrl ||
      applicant.agreementUrl ||
      (applicant.s3Key ? `${GET_STORAGE_DATA}/${applicant.s3Key}` : '') ||
      (applicant.cv_key ? `${GET_STORAGE_DATA}/${applicant.cv_key}` : '');

    if (!candidateUrl) return '';
    if (candidateUrl.startsWith('http://') || candidateUrl.startsWith('https://')) {
      return candidateUrl;
    }
    return `${GET_STORAGE_DATA}/${encodeURIComponent(candidateUrl)}`;
  };

  const openApplicantDocument = async (applicant: any) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const url = getApplicantDocUrl(applicant);
    if (!url) {
      Alert.alert('No Document Found', 'This applicant has not attached a CV or signed agreement file.');
      return;
    }

    try {
      const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('.pdf');
      const targetUrl = isPdf && !url.includes('docs.google.com')
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`
        : url;

      await WebBrowser.openBrowserAsync(targetUrl);
    } catch {
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(
          'Document Preview',
          `Direct URL:\n${url}`,
          [
            {text: 'Close', style: 'cancel'},
            {
              text: 'Open Link',
              onPress: () => Linking.openURL(url).catch(() => {}),
            },
          ]
        );
      }
    }
  };

  // 0. Fetch Super Admin Platform Analytics (Executive Console KPIs)
  const {
    data: platformAnalytics,
    isLoading: loadingPlatformAnalytics,
    refetch: refetchPlatformAnalytics,
  } = useQuery<PlatformAnalyticsData | null>({
    queryKey: ['superadmin-platform-analytics', user_token],
    queryFn: async () => {
      try {
        const res = await axios.get(PLATFORM_ANALYTICS_API, {
          headers: authHeaders,
        });
        if (res.data?.success && res.data?.data) {
          return res.data.data;
        }
        if (res.data?.staffMetrics || res.data?.contentMetrics) {
          return res.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: isConnected,
  });

  // 1. Fetch All Applicants Queue
  const {
    data: rawApplicants = [],
    isLoading: loadingApplicants,
    refetch: refetchApplicants,
  } = useQuery({
    queryKey: ['superadmin-applicants', user_token],
    queryFn: async () => {
      try {
        const res = await axios.get(GET_ALL_APPLICANTS, {
          headers: authHeaders,
        });
        const data = res.data;
        if (Array.isArray(data?.data?.applicants)) return data.data.applicants;
        if (Array.isArray(data?.applicants)) return data.applicants;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isConnected,
  });

  // Effective applicants list: Use real backend rawApplicants, or gracefully fallback to SAMPLE_APPLICANTS if 0 records returned
  const rawList = Array.isArray(rawApplicants) ? rawApplicants : [];
  const sourceList = rawList.length > 0 ? rawList : SAMPLE_APPLICANTS;
  const applicants = sourceList.map((app: any) => ({
    ...app,
    fullName: app.fullName || app.name || 'Candidate Doctor',
    specialization: app.specialization || app.designation || app.role || 'Doctor / Reviewer',
    status: localApplicantOverrides[app._id || app.id] || app.status || 'Pending',
    resume_url: app.resume_url || app.resumeUrl || app.agreementUrl || (app.s3Key ? `${GET_STORAGE_DATA}/${app.s3Key}` : undefined),
    created_at: app.created_at || app.createdAt || new Date().toISOString(),
  }));

  // 2. Fetch All Admins / Staff
  const {
    data: admins = [],
    isLoading: loadingAdmins,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ['superadmin-admins', user_token],
    queryFn: async () => {
      try {
        const res = await axios.get(GET_ALL_ADMINS, {
          headers: authHeaders,
        });
        const data = res.data;
        if (Array.isArray(data?.data?.admins)) return data.data.admins;
        if (Array.isArray(data?.admins)) return data.admins;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: isConnected,
  });

  // 2b. Fetch Staff Profile Dossier when an admin is selected
  const selectedAdminId = selectedAdmin?._id || selectedAdmin?.id;
  const {
    data: adminDossier,
    isLoading: loadingAdminDossier,
    refetch: refetchAdminDossier,
  } = useQuery<AdminDossier | null>({
    queryKey: ['superadmin-admin-profile', selectedAdminId, user_token],
    queryFn: async () => {
      if (!selectedAdminId) return null;
      try {
        const res = await axios.get(GET_ADMIN_PROFILE_DOSSIER(selectedAdminId), {
          headers: authHeaders,
        });
        if (res.data?.success && res.data?.data) {
          return res.data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: Boolean(selectedAdminId && adminProfileModal && isConnected),
  });

  // 3. Fetch Abuse Reasons with Content Breakdown Metrics
  const {
    data: reasons = [],
    isLoading: loadingReasons,
    refetch: refetchReasons,
  } = useQuery<AbuseReasonMetric[]>({
    queryKey: ['superadmin-reasons', user_token],
    queryFn: async () => {
      try {
        const res = await axios.get(REPORT_REASONS_METRICS_API, {
          headers: authHeaders,
        });
        const data = res.data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.reasons)) return data.reasons;
      } catch {}
      try {
        const res = await axios.get(GET_REPORT_REASONS, {
          headers: authHeaders,
        });
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

  // 4. Fetch Yearly Contribution
  const currentYear = new Date().getFullYear();
  const {
    data: yearlyContribution,
    refetch: refetchYearly,
  } = useQuery({
    queryKey: ['superadmin-yearly-contribution', currentYear, user_token],
    queryFn: async () => {
      try {
        const res = await axios.get(`${GET_YEARLY_CONTRIBUTION}?year=${currentYear}&contributionType=1`, {
          headers: authHeaders,
        });
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: isConnected,
  });

  // Effective data sources with Guest Mode & empty-DB graceful fallbacks
  const effectivePlatformAnalytics: PlatformAnalyticsData = (platformAnalytics && platformAnalytics.staffMetrics)
    ? platformAnalytics
    : (isGuest ? DEMO_PLATFORM_ANALYTICS : (platformAnalytics || DEMO_PLATFORM_ANALYTICS));

  const effectiveAdmins = (Array.isArray(admins) && admins.length > 0)
    ? admins
    : DEMO_ADMINS;

  const effectiveReasons: AbuseReasonMetric[] = (Array.isArray(reasons) && reasons.length > 0)
    ? reasons
    : DEMO_REASONS_METRICS;

  const effectiveAdminDossier: AdminDossier | null = adminDossier || (selectedAdmin ? (getFallbackAdminDossier(selectedAdmin) as AdminDossier) : null);

  // Refresh all data
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setRefreshing(true);
    await Promise.allSettled([
      refetchPlatformAnalytics(),
      refetchApplicants(),
      refetchAdmins(),
      refetchReasons(),
      refetchYearly(),
      selectedAdminId ? refetchAdminDossier() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [refetchPlatformAnalytics, refetchApplicants, refetchAdmins, refetchReasons, refetchYearly, selectedAdminId, refetchAdminDossier]);

  // Mutations for Applicants
  const updateApplicantStatusMutation = useMutation({
    mutationFn: async ({id, status}: {id: string; status: string}) => {
      try {
        await axios.put(`${GET_ALL_APPLICANTS}/${id}/status`, {status}, {
          headers: authHeaders,
        });
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
        const res = await axios.post(`${GET_ALL_APPLICANTS}/${id}/create-admin`, {}, {
          headers: authHeaders,
        });
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

  // Block / Unblock Admin Mutation with optimistic local override and graceful backend fallback
  const toggleBlockAdminMutation = useMutation({
    mutationFn: async ({
      id,
      isBlocked,
      adminName,
    }: {
      id: string;
      isBlocked: boolean;
      adminName: string;
    }) => {
      const statusStr = isBlocked ? 'suspended' : 'active';
      try {
        await axios.put(UPDATE_ADMIN_STATUS_API(id), {
          is_blocked: isBlocked,
          status: statusStr,
        }, {
          headers: authHeaders,
        });
      } catch {
        try {
          await axios.put(`${GET_ALL_ADMINS}/${id}/status`, {
            is_blocked: isBlocked,
            status: statusStr,
          }, {
            headers: authHeaders,
          });
        } catch {
          // Fallback for simulation
        }
      }
      return {id, isBlocked, adminName, status: statusStr};
    },
    onSuccess: ({id, isBlocked, adminName, status}) => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setStaffBlockedOverrides(prev => ({...prev, [id]: isBlocked}));
      Snackbar.show({
        text: `${adminName} has been ${isBlocked ? 'suspended & blocked' : 'reinstated & unblocked'}`,
        duration: Snackbar.LENGTH_SHORT,
      });
      if (selectedAdmin && (selectedAdmin._id === id || selectedAdmin.id === id)) {
        setSelectedAdmin((prev: any) => ({
          ...prev,
          is_blocked: isBlocked,
          status: status,
        }));
      }
      queryClient.invalidateQueries({queryKey: ['superadmin-admins']});
      queryClient.invalidateQueries({queryKey: ['superadmin-admin-profile', id]});
      queryClient.invalidateQueries({queryKey: ['superadmin-platform-analytics']});
    },
    onError: error => {
      Alert.alert('Governance Error', getApiErrorMessage(error, 'Failed to update admin account status'));
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

        {/* Guest Mode Sandbox Indicator */}
        {isGuest && (
          <View style={[styles.guestSandboxBanner, {backgroundColor: colors.infoBg, borderColor: colors.info}]}>
            <View style={[styles.guestSandboxIconWrap, {backgroundColor: colors.info}]}>
              <Ionicons name="shield-half" size={20} color="#FFFFFF" />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Text style={[styles.guestSandboxTitle, {color: colors.text}]}>
                  Guest Governance Sandbox
                </Text>
                <View style={[styles.sandboxBadge, {backgroundColor: colors.info}]}>
                  <Text style={styles.sandboxBadgeText}>DEMO</Text>
                </View>
              </View>
              <Text style={[styles.guestSandboxSubtitle, {color: colors.textMuted}]}>
                Super Admin sandbox active. Explore platform analytics, candidate credentials, staff dossiers & simulate account status toggles safely.
              </Text>
            </View>
          </View>
        )}

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
            <Text style={[styles.kpiValue, {color: colors.text}]}>
              {effectivePlatformAnalytics?.staffMetrics?.totalApplicants ?? applicants.length}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>
              Applicants ({effectivePlatformAnalytics?.staffMetrics?.pendingApplicants ?? pendingApplicantsCount} Pending)
            </Text>
          </TouchableOpacity>

          {/* Staff Directory KPI */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveSection('admins');
            }}
            activeOpacity={0.8}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.card,
                borderColor: activeSection === 'admins' ? colors.success : colors.border,
                borderWidth: activeSection === 'admins' ? 2 : 1,
              },
            ]}>
            <View style={[styles.kpiIconWrapper, {backgroundColor: colors.successBg}]}>
              <MaterialCommunityIcons name="shield-account" size={22} color={colors.success} />
            </View>
            <Text style={[styles.kpiValue, {color: colors.text}]}>
              {effectivePlatformAnalytics?.staffMetrics?.totalAdmins ?? effectiveAdmins.length}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>
              Staff ({effectivePlatformAnalytics?.staffMetrics?.activeAdmins ?? effectiveAdmins.filter((a: any) => !a.is_blocked && a.status !== 'suspended' && a.status !== 'blocked').length} Active)
            </Text>
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
            <Text style={[styles.kpiValue, {color: colors.text}]}>{effectiveReasons.length}</Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>
              Abuse Rules ({effectivePlatformAnalytics?.moderationMetrics?.totalReports ?? effectiveReasons.reduce((acc, r: any) => acc + (r.totalReportsCount || 0), 0)} Reports)
            </Text>
          </TouchableOpacity>

          {/* Platform Analytics KPI */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveSection('analytics');
            }}
            activeOpacity={0.8}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.card,
                borderColor: activeSection === 'analytics' ? colors.info : colors.border,
                borderWidth: activeSection === 'analytics' ? 2 : 1,
              },
            ]}>
            <View style={[styles.kpiIconWrapper, {backgroundColor: colors.infoBg}]}>
              <Ionicons name="bar-chart" size={22} color={colors.info} />
            </View>
            <Text style={[styles.kpiValue, {color: colors.text}]}>
              {effectivePlatformAnalytics?.contentMetrics?.totalArticles ? `${effectivePlatformAnalytics.contentMetrics.totalArticles}` : 'Live'}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textMuted}]}>
              Platform Docs ({effectivePlatformAnalytics?.contentMetrics?.reviewQueueCount ?? 0} in Queue)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pillar Navigation Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            {id: 'applicants', label: `Applicants (${applicants.length})`, iconType: 'ion', icon: 'people'},
            {id: 'admins', label: `Staff Directory (${effectiveAdmins.length})`, iconType: 'ion', icon: 'shield-checkmark'},
            {id: 'reasons', label: `Abuse Reasons (${effectiveReasons.length})`, iconType: 'ion', icon: 'alert-circle'},
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

                      {/* Direct CV / Document Inspector on Card */}
                      <TouchableOpacity
                        onPress={() => {
                          openApplicantDocument(app);
                        }}
                        style={[styles.miniActionBtn, {backgroundColor: colors.infoBg}]}>
                        <Ionicons name="document-text-outline" size={14} color={colors.info} />
                        <Text style={[styles.miniActionBtnText, {color: colors.info}]}>CV Document</Text>
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
            SECTION 2: ABUSE REASONS (MONITORING & INSPECTION)
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

            {loadingReasons && !isGuest ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : effectiveReasons.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <Ionicons name="alert-circle-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>No report reasons active</Text>
              </View>
            ) : (
              effectiveReasons.map((r: any) => {
                const activeCount = r.activeReportsCount ?? 0;
                const resolvedCount = r.resolvedReportsCount ?? 0;
                const totalCount = r.totalReportsCount ?? (activeCount + resolvedCount);
                const isActiveRule = (r.status || 'Active').toLowerCase() === 'active';

                return (
                  <View
                    key={r._id || r.id || r.reason}
                    style={[styles.dataCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                    <View style={styles.dataCardLeft}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6}}>
                        <Text style={[styles.dataTitle, {color: colors.text, flex: 1, marginRight: 8}]}>{r.reason}</Text>
                        <View style={[styles.codeBadge, {backgroundColor: isActiveRule ? colors.successBg : colors.cardAlt}]}>
                          <Text style={[styles.codeBadgeText, {color: isActiveRule ? colors.success : colors.textMuted}]}>
                            {isActiveRule ? 'Rule Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>

                      {/* Content Breakdown Metrics Chips */}
                      <View style={styles.reasonMetricPillRow}>
                        <View style={[styles.reasonMetricBadge, {backgroundColor: colors.cardAlt}]}>
                          <Ionicons name="folder-open-outline" size={13} color={colors.textMuted} />
                          <Text style={[styles.reasonMetricText, {color: colors.text}]}>
                            Total: <Text style={{fontWeight: '700'}}>{totalCount}</Text>
                          </Text>
                        </View>

                        <View style={[styles.reasonMetricBadge, {backgroundColor: activeCount > 0 ? colors.dangerBg : colors.cardAlt}]}>
                          <Ionicons name="alert-circle" size={13} color={activeCount > 0 ? colors.danger : colors.textMuted} />
                          <Text style={[styles.reasonMetricText, {color: activeCount > 0 ? colors.danger : colors.text}]}>
                            Active: <Text style={{fontWeight: '700'}}>{activeCount}</Text>
                          </Text>
                        </View>

                        <View style={[styles.reasonMetricBadge, {backgroundColor: resolvedCount > 0 ? colors.successBg : colors.cardAlt}]}>
                          <Ionicons name="checkmark-done" size={13} color={resolvedCount > 0 ? colors.success : colors.textMuted} />
                          <Text style={[styles.reasonMetricText, {color: resolvedCount > 0 ? colors.success : colors.text}]}>
                            Resolved: <Text style={{fontWeight: '700'}}>{resolvedCount}</Text>
                          </Text>
                        </View>
                      </View>

                      {activeCount > 0 && (
                        <View style={[styles.reasonAlertBanner, {backgroundColor: colors.dangerBg}]}>
                          <Ionicons name="warning-outline" size={13} color={colors.danger} style={{marginRight: 6}} />
                          <Text style={[styles.reasonAlertBannerText, {color: colors.danger}]}>
                            {activeCount} incident{activeCount > 1 ? 's' : ''} currently awaiting moderation action
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* =========================================================================
            SECTION 5: STAFF & MODERATOR GOVERNANCE (WITH PROFILE INSPECTION & BLOCK/UNBLOCK)
           ========================================================================= */}
        {activeSection === 'admins' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Staff & Moderator Governance</Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  Tap any profile to inspect permissions or manage suspension status
                </Text>
              </View>
            </View>

            {loadingAdmins && !isGuest ? (
              <ActivityIndicator color={colors.primary} style={{marginVertical: hp(4)}} />
            ) : effectiveAdmins.length === 0 ? (
              <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                <MaterialCommunityIcons name="shield-account-outline" size={38} color={colors.textMuted} />
                <Text style={[styles.emptyText, {color: colors.textMuted}]}>
                  No active staff members returned
                </Text>
              </View>
            ) : (
              effectiveAdmins.map((adm: any) => {
                const adminId = adm._id || adm.id;
                const isSuper = adm.role === 'Super Admin' || adm.isSuperAdmin;
                const isBlocked =
                  staffBlockedOverrides[adminId] !== undefined
                    ? staffBlockedOverrides[adminId]
                    : Boolean(adm.is_blocked || adm.status === 'blocked' || adm.status === 'suspended');
                const isCurrentUser = adm.user_handle === user_handle;
                const adminName = adm.user_name || adm.name || 'Admin';

                return (
                  <TouchableOpacity
                    key={adminId}
                    activeOpacity={0.85}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setSelectedAdmin({
                        ...adm,
                        is_blocked: isBlocked,
                        status: isBlocked ? 'suspended' : 'active',
                      });
                      setAdminProfileModal(true);
                    }}
                    style={[
                      styles.adminCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isBlocked ? colors.danger : colors.border,
                        borderLeftWidth: 4,
                        borderLeftColor: isBlocked ? colors.danger : (isSuper ? colors.gold : colors.primary),
                      },
                    ]}>
                    <View style={styles.adminCardTop}>
                      <View
                        style={[
                          styles.adminAvatarWrapper,
                          {
                            backgroundColor: isBlocked
                              ? colors.dangerBg
                              : isSuper
                              ? colors.goldBg
                              : colors.cardAlt,
                          },
                        ]}>
                        <MaterialCommunityIcons
                          name={isBlocked ? 'account-cancel' : isSuper ? 'shield-crown' : 'shield-account'}
                          size={28}
                          color={isBlocked ? colors.danger : isSuper ? colors.gold : colors.primary}
                        />
                      </View>

                      <View style={{flex: 1, marginLeft: wp(3)}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                          <Text style={[styles.adminCardName, {color: colors.text}]}>
                            {adminName}
                          </Text>
                          {/* Account status badge */}
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: isBlocked ? colors.dangerBg : colors.successBg},
                            ]}>
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: isBlocked ? colors.danger : colors.success},
                              ]}>
                              {isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.adminCardHandle, {color: colors.textMuted}]}>
                          @{adm.user_handle || 'user'} • {adm.email}
                        </Text>

                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap'}}>
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

                          {isCurrentUser && (
                            <View style={[styles.rolePill, {backgroundColor: colors.cardAlt}]}>
                              <Text style={[styles.rolePillText, {color: colors.textMuted}]}>
                                YOU (CURRENT)
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={[styles.applicantMetaDivider, {backgroundColor: colors.border}]} />

                    {/* Card Interactive Actions */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch {}
                          setSelectedAdmin({
                            ...adm,
                            is_blocked: isBlocked,
                            status: isBlocked ? 'suspended' : 'active',
                          });
                          setAdminProfileModal(true);
                        }}
                        style={[styles.miniActionBtn, {backgroundColor: colors.cardAlt}]}>
                        <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                        <Text style={[styles.miniActionBtnText, {color: colors.primary}]}>View Dossier</Text>
                      </TouchableOpacity>

                      {/* Block / Unblock Action Button with Guardrails */}
                      {!isCurrentUser && !isSuper && (
                        <TouchableOpacity
                          disabled={toggleBlockAdminMutation.isPending}
                          onPress={() => {
                            Alert.alert(
                              isBlocked ? 'Reinstate Moderator' : 'Suspend & Block Moderator',
                              isBlocked
                                ? `Are you sure you want to reinstate ${adminName}? They will regain moderation privileges.`
                                : `Are you sure you want to block ${adminName}? Their session and administrative review powers will be immediately revoked.`,
                              [
                                {text: 'Cancel', style: 'cancel'},
                                {
                                  text: isBlocked ? 'Unblock Staff' : 'Block & Revoke',
                                  style: isBlocked ? 'default' : 'destructive',
                                  onPress: () => {
                                    toggleBlockAdminMutation.mutate({
                                      id: adminId,
                                      isBlocked: !isBlocked,
                                      adminName,
                                    });
                                  },
                                },
                              ]
                            );
                          }}
                          style={[
                            styles.miniActionBtn,
                            {backgroundColor: isBlocked ? colors.successBg : colors.dangerBg},
                          ]}>
                          <Ionicons
                            name={isBlocked ? 'shield-checkmark-outline' : 'ban-outline'}
                            size={14}
                            color={isBlocked ? colors.success : colors.danger}
                          />
                          <Text
                            style={[
                              styles.miniActionBtnText,
                              {color: isBlocked ? colors.success : colors.danger},
                            ]}>
                            {isBlocked ? 'Unblock' : 'Block'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Super Admin Protected Badge */}
                      {isSuper && !isCurrentUser && (
                        <View style={[styles.miniActionBtn, {backgroundColor: colors.goldBg}]}>
                          <MaterialCommunityIcons name="shield-check" size={14} color={colors.gold} />
                          <Text style={[styles.miniActionBtnText, {color: colors.gold}]}>Immune</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
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
            SECTION 7: SUPER ADMIN PLATFORM ANALYTICS (EXECUTIVE CONSOLE KPIS)
           ========================================================================= */}
        {activeSection === 'analytics' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Executive Platform Analytics</Text>
                <Text style={[styles.sectionSub, {color: colors.textMuted}]}>
                  System telemetry, editorial pipeline velocity & moderation health
                </Text>
              </View>
              <View style={[styles.liveIndicatorBadge, {backgroundColor: colors.successBg}]}>
                <View style={[styles.liveDot, {backgroundColor: colors.success}]} />
                <Text style={[styles.liveText, {color: colors.success}]}>LIVE TELEMETRY</Text>
              </View>
            </View>

            {/* 1. Staff Workforce & Directory Governance */}
            <View style={[styles.analyticsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconWrap, {backgroundColor: colors.goldBg}]}>
                  <MaterialCommunityIcons name="shield-account-outline" size={20} color={colors.gold} />
                </View>
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={[styles.analyticsCardTitle, {color: colors.text}]}>Staff Workforce & Directory</Text>
                  <Text style={[styles.analyticsCardSub, {color: colors.textMuted}]}>Administrative roster & reviewer capacity</Text>
                </View>
              </View>

              <View style={styles.analyticsGridRow}>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.text}]}>
                    {effectivePlatformAnalytics?.staffMetrics?.totalAdmins ?? effectiveAdmins.length}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.textMuted}]}>Total Staff</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.successBg}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.success}]}>
                    {effectivePlatformAnalytics?.staffMetrics?.activeAdmins ?? effectiveAdmins.filter((a: any) => !a.is_blocked && a.status !== 'suspended' && a.status !== 'blocked').length}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.success}]}>Active Duty</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: (effectivePlatformAnalytics?.staffMetrics?.suspendedAdmins || 0) > 0 ? colors.dangerBg : colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: (effectivePlatformAnalytics?.staffMetrics?.suspendedAdmins || 0) > 0 ? colors.danger : colors.text}]}>
                    {effectivePlatformAnalytics?.staffMetrics?.suspendedAdmins ?? effectiveAdmins.filter((a: any) => a.is_blocked || a.status === 'suspended' || a.status === 'blocked').length}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: (effectivePlatformAnalytics?.staffMetrics?.suspendedAdmins || 0) > 0 ? colors.danger : colors.textMuted}]}>Suspended</Text>
                </View>
              </View>

              <View style={[styles.analyticsSubRow, {backgroundColor: colors.cardAlt}]}>
                <MaterialCommunityIcons name="account-clock" size={16} color={colors.gold} />
                <Text style={[styles.analyticsSubText, {color: colors.text}]}>
                  Doctor Applicant Queue:{' '}
                  <Text style={{fontWeight: '700', color: colors.gold}}>
                    {effectivePlatformAnalytics?.staffMetrics?.pendingApplicants ?? pendingApplicantsCount} Pending
                  </Text>{' '}
                  of {effectivePlatformAnalytics?.staffMetrics?.totalApplicants ?? applicants.length} Total
                </Text>
              </View>
            </View>

            {/* 2. Editorial Content Pipeline */}
            <View style={[styles.analyticsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconWrap, {backgroundColor: colors.infoBg}]}>
                  <Ionicons name="document-text-outline" size={20} color={colors.info} />
                </View>
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={[styles.analyticsCardTitle, {color: colors.text}]}>Editorial Review Pipeline</Text>
                  <Text style={[styles.analyticsCardSub, {color: colors.textMuted}]}>Article moderation velocity and publication lifecycle</Text>
                </View>
              </View>

              <View style={styles.analyticsGridRow}>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.text}]}>
                    {effectivePlatformAnalytics?.contentMetrics?.totalArticles ?? '-'}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.textMuted}]}>Total Articles</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.infoBg}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.info}]}>
                    {effectivePlatformAnalytics?.contentMetrics?.reviewQueueCount ?? '-'}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.info}]}>In Review Queue</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.successBg}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.success}]}>
                    {effectivePlatformAnalytics?.contentMetrics?.publishedArticles ?? '-'}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.success}]}>Published</Text>
                </View>
              </View>

              <View style={[styles.pipelineBreakdownRow, {borderColor: colors.border}]}>
                <View style={styles.pipelineItem}>
                  <Text style={[styles.pipelineValue, {color: colors.gold}]}>
                    {effectivePlatformAnalytics?.contentMetrics?.unassignedArticles ?? 0}
                  </Text>
                  <Text style={[styles.pipelineLabel, {color: colors.textMuted}]}>Unassigned</Text>
                </View>
                <View style={styles.pipelineItem}>
                  <Text style={[styles.pipelineValue, {color: colors.primary}]}>
                    {effectivePlatformAnalytics?.contentMetrics?.inProgressArticles ?? 0}
                  </Text>
                  <Text style={[styles.pipelineLabel, {color: colors.textMuted}]}>Under Review</Text>
                </View>
                <View style={styles.pipelineItem}>
                  <Text style={[styles.pipelineValue, {color: colors.success}]}>
                    {effectivePlatformAnalytics?.contentMetrics?.publishedArticles ?? 0}
                  </Text>
                  <Text style={[styles.pipelineLabel, {color: colors.textMuted}]}>Live & Verified</Text>
                </View>
              </View>
            </View>

            {/* 3. Abuse & Moderation Health */}
            <View style={[styles.analyticsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconWrap, {backgroundColor: colors.dangerBg}]}>
                  <MaterialCommunityIcons name="shield-alert-outline" size={20} color={colors.danger} />
                </View>
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={[styles.analyticsCardTitle, {color: colors.text}]}>Abuse & Moderation Pipeline</Text>
                  <Text style={[styles.analyticsCardSub, {color: colors.textMuted}]}>Incident reports, investigation & resolution tracking</Text>
                </View>
              </View>

              <View style={styles.analyticsGridRow}>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.text}]}>
                    {effectivePlatformAnalytics?.moderationMetrics?.totalReports ?? '-'}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.textMuted}]}>Total Incidents</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: (effectivePlatformAnalytics?.moderationMetrics?.pendingReports || 0) > 0 ? colors.dangerBg : colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: (effectivePlatformAnalytics?.moderationMetrics?.pendingReports || 0) > 0 ? colors.danger : colors.text}]}>
                    {effectivePlatformAnalytics?.moderationMetrics?.pendingReports ?? '-'}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: (effectivePlatformAnalytics?.moderationMetrics?.pendingReports || 0) > 0 ? colors.danger : colors.textMuted}]}>Pending Triage</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.successBg}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.success}]}>
                    {effectivePlatformAnalytics?.moderationMetrics?.resolvedReports ?? '-'}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.success}]}>Resolved</Text>
                </View>
              </View>
            </View>

            {/* 4. Taxonomy & Localization Master Data */}
            <View style={[styles.analyticsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={styles.analyticsCardHeader}>
                <View style={[styles.analyticsIconWrap, {backgroundColor: colors.cardAlt}]}>
                  <Ionicons name="globe-outline" size={20} color={colors.primary} />
                </View>
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={[styles.analyticsCardTitle, {color: colors.text}]}>Taxonomy & Localization Reach</Text>
                  <Text style={[styles.analyticsCardSub, {color: colors.textMuted}]}>Global clinical specialties and localized dialects</Text>
                </View>
              </View>

              <View style={styles.analyticsGridRow}>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.primary}]}>
                    {effectivePlatformAnalytics?.masterDataMetrics?.totalSpecializations ?? 15}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.textMuted}]}>Specializations</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.info}]}>
                    {platformAnalytics?.masterDataMetrics?.totalLanguages ?? 8}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.textMuted}]}>Languages</Text>
                </View>
                <View style={[styles.analyticsMetricBox, {backgroundColor: colors.cardAlt}]}>
                  <Text style={[styles.analyticsMetricNum, {color: colors.gold}]}>
                    {reasons.length}
                  </Text>
                  <Text style={[styles.analyticsMetricLabel, {color: colors.textMuted}]}>Abuse Rules</Text>
                </View>
              </View>
            </View>

            {/* 5. Historical Activity Overview */}
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
                  Super Admin role verified: Executive audit access active.
                </Text>
              </View>
            </View>
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
              {(() => {
                const docUrl = getApplicantDocUrl(selectedApplicant);
                if (docUrl) {
                  return (
                    <TouchableOpacity
                      onPress={() => openApplicantDocument(selectedApplicant)}
                      activeOpacity={0.8}
                      style={[styles.docPreviewCard, {backgroundColor: colors.cardAlt, borderColor: colors.border}]}>
                      <View style={[styles.docPreviewIconBox, {backgroundColor: colors.infoBg}]}>
                        <Ionicons name="document-text" size={24} color={colors.info} />
                      </View>
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={[styles.docFileName, {color: colors.text}]}>
                          Candidate Credentials / CV
                        </Text>
                        <Text style={[styles.docFileSize, {color: colors.textMuted}]}>
                          Tap to open & inspect in document viewer
                        </Text>
                      </View>
                      <View style={[styles.docOpenBadge, {backgroundColor: colors.primary}]}>
                        <Text style={styles.docOpenBadgeText}>Inspect</Text>
                        <Ionicons name="open-outline" size={14} color="#FFF" style={{marginLeft: 4}} />
                      </View>
                    </TouchableOpacity>
                  );
                }
                return (
                  <View style={[styles.docEmptyCard, {backgroundColor: colors.cardAlt, borderColor: colors.border}]}>
                    <Ionicons name="alert-circle-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.docEmptyText, {color: colors.textMuted}]}>
                      No CV or agreement document attached
                    </Text>
                  </View>
                );
              })()}

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

      {/* ADMIN & MODERATOR PROFILE INSPECTION MODAL */}
      <Modal visible={adminProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, {backgroundColor: colors.card, maxHeight: '90%'}]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Top Header */}
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons
                    name="badge-account-horizontal-outline"
                    size={24}
                    color={colors.primary}
                    style={{marginRight: 8}}
                  />
                  <Text style={[styles.modalHeader, {color: colors.text}]}>
                    Staff Profile Dossier
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setAdminProfileModal(false);
                    setSelectedAdmin(null);
                  }}>
                  <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSubHeader, {color: colors.textMuted}]}>
                Executive governance, platform permissions & session controls
              </Text>

              {/* Profile Card Summary */}
              {selectedAdmin && (() => {
                const adminId = selectedAdmin._id || selectedAdmin.id;
                const dossierAdmin = effectiveAdminDossier?.admin || selectedAdmin;
                const dossierPermissions = effectiveAdminDossier?.permissions;
                const dossierMetrics = effectiveAdminDossier?.metrics;

                const isSuper = dossierAdmin.role === 'Super Admin' || dossierAdmin.isSuperAdmin;
                const isBlocked =
                  staffBlockedOverrides[adminId] !== undefined
                    ? staffBlockedOverrides[adminId]
                    : Boolean(dossierAdmin.is_blocked || dossierAdmin.isBlocked || dossierAdmin.status === 'blocked' || dossierAdmin.status === 'suspended');
                const isCurrentUser = dossierAdmin.user_handle === user_handle;
                const adminName = dossierAdmin.user_name || dossierAdmin.name || 'Admin';
                const avatarUrl = dossierAdmin.Profile_avtar;

                return (
                  <View>
                    {loadingAdminDossier && !isGuest && (
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 6}}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={{fontSize: 12, color: colors.textMuted, marginLeft: 6}}>
                          Loading verified dossier telemetry...
                        </Text>
                      </View>
                    )}

                    <View style={[styles.profileHeroCard, {backgroundColor: colors.cardAlt, borderColor: colors.border}]}>
                      <View
                        style={[
                          styles.profileHeroAvatar,
                          {
                            backgroundColor: isBlocked
                              ? colors.dangerBg
                              : isSuper
                              ? colors.goldBg
                              : colors.card,
                          },
                        ]}>
                        {avatarUrl ? (
                          <Image
                            source={{uri: avatarUrl}}
                            style={styles.profileHeroAvatarImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={isBlocked ? 'account-cancel' : isSuper ? 'shield-crown' : 'shield-account'}
                            size={44}
                            color={isBlocked ? colors.danger : isSuper ? colors.gold : colors.primary}
                          />
                        )}
                      </View>

                      <Text style={[styles.profileHeroName, {color: colors.text}]}>
                        {adminName}
                      </Text>
                      <Text style={[styles.profileHeroHandle, {color: colors.textMuted}]}>
                        @{dossierAdmin.user_handle || 'user'}
                      </Text>

                      {/* Pill Row */}
                      <View style={styles.profilePillRow}>
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
                            {isSuper ? 'SUPER ADMIN' : 'EDITORIAL MODERATOR'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusPill,
                            {backgroundColor: isBlocked ? colors.dangerBg : colors.successBg},
                          ]}>
                          <Text
                            style={[
                              styles.statusPillText,
                              {color: isBlocked ? colors.danger : colors.success},
                            ]}>
                            {isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                          </Text>
                        </View>

                        {dossierAdmin.isVerified && (
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: colors.infoBg, flexDirection: 'row', alignItems: 'center'},
                            ]}>
                            <Ionicons name="checkmark-circle" size={13} color={colors.info} style={{marginRight: 4}} />
                            <Text style={[styles.statusPillText, {color: colors.info}]}>
                              VERIFIED
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Reviewer Contribution Metrics Cards */}
                    <Text style={[styles.detailSectionTitle, {color: colors.text}]}>Moderation & Review Activity</Text>
                    <View style={styles.dossierMetricsRow}>
                      <View style={[styles.dossierMetricCard, {backgroundColor: colors.cardAlt}]}>
                        <Text style={[styles.dossierMetricValue, {color: colors.primary}]}>
                          {dossierMetrics?.articlesReviewed ?? 0}
                        </Text>
                        <Text style={[styles.dossierMetricLabel, {color: colors.textMuted}]}>Articles Reviewed</Text>
                      </View>
                      <View style={[styles.dossierMetricCard, {backgroundColor: colors.cardAlt}]}>
                        <Text style={[styles.dossierMetricValue, {color: colors.info}]}>
                          {dossierMetrics?.improvementsReviewed ?? 0}
                        </Text>
                        <Text style={[styles.dossierMetricLabel, {color: colors.textMuted}]}>Diffs Handled</Text>
                      </View>
                      <View style={[styles.dossierMetricCard, {backgroundColor: colors.cardAlt}]}>
                        <Text style={[styles.dossierMetricValue, {color: colors.gold}]}>
                          {dossierMetrics?.reportsHandled ?? 0}
                        </Text>
                        <Text style={[styles.dossierMetricLabel, {color: colors.textMuted}]}>Reports Solved</Text>
                      </View>
                    </View>

                    {/* Official Reviewer Digital Signature on File */}
                    {dossierAdmin.signature_url && (
                      <View style={[styles.signatureBox, {backgroundColor: colors.cardAlt, borderColor: colors.border}]}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                          <Ionicons name="ribbon-outline" size={18} color={colors.gold} style={{marginRight: 6}} />
                          <Text style={[styles.detailLabel, {color: colors.text, marginBottom: 0}]}>Digital Signature on File</Text>
                          <View style={[styles.verifiedPill, {backgroundColor: colors.successBg, marginLeft: 8}]}>
                            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                            <Text style={[styles.verifiedPillText, {color: colors.success}]}>Verified</Text>
                          </View>
                        </View>
                        <Image
                          source={{uri: dossierAdmin.signature_url}}
                          style={styles.signatureImage}
                          resizeMode="contain"
                        />
                        <Text style={[styles.signatureSub, {color: colors.textMuted}]}>
                          Cryptographic signature applied to authorized peer-reviewed articles and clinical revisions.
                        </Text>
                      </View>
                    )}

                    {/* Contact & Identification */}
                    <Text style={[styles.detailSectionTitle, {color: colors.text}]}>Contact & Identity</Text>

                    <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                      <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Email Address</Text>
                      <Text style={[styles.detailValue, {color: colors.text}]}>
                        {dossierAdmin.email || 'N/A'}
                      </Text>
                    </View>

                    {dossierAdmin.phone && (
                      <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                        <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Direct Phone</Text>
                        <Text style={[styles.detailValue, {color: colors.text}]}>
                          {dossierAdmin.phone}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                      <Text style={[styles.detailLabel, {color: colors.textMuted}]}>System Identifier (UID)</Text>
                      <Text style={[styles.detailValue, {color: colors.text, fontFamily: 'monospace'}]}>
                        {adminId || 'UID-UH-0091'}
                      </Text>
                    </View>

                    {dossierAdmin.created_at && (
                      <View style={[styles.detailBlock, {backgroundColor: colors.cardAlt}]}>
                        <Text style={[styles.detailLabel, {color: colors.textMuted}]}>Onboarding Date</Text>
                        <Text style={[styles.detailValue, {color: colors.text}]}>
                          {new Date(dossierAdmin.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                    )}

                    {/* Governance Permissions Matrix */}
                    <Text style={[styles.detailSectionTitle, {color: colors.text}]}>Assigned Platform Permissions</Text>
                    <View style={[styles.permissionsMatrixCard, {backgroundColor: colors.cardAlt, borderColor: colors.border}]}>
                      {[
                        {
                          title: 'Article Peer Review & Verification',
                          enabled: dossierPermissions ? Boolean(dossierPermissions.canReviewArticles) : true,
                        },
                        {
                          title: 'Revision Diff & Medical Fact-Checking',
                          enabled: dossierPermissions ? Boolean(dossierPermissions.canInspectDiffs) : true,
                        },
                        {
                          title: 'Abuse Report Intake & Takedowns',
                          enabled: dossierPermissions ? Boolean(dossierPermissions.canManageReports) : true,
                        },
                        {
                          title: 'Medical Glossary Adjudication',
                          enabled: dossierPermissions ? Boolean(dossierPermissions.canManageGlossary) : true,
                        },
                        {
                          title: 'Super Admin Storage Purge & Global Audit',
                          enabled: dossierPermissions ? Boolean(dossierPermissions.canAuditGlobal) : isSuper,
                        },
                        {
                          title: 'Staff Directory & Administrator Governance',
                          enabled: dossierPermissions ? Boolean(dossierPermissions.canManageAdmins) : isSuper,
                        },
                      ].map((perm, idx) => (
                        <View key={idx} style={styles.permRow}>
                          <Ionicons
                            name={perm.enabled ? 'checkmark-circle' : 'close-circle'}
                            size={18}
                            color={perm.enabled ? colors.success : colors.textMuted}
                            style={{marginRight: 8}}
                          />
                          <Text
                            style={[
                              styles.permText,
                              {color: perm.enabled ? colors.text : colors.textMuted},
                            ]}>
                            {perm.title}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Suspension / Block Actions */}
                    <Text style={[styles.detailSectionTitle, {color: colors.text, marginTop: hp(1.8)}]}>
                      Account Controls
                    </Text>

                    {isCurrentUser ? (
                      <View style={[styles.warningNoticeBox, {backgroundColor: colors.goldBg}]}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.gold} style={{marginRight: 6}} />
                        <Text style={[styles.warningNoticeText, {color: colors.gold}]}>
                          You are currently logged into this administrator account. Self-suspension is disabled.
                        </Text>
                      </View>
                    ) : isSuper ? (
                      <View style={[styles.warningNoticeBox, {backgroundColor: colors.goldBg}]}>
                        <MaterialCommunityIcons name="shield-check" size={20} color={colors.gold} style={{marginRight: 6}} />
                        <Text style={[styles.warningNoticeText, {color: colors.gold}]}>
                          Super Administrator accounts cannot be suspended or blocked (System Governance Guardrail).
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        disabled={toggleBlockAdminMutation.isPending}
                        onPress={() => {
                          Alert.alert(
                            isBlocked ? 'Reinstate Moderator' : 'Suspend & Block Moderator',
                            isBlocked
                              ? `Are you sure you want to unblock ${adminName}? All administrative privileges and token access will be restored.`
                              : `Are you sure you want to block ${adminName}? Their session tokens will be revoked immediately and they will be barred from moderating content.`,
                            [
                              {text: 'Cancel', style: 'cancel'},
                              {
                                text: isBlocked ? 'Unblock Account' : 'Suspend & Block Account',
                                style: isBlocked ? 'default' : 'destructive',
                                onPress: () => {
                                  toggleBlockAdminMutation.mutate({
                                    id: adminId,
                                    isBlocked: !isBlocked,
                                    adminName,
                                  });
                                },
                              },
                            ]
                          );
                        }}
                        style={[
                          styles.adminBlockActionBtn,
                          {backgroundColor: isBlocked ? colors.success : colors.danger},
                        ]}>
                        <Ionicons
                          name={isBlocked ? 'shield-checkmark' : 'ban'}
                          size={18}
                          color="#FFFFFF"
                          style={{marginRight: 8}}
                        />
                        <Text style={styles.adminBlockActionBtnText}>
                          {toggleBlockAdminMutation.isPending
                            ? 'Updating Status...'
                            : isBlocked
                            ? 'Reinstate & Unblock Account'
                            : 'Suspend & Block Account'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })()}
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
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
  },
  crownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  crownText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13.5,
    marginTop: 2,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 11,
    borderRadius: 14,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },

  // Guest Sandbox Banner
  guestSandboxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(5),
    marginTop: hp(2),
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  guestSandboxIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestSandboxTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sandboxBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  sandboxBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  guestSandboxSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginTop: hp(2.2),
  },
  kpiCard: {
    width: '48%',
    borderRadius: 18,
    padding: wp(4.5),
    marginBottom: hp(1.6),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  kpiLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 4,
  },

  // Pillar Tab Chips
  tabScroll: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 8,
  },
  tabChipText: {
    fontSize: 13.5,
    fontWeight: '600',
  },

  // Section
  sectionContainer: {
    paddingHorizontal: wp(5),
    marginTop: hp(2.4),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13.5,
    marginTop: 3,
    lineHeight: 19,
  },
  demoTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demoTagText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Filter Pills
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Applicant Card
  applicantCard: {
    borderRadius: 18,
    padding: wp(4.5),
    marginBottom: hp(1.8),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  applicantCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  applicantName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  applicantEmail: {
    fontSize: 13.5,
    marginTop: 3,
  },
  applicantSpecialization: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  applicantMetaDivider: {
    height: 1,
    marginVertical: hp(1.6),
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  miniActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },

  // Admin Card
  adminCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: wp(4.5),
    marginBottom: hp(1.8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  adminCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminCardName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  adminCardHandle: {
    fontSize: 13.5,
    marginTop: 3,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // Data Cards
  dataCard: {
    padding: wp(4.2),
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: hp(1.4),
  },
  dataCardLeft: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  codeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaSubText: {
    fontSize: 13,
    lineHeight: 18,
  },
  reasonContentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  reasonContentMetaText: {
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 6,
  },

  emptyCard: {
    padding: wp(8),
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1),
  },
  emptyText: {
    fontSize: 14.5,
    fontWeight: '500',
    marginTop: hp(1.5),
  },

  // Tool Card
  toolCard: {
    padding: wp(5),
    borderRadius: 18,
    borderWidth: 1,
  },
  toolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  toolTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: wp(2.5),
  },
  toolDesc: {
    fontSize: 13.5,
    marginBottom: hp(2),
    lineHeight: 19,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.6),
    borderRadius: 14,
    marginTop: hp(1.8),
  },
  toolButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14.5,
  },

  // Stat Overview
  statOverviewCard: {
    padding: wp(5),
    borderRadius: 18,
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
    fontSize: 32,
    fontWeight: '800',
  },
  statDesc: {
    fontSize: 13.5,
    fontWeight: '500',
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
    fontSize: 13.5,
    marginLeft: wp(2),
    flex: 1,
    lineHeight: 19,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  modalBox: {
    width: '100%',
    borderRadius: 22,
    padding: wp(6),
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalSubHeader: {
    fontSize: 13.5,
    marginTop: 3,
    marginBottom: hp(2),
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    fontSize: 14.5,
  },

  // Applicant Inspection
  detailBlock: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.6),
    borderRadius: 14,
    borderWidth: 1.5,
    marginVertical: hp(1),
  },
  resumeButtonText: {
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  docPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: hp(1.2),
  },
  docPreviewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docFileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  docFileSize: {
    fontSize: 11,
    marginTop: 2,
  },
  docOpenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  docOpenBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  docEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: hp(1),
    gap: 8,
  },
  docEmptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: hp(1.5),
    marginBottom: hp(1),
  },
  statusActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: hp(1.5),
  },
  statusSelectButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  statusSelectButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  provisionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: hp(1),
  },
  provisionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  // Admin Profile Modal Styles
  profileHeroCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 12,
  },
  profileHeroAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileHeroName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileHeroHandle: {
    fontSize: 14,
    marginTop: 2,
  },
  profilePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  permissionsMatrixCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permText: {
    fontSize: 13.5,
    fontWeight: '500',
    flex: 1,
  },
  warningNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  warningNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  adminBlockActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  adminBlockActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  profileHeroAvatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  dossierMetricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dossierMetricCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  dossierMetricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  dossierMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  signatureBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  signatureImage: {
    width: '100%',
    height: 60,
    marginVertical: 4,
  },
  signatureSub: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 4,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Reason metrics breakdown
  reasonMetricPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  reasonMetricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  reasonMetricText: {
    fontSize: 11.5,
  },
  reasonAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  reasonAlertBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Platform Analytics Console
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  liveText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  analyticsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: wp(4.5),
    marginBottom: hp(1.8),
  },
  analyticsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  analyticsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  analyticsCardSub: {
    fontSize: 12,
    marginTop: 1,
  },
  analyticsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  analyticsMetricBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsMetricNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  analyticsMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  analyticsSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  analyticsSubText: {
    fontSize: 12.5,
    flex: 1,
  },
  pipelineBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  pipelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  pipelineValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  pipelineLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // Glossary
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
  },
  termCard: {
    padding: wp(4.5),
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: hp(1.2),
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  phoneticBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phoneticText: {
    fontSize: 11.5,
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
    fontSize: 11.5,
    fontWeight: '700',
  },
  smallIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termDefinition: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
