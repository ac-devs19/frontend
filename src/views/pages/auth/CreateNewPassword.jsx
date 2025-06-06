import { Button, Input } from '@material-tailwind/react'
import { useState } from 'react'
import { useAuthContext } from '../../../contexts/AuthContext'

function CreateNewPassword() {
  const { createNewPassword, email_address, btnLoading } = useAuthContext()
  const [password, setPassword] = useState("")
  const [password_confirmation, setPasswordConfirmation] = useState("")

  const handleCreatePassword = (e) => {
    e.preventDefault()
    createNewPassword({ password, password_confirmation, staff_email_address: email_address })
  }

  return (
    <form onSubmit={handleCreatePassword} className='space-y-6'>
      <span className="font-semibold">Create Password</span>
      <Input onChange={(e) => setPassword(e.target.value)} label="Password" type="password" />
      <Input onChange={(e) => setPasswordConfirmation(e.target.value)} label="Confirm Password" type="password" />
      <Button color="blue" type="submit" fullWidth loading={btnLoading} className="flex justify-center">
        <span>Change</span>
      </Button>
    </form>
  )
}

export default CreateNewPassword