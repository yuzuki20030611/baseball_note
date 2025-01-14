import { handleGoogleLogin } from '@/app/_actions/login'
import { LoginTemplate } from '@/app/login/components/LoginTemplate'

const LoginPage = async () => {
  return <LoginTemplate handleGoogleLogin={handleGoogleLogin} />
}

export default LoginPage
