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
    DISCARD_ARTICLE
}