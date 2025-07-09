import { Alert, Breadcrumbs, Button, Card, CardBody, CardFooter, Input, List, ListItem, ListItemPrefix } from '@material-tailwind/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../../../contexts/AuthContext'
import { EyeIcon, EyeSlashIcon, HomeIcon, KeyIcon, UserIcon } from '@heroicons/react/24/solid'
import LoadingScreen from '../../../components/LoadingScreen'
import User from '../../../../assets/images/user.png'

const Profile = () => {
  const { user, changePassword, btnLoading, loading, error } = useAuthContext()
  const [current_password, setCurrentPassword] = useState("")
  const [new_password, setNewPassword] = useState("")
  const [password_confirmation, setPasswordConfirmation] = useState("")
  const personal = useRef(null)
  const password = useRef(null)
  const [showPass, setShowPass] = useState(false)

  const scrollToSection = (sectionRef) => {
    sectionRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const handleChangePassword = () => {
    changePassword({ current_password, password: new_password, password_confirmation })
  }

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <Breadcrumbs className="bg-transparent p-0">
          <Link to={user?.role === 'admin' && '/registrar/dashboard' || user?.role === 'cashier' && '/cashier/dashboard' || user?.role === 'student' && '/student/dashboard'} className="opacity-60">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <span>My Profile</span>
        </Breadcrumbs>
      </div>
      <div className='flex gap-4'>
        <Card className='sticky top-4 min-w-[272px] p-2 h-fit'>
          <List>
            <ListItem onClick={() => scrollToSection(personal)}>
              <ListItemPrefix>
                <UserIcon className="h-5 w-5" />
              </ListItemPrefix>
              <span className='mr-auto text-sm font-normal'>Personal Details</span>
            </ListItem>
            <ListItem onClick={() => scrollToSection(password)}>
              <ListItemPrefix>
                <KeyIcon className="h-5 w-5" />
              </ListItemPrefix>
              <span className='mr-auto text-sm font-normal'>Change Password</span>
            </ListItem>
          </List>
        </Card>
        <div className='flex-1 space-y-4'>
          <Card className='h-fit'>
            <CardBody className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <img src={User} className="h-24 w-24" />
                <div className='flex flex-col'>
                  <span className='text-base font-semibold'>{user?.staff?.information.first_name || user?.student?.information.first_name} {user?.staff?.information.last_name || user?.student?.information.last_name}</span>
                  <span className='text-sm font-medium capitalize'>{user?.role}</span>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card ref={personal} className='h-fit'>
            <CardBody className='space-y-6'>
              <span className="font-medium text-sm">Personal Details</span>
              <div className='grid grid-cols-3 gap-10'>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Last Name</span>
                  <span className='text-sm'>{user?.staff?.information.last_name || user?.student?.information.last_name}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">First Name</span>
                  <span className='text-sm'>{user?.staff?.information.first_name || user?.student?.information.first_name}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Middle Name</span>
                  <span className='text-sm'>{user?.staff?.information.middle_name ? user?.staff?.information.middle_name : '-'}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Gender</span>
                  <span className='text-sm capitalize'>{user?.staff?.information.gender || user?.student?.information.gender}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Email Address</span>
                  <span className='text-sm'>{user?.staff?.information.email_address || user?.student?.information.email_address}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Phone Number</span>
                  <span className='text-sm'>{user?.staff?.information.contact_number ?? user?.student?.information.contact_number ?? '-'}</span>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card ref={password} className='h-fit'>
            <CardBody className='space-y-6'>
              <span className="font-medium text-sm">Change Password</span>
              <div className='grid grid-cols-2 gap-10'>
                <div className='space-y-6'>
                  {error.current_password && error.current_password.map((error_message, index) => (
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
                  {user?.is_password_changed === 'yes' && (
                    <div className='relative'>
                      <Input onChange={(e) => setCurrentPassword(e.target.value)} label="Current Password" type={!showPass ? 'password' : 'text'} />
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
                  )}
                  <Input onChange={(e) => setNewPassword(e.target.value)} label="New Password" type="password" />
                  <Input onChange={(e) => setPasswordConfirmation(e.target.value)} label="Confirm Password" type="password" />
                </div>
              </div>
            </CardBody>
            <CardFooter className='flex justify-end'>
              <Button onClick={handleChangePassword} color="blue" loading={btnLoading}>
                <span>Save Changes</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile