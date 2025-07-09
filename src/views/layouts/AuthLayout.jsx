import React from 'react'
import { Navigate, Outlet } from "react-router-dom"
import Logo from '../../assets/images/OCC_LOGO.png'
import { Alert, Card, CardBody } from "@material-tailwind/react"
import { useAuthContext } from '../../contexts/AuthContext'

const AuthLayout = () => {
  const { token, user, error } = useAuthContext()

  if (token) {
    if (user?.role === 'admin') {
      return <Navigate to='/registrar/dashboard' />
    } else if (user?.role === 'cashier') {
      return <Navigate to='/cashier/dashboard' />
    } else if (user?.role === 'student') {
      return <Navigate to='/student/dashboard' />
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-4">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <img src={Logo} className="w-24" />
            <span className="text-xl font-bold">Office Of Registrar</span>
          </div>
          <div className="space-y-3">
            {error.staff_email_address && error.staff_email_address.map((error_message, index) => (
              <Alert key={index} variant="ghost" color="red">
                <span className="text-xs">{error_message}</span>
              </Alert>
            ))}
            {error.password && error.password.map((error_message, index) => (
              <Alert key={index} variant="ghost" color="red">
                <span className="text-xs">{error_message}</span>
              </Alert>
            ))}
            {error.message && error.message.map((error_message, index) => (
              <Alert key={index} variant="ghost" color="red">
                <span className="text-xs">{error_message}</span>
              </Alert>
            ))}
          </div>
          <Outlet />
        </CardBody>
      </Card>
    </div>
  )
}

export default AuthLayout