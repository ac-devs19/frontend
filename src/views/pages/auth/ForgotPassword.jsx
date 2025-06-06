import { Button, Input } from '@material-tailwind/react'
import { useState } from 'react'
import { useAuthContext } from '../../../contexts/AuthContext'

const ForgotPassword = () => {
  const [email_address, setEmailAddress] = useState("")
  const { forgotPassword, btnLoading } = useAuthContext()

  const handleForgotPassword = (e) => {
    e.preventDefault()
    forgotPassword({ staff_email_address: email_address })
  }

  return (
    <form onSubmit={handleForgotPassword} className='space-y-6'>
      <span className="font-semibold">Forgot Password</span>
      <Input onChange={(e) => setEmailAddress(e.target.value)} label="Email Address" type="email" />
      <Button color="blue" type="submit" fullWidth loading={btnLoading} className="flex justify-center">
        <span>Send</span>
      </Button>
    </form>
  )
}

export default ForgotPassword