import { useState } from 'react'
import { Button, Input } from "@material-tailwind/react"
import { useAuthContext } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

const Login = () => {
  const [email_address, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const { login, btnLoading } = useAuthContext()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    login({ staff_email_address: email_address, password })
  }

  return (
    <form onSubmit={handleLogin} className='space-y-6'>
      <div className='space-y-2'>
        <div className='space-y-6'>
          <span className="font-semibold">Login</span>
          <Input onChange={(e) => setEmailAddress(e.target.value)} label="Email Address" type="email" />
          <div className='relative'>
            <Input onChange={(e) => setPassword(e.target.value)} label="Password" type={!showPass ? 'password' : 'text'} />
            <div className='absolute inset-y-0 right-2 flex items-center'>
              <Button onClick={() => setShowPass(!showPass)} variant="text" size="sm" className="flex items-center gap-3 rounded-full p-1">
                {showPass ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className='flex justify-end'>
          <span onClick={() => navigate('/forgot-password')} className='text-sm text-blue-500 hover:underline cursor-pointer'>Forgot Password?</span>
        </div>
      </div>
      <Button color="blue" type="submit" fullWidth loading={btnLoading} className="flex justify-center">
        <span>Login</span>
      </Button>
    </form>
  )
}

export default Login