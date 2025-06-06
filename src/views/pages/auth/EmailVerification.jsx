import { Button, Input } from '@material-tailwind/react'
import { useState } from 'react'
import { useAuthContext } from '../../../contexts/AuthContext'

const EmailVerification = () => {
  const { verifyOtp, email_address, btnLoading } = useAuthContext()
  const [otp, setOtp] = useState("")

  const handleVerify = (e) => {
    e.preventDefault()
    verifyOtp({ email_address, otp })
  }

  return (
    <form onSubmit={handleVerify} className='space-y-6'>
      <span className="font-semibold">Email Verification</span>
      <Input onChange={(e) => setOtp(e.target.value)} label="OTP" maxLength={6} />
      <Button color="blue" type="submit" fullWidth loading={btnLoading} className="flex justify-center">
        <span>Verify</span>
      </Button>
    </form>
  )
}

export default EmailVerification