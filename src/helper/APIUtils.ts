const EC2_BASE_URL = 'http://51.20.1.81:8084/api';
const LOGIN_API = `${EC2_BASE_URL}/admin/login`;
const REGISTRATION_API = `${EC2_BASE_URL}/admin/register`;
const GET_PROFILE_API = `${EC2_BASE_URL}/admin/getprofile`;
const UPLOAD_STORAGE = `${EC2_BASE_URL}/upload-storage`;
const CHECK_USER_HANDLE = `${EC2_BASE_URL}/user/check-user-handle`;
const VERIFICATION_MAIL_API = `${EC2_BASE_URL}/user/verifyEmail`;
const RESEND_VERIFICATION = `${EC2_BASE_URL}/user/resend-verification-mail`;
const SEND_OTP = `${EC2_BASE_URL}/user/forgotpassword`;
const CHECK_OTP = `${EC2_BASE_URL}/user/verifyOtp`;
const CHANGE_PASSWORD_API = `${EC2_BASE_URL}/admin/update-password`;
const GET_IMAGE = `${EC2_BASE_URL}/getfile`;
const GET_AVILABLE_ARTICLES_API = `${EC2_BASE_URL}/admin/articles-for-review`;
const GET_INPROGRESS_ARTICLES_API = `${EC2_BASE_URL}/admin/review-progress`;
const GET_COMPLETED_TASK_API = `${EC2_BASE_URL}/admin/review-completed`;
const PICK_ARTICLE = `${EC2_BASE_URL}/admin/moderator-self-assign`;
const DISCARD_ARTICLE = `${EC2_BASE_URL}/admin/discard-changes`;
const GET_STORAGE_DATA = `${EC2_BASE_URL}/getFile`;
const GET_ARTICLE_BY_ID = `${EC2_BASE_URL}/articles`;
const PUBLISH_ARTICLE = `${EC2_BASE_URL}/admin/publish-article`;
const ARTICLE_TAGS_API = '/articles/tags';
const GET_MONTHLY_CONTRIBUTION = `${EC2_BASE_URL}/analytics/admin/get-monthly-contribution`;
const GET_YEARLY_CONTRIBUTION = `${EC2_BASE_URL}/analytics/admin/get-yearly-contribution`;
const UPDATE_USER_DETAILS = `${EC2_BASE_URL}/admin/update-profile`;
const ADMIN_LOGOUT = `${EC2_BASE_URL}/admin/logout`;
const UNASSIGN_ARTICLE = `${EC2_BASE_URL}/admin/unassign-moderator`;
const GET_AVAILABLE_IMPROVEMENTS = `${EC2_BASE_URL}/admin/available-improvements`;
const GET_PROGRESS_IMPROVEMENTS = `${EC2_BASE_URL}/admin/progress-improvements`;
const PICK_IMPROVEMENT = `${EC2_BASE_URL}/admin/approve-improvement-request`;
const UNASSIGN_IMPROVEMENT = `${EC2_BASE_URL}/admin/improvement/unassign-moderator`;
const DISCARD_IMPROVEMENT = `${EC2_BASE_URL}/admin/discard-improvement`;
const GET_IMPROVEMENT_BY_ID = `${EC2_BASE_URL}/get-improvement`;
const PUBLISH_IMPROVEMENT = `${EC2_BASE_URL}/admin/publish-improvement`;
const GET_CHANGES_HISTORY = `${EC2_BASE_URL}/article/detect-content-loss`;
// For verification related POST and GET request, send isAdmin in request body and query.
export {
    LOGIN_API,
    REGISTRATION_API,
    GET_PROFILE_API,
    EC2_BASE_URL,
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
    GET_CHANGES_HISTORY
}