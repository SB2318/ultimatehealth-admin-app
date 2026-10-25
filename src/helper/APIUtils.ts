const PROD_URL = 'https://ultimatehealth.blog/api';
const CONTENT_PROD_URL = 'https://ultimatehealth.blog/veiwise';
const SOCKET_PROD = `https://ultimatehealth.blog`;
const LOGIN_API = `${PROD_URL}/admin/login`;
const GET_PROFILE_API = `${PROD_URL}/admin/getprofile`;
const UPLOAD_STORAGE = `${PROD_URL}/upload-storage`;
const CHECK_USER_HANDLE = `${PROD_URL}/user/check-user-handle`;
const SEND_OTP = `${PROD_URL}/admin/forgot-password`;
const FORGOT_PASSWORD_API = `${PROD_URL}/admin/forgot-password`;
const CHECK_OTP = `${PROD_URL}/admin/verify-otp`;
const VERIFY_OTP_API = `${PROD_URL}/admin/verify-otp`;
const RESET_PASSWORD_API = `${PROD_URL}/admin/reset-password`;
const CHANGE_PASSWORD_API = `${PROD_URL}/admin/update-password`;
const GET_IMAGE = `${PROD_URL}/getfile`;
const GET_AVILABLE_ARTICLES_API = `${PROD_URL}/admin/articles-for-review`;
const GET_INPROGRESS_ARTICLES_API = `${PROD_URL}/admin/review-progress`;
const GET_COMPLETED_TASK_API = `${PROD_URL}/admin/review-completed`;
const PICK_ARTICLE = `${PROD_URL}/admin/moderator-self-assign`;
const DISCARD_ARTICLE = `${PROD_URL}/admin/discard-changes`;
const GET_STORAGE_DATA = `${PROD_URL}/getFile`;
const GET_ARTICLE_BY_ID = `${PROD_URL}/articles`;
const PUBLISH_ARTICLE = `${PROD_URL}/admin/publish-article`;
const ARTICLE_TAGS_API = '/articles/tags';
const GET_MONTHLY_CONTRIBUTION = `${PROD_URL}/analytics/admin/get-monthly-contribution`;
const GET_YEARLY_CONTRIBUTION = `${PROD_URL}/analytics/admin/get-yearly-contribution`;
const UPDATE_USER_DETAILS = `${PROD_URL}/admin/update-profile`;
const ADMIN_LOGOUT = `${PROD_URL}/admin/logout`;
const UNASSIGN_ARTICLE = `${PROD_URL}/admin/unassign-moderator`;
const GET_AVAILABLE_IMPROVEMENTS = `${PROD_URL}/admin/available-improvements`;
const GET_PROGRESS_IMPROVEMENTS = `${PROD_URL}/admin/progress-improvements`;
const PICK_IMPROVEMENT = `${PROD_URL}/admin/approve-improvement-request`;
const UNASSIGN_IMPROVEMENT = `${PROD_URL}/admin/improvement/unassign-moderator`;
const DISCARD_IMPROVEMENT = `${PROD_URL}/admin/discard-improvement`;
const GET_IMPROVEMENT_BY_ID = `${PROD_URL}/get-improvement`;
const PUBLISH_IMPROVEMENT = `${PROD_URL}/admin/publish-improvement`;
const GET_COMPLETED_IMPROVEMENTS = `${PROD_URL}/admin/publish-improvements`;
const GET_CHANGES_HISTORY = `${PROD_URL}/article/detect-content-loss`;

const GET_ARTICLE_CONTENT = `${PROD_URL}/articles/get-article-content`;
const GET_IMPROVEMENT_CONTENT = `${PROD_URL}/article/get-improve-content`;
const PUBLISH_IMPROVEMENT_POCKETBASE = `${PROD_URL}/publish-improvement-from-pocketbase`;
const DELETE_IMPROVEMENT_RECORD_PB = `${PROD_URL}/delete-improvement`;
// For verification related POST and GET request, send isAdmin in request body and query.
const CHECK_GRAMMAR = `${CONTENT_PROD_URL}/grammar/check-grammar`;
const CHECK_PLAGIARISM = `${CONTENT_PROD_URL}/plagiarism/check`;
const CHECK_IMAGE_COPYRIGHT = `${CONTENT_PROD_URL}/copyright/check-image-copyright`;

// Report related
const GET_PENDING_REPORTS = `${PROD_URL}/report/pending-reports`;
const GET_ASSIGNED_REPORTS = `${PROD_URL}/report/all-assigned-reports`;
const GET_REPORT_REASONS = `${PROD_URL}/report/reasons`;
const PICK_REPORT = `${PROD_URL}/report/pick-report-for-investigation`;
const TAKE_ACTION_ON_REPORT = `${PROD_URL}/report/take-admin-action`;

// CATEGORY RELATED
const HTTP_CATEGORY = `${PROD_URL}/articles/tags`;

// REASON RELATED
const ADD_REASON = `${PROD_URL}/report/add-reason`;
const UPDATE_REASON = `${PROD_URL}/report/update-reason`;
const DELETE_REASON = `${PROD_URL}/report/reason`;

const FETCH_AVAILABLE_PODCAST = `${PROD_URL}/podcast-admin/available`;
const FETCH_PROGRESS_PODCAST = `${PROD_URL}/podcast-admin/all`;
// Podcast Actions
const PICK_PODCAST = `${PROD_URL}/podcast-admin/pick`;
const APPROVE_PODCAST = `${PROD_URL}/podcast-admin/approve`;
const DISCARD_PODCAST = `${PROD_URL}/podcast-admin/discard`;
const GET_PODCAST_DETAILS = `${PROD_URL}/podcast/details`;
const GET_COMPLETED_PODCAST = `${PROD_URL}/podcast-admin/completed`;
const CHECK_TOKEN_STATUS = `${PROD_URL}/checkTokenStatus`;
const GET_TOKEN_STATUS = `${PROD_URL}/checkTokenStatus`;

// Super Admin Endpoints
const GET_ALL_ADMINS = `${PROD_URL}/admin/admins`;
const GET_ALL_APPLICANTS = `${PROD_URL}/admin/applicants`;
const LANGUAGES_API = `${PROD_URL}/language`;
const GET_SPECIALIZATIONS = `${PROD_URL}/specialization/get-specialization`;
const ADD_SPECIALIZATION = `${PROD_URL}/specialization/add`;
const UPDATE_SPECIALIZATION = `${PROD_URL}/specialization/update-specialization`;
const DELETE_SPECIALIZATION = `${PROD_URL}/specialization/delete-specialization`;
const DELETE_FILE_API = `${PROD_URL}/deleteFile`;
const DELETE_PB_RECORD = `${PROD_URL}/delete-pocketbase-record`;
const GET_DAILY_READS = `${PROD_URL}/analytics/daily-reads`;
const GET_MONTHLY_READS = `${PROD_URL}/analytics/monthly-reads`;
const GET_DAILY_WRITES = `${PROD_URL}/analytics/daily-writes`;
const GET_MONTHLY_WRITES = `${PROD_URL}/analytics/monthly-writes`;

export {
    ADD_REASON, ADD_SPECIALIZATION, ADMIN_LOGOUT, APPROVE_PODCAST, ARTICLE_TAGS_API, CHANGE_PASSWORD_API, FORGOT_PASSWORD_API, RESET_PASSWORD_API, VERIFY_OTP_API, CHECK_GRAMMAR, CHECK_IMAGE_COPYRIGHT, CHECK_OTP, CHECK_PLAGIARISM, CHECK_USER_HANDLE, CONTENT_PROD_URL, DELETE_FILE_API, DELETE_IMPROVEMENT_RECORD_PB, DELETE_PB_RECORD, DELETE_REASON, DELETE_SPECIALIZATION, DISCARD_ARTICLE, DISCARD_IMPROVEMENT, DISCARD_PODCAST, FETCH_AVAILABLE_PODCAST,
    FETCH_PROGRESS_PODCAST, GET_ALL_ADMINS, GET_ALL_APPLICANTS, GET_ARTICLE_BY_ID, GET_ARTICLE_CONTENT, GET_ASSIGNED_REPORTS, GET_AVAILABLE_IMPROVEMENTS, GET_AVILABLE_ARTICLES_API, GET_CHANGES_HISTORY, GET_COMPLETED_IMPROVEMENTS, GET_COMPLETED_PODCAST, GET_COMPLETED_TASK_API, GET_DAILY_READS, GET_DAILY_WRITES, GET_IMAGE, GET_IMPROVEMENT_BY_ID, GET_IMPROVEMENT_CONTENT, GET_INPROGRESS_ARTICLES_API, GET_MONTHLY_CONTRIBUTION, GET_MONTHLY_READS, GET_MONTHLY_WRITES, GET_PENDING_REPORTS, GET_PODCAST_DETAILS, GET_PROFILE_API, GET_PROGRESS_IMPROVEMENTS, GET_REPORT_REASONS, GET_SPECIALIZATIONS, GET_STORAGE_DATA, CHECK_TOKEN_STATUS, GET_TOKEN_STATUS, GET_YEARLY_CONTRIBUTION, HTTP_CATEGORY, LANGUAGES_API, LOGIN_API, PICK_ARTICLE, PICK_IMPROVEMENT, PICK_PODCAST, PICK_REPORT, PROD_URL, PUBLISH_ARTICLE, PUBLISH_IMPROVEMENT, PUBLISH_IMPROVEMENT_POCKETBASE,
    SEND_OTP, SOCKET_PROD, TAKE_ACTION_ON_REPORT, UNASSIGN_ARTICLE, UNASSIGN_IMPROVEMENT, UPDATE_REASON, UPDATE_SPECIALIZATION, UPDATE_USER_DETAILS, UPLOAD_STORAGE
};
