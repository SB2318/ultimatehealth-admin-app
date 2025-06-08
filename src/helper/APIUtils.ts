import Config from 'react-native-config';
const LOGIN_API = `${Config.BASE_URL}/admin/login`;
const REGISTRATION_API = `${Config.BASE_URL}/admin/register`;
const GET_PROFILE_API = `${Config.BASE_URL}/admin/getprofile`;
const UPLOAD_STORAGE = `${Config.BASE_URL}/upload-storage`;
const CHECK_USER_HANDLE = `${Config.BASE_URL}/user/check-user-handle`;
const VERIFICATION_MAIL_API = `${Config.BASE_URL}/user/verifyEmail`;
const RESEND_VERIFICATION = `${Config.BASE_URL}/user/resend-verification-mail`;
const SEND_OTP = `${Config.BASE_URL}/user/forgotpassword`;
const CHECK_OTP = `${Config.BASE_URL}/user/verifyOtp`;
const CHANGE_PASSWORD_API = `${Config.BASE_URL}/admin/update-password`;
const GET_IMAGE = `${Config.BASE_URL}/getfile`;
const GET_AVILABLE_ARTICLES_API = `${Config.BASE_URL}/admin/articles-for-review`;
const GET_INPROGRESS_ARTICLES_API = `${Config.BASE_URL}/admin/review-progress`;
const GET_COMPLETED_TASK_API = `${Config.BASE_URL}/admin/review-completed`;
const PICK_ARTICLE = `${Config.BASE_URL}/admin/moderator-self-assign`;
const DISCARD_ARTICLE = `${Config.BASE_URL}/admin/discard-changes`;
const GET_STORAGE_DATA = `${Config.BASE_URL}/getFile`;
const GET_ARTICLE_BY_ID = `${Config.BASE_URL}/articles`;
const PUBLISH_ARTICLE = `${Config.BASE_URL}/admin/publish-article`;
const ARTICLE_TAGS_API = '/articles/tags';
const GET_MONTHLY_CONTRIBUTION = `${Config.BASE_URL}/analytics/admin/get-monthly-contribution`;
const GET_YEARLY_CONTRIBUTION = `${Config.BASE_URL}/analytics/admin/get-yearly-contribution`;
const UPDATE_USER_DETAILS = `${Config.BASE_URL}/admin/update-profile`;
const ADMIN_LOGOUT = `${Config.BASE_URL}/admin/logout`;
const UNASSIGN_ARTICLE = `${Config.BASE_URL}/admin/unassign-moderator`;
const GET_AVAILABLE_IMPROVEMENTS = `${Config.BASE_URL}/admin/available-improvements`;
const GET_PROGRESS_IMPROVEMENTS = `${Config.BASE_URL}/admin/progress-improvements`;
const PICK_IMPROVEMENT = `${Config.BASE_URL}/admin/approve-improvement-request`;
const UNASSIGN_IMPROVEMENT = `${Config.BASE_URL}/admin/improvement/unassign-moderator`;
const DISCARD_IMPROVEMENT = `${Config.BASE_URL}/admin/discard-improvement`;
const GET_IMPROVEMENT_BY_ID = `${Config.BASE_URL}/get-improvement`;
const PUBLISH_IMPROVEMENT = `${Config.BASE_URL}/admin/publish-improvement`;
const GET_CHANGES_HISTORY = `${Config.BASE_URL}/article/detect-content-loss`;

const GET_ARTICLE_CONTENT = `${Config.BASE_URL}/articles/get-article-content`;
const GET_IMPROVEMENT_CONTENT = `${Config.BASE_URL}/articles/get-improve-content`;
const PUBLISH_IMPROVEMENT_POCKETBASE = `${Config.BASE_URL}/publish-improvement-from-pocketbase`;
const DELETE_IMPROVEMENT_RECORD_PB = `${Config.BASE_URL}/delete-improvement`;
// For verification related POST and GET request, send isAdmin in request body and query.
const CHECK_GRAMMAR = `${Config.CONTENT_CHECKER_URL}/grammar/check-grammar`;
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
    GET_CHANGES_HISTORY,
    GET_ARTICLE_CONTENT,
    GET_IMPROVEMENT_CONTENT,
    PUBLISH_IMPROVEMENT_POCKETBASE,
    DELETE_IMPROVEMENT_RECORD_PB,
    CHECK_GRAMMAR
}