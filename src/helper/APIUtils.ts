const PROD_URL = "https://uhsocial.in/api";
const CONTENT_PROD_URL = "https://uhsocial.in/content-intel";
const SOCKET_PROD = `https://uhsocial.in`;
const LOGIN_API = `${PROD_URL}/admin/login`;
const REGISTRATION_API = `${PROD_URL}/admin/register`;
const GET_PROFILE_API = `${PROD_URL}/admin/getprofile`;
const UPLOAD_STORAGE = `${PROD_URL}/upload-storage`;
const CHECK_USER_HANDLE = `${PROD_URL}/user/check-user-handle`;
const VERIFICATION_MAIL_API = `${PROD_URL}/user/verifyEmail`;
const RESEND_VERIFICATION = `${PROD_URL}/user/resend-verification-mail`;
const SEND_OTP = `${PROD_URL}/user/forgotpassword`;
const CHECK_OTP = `${PROD_URL}/user/verifyOtp`;
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
const GET_TOKEN_STATUS = `${PROD_URL}/tokenstatus`;


export {
    LOGIN_API,
    REGISTRATION_API,
    GET_PROFILE_API,
    UPLOAD_STORAGE,
    CHECK_USER_HANDLE,
    VERIFICATION_MAIL_API,
    RESEND_VERIFICATION,
    SEND_OTP,
    CHECK_OTP,
    CHANGE_PASSWORD_API,
    GET_IMAGE,
    GET_AVILABLE_ARTICLES_API,
    GET_INPROGRESS_ARTICLES_API,
    GET_COMPLETED_TASK_API,
    PICK_ARTICLE,
    DISCARD_ARTICLE,
    PUBLISH_ARTICLE,
    GET_ARTICLE_BY_ID,
    GET_STORAGE_DATA,
    ARTICLE_TAGS_API,
    GET_MONTHLY_CONTRIBUTION,
    GET_YEARLY_CONTRIBUTION,
    UPDATE_USER_DETAILS,
    ADMIN_LOGOUT,
    UNASSIGN_ARTICLE,
    GET_AVAILABLE_IMPROVEMENTS,
    GET_PROGRESS_IMPROVEMENTS,
    PICK_IMPROVEMENT,
    UNASSIGN_IMPROVEMENT,
    DISCARD_IMPROVEMENT,
    GET_IMPROVEMENT_BY_ID,
    PUBLISH_IMPROVEMENT,
    GET_COMPLETED_IMPROVEMENTS,
    GET_CHANGES_HISTORY,
    GET_ARTICLE_CONTENT,
    GET_IMPROVEMENT_CONTENT,
    PUBLISH_IMPROVEMENT_POCKETBASE,
    DELETE_IMPROVEMENT_RECORD_PB,
    CHECK_GRAMMAR,
    CHECK_PLAGIARISM,
    CHECK_IMAGE_COPYRIGHT,
    GET_ASSIGNED_REPORTS,
    GET_PENDING_REPORTS,
    GET_REPORT_REASONS,
    PICK_REPORT,
    TAKE_ACTION_ON_REPORT,
    HTTP_CATEGORY,
    ADD_REASON,
    UPDATE_REASON,
    DELETE_REASON,
    FETCH_AVAILABLE_PODCAST,
    FETCH_PROGRESS_PODCAST,
    PICK_PODCAST,
    APPROVE_PODCAST,
    DISCARD_PODCAST,
    GET_PODCAST_DETAILS,
    GET_COMPLETED_PODCAST,
    PROD_URL,
    CONTENT_PROD_URL,
    SOCKET_PROD,
    GET_TOKEN_STATUS
};