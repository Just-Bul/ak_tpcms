export default function logout(navigate) {
  localStorage.removeItem('auth_user')
  navigate('/sign-in', { replace: true })
}
