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
    CHANGE_PASSWORD_API
}