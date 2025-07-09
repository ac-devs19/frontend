import { useEffect, useState } from 'react'
import { Accordion, AccordionBody, AccordionHeader, Badge, Card, Drawer, IconButton, List, ListItem, ListItemPrefix, ListItemSuffix, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from "@material-tailwind/react"
import { ArrowsRightLeftIcon, ChevronDownIcon, ChevronRightIcon, DocumentTextIcon, FolderIcon, PresentationChartLineIcon, UsersIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Bars3BottomLeftIcon, BellIcon } from "@heroicons/react/24/solid"
import Logo from '../../assets/images/logo.png'
import User from '../../assets/images/user.png'
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuthContext } from '../../contexts/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import { Confirmation, SecurityAlert } from '../components/Dialog'
import axios from '../../api/axios'

const DefaultLayout = () => {
  const [open, setOpen] = useState(0)
  const route = useLocation()
  const navigate = useNavigate()
  const { user, logout, loading, status } = useAuthContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [notif, setReqNotif] = useState(null)
  const [payNotif, setPayNotif] = useState(null)
  const [drawerNotifOpen, setDrawerNotifOpen] = useState(false)
  const [documentNotif, setDocumentNotif] = useState([])
  const [credentialNotif, setCredentialNotif] = useState([])
  const formatDateTime = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value)
  }

  useEffect(() => {
    const securityAlert = () => {
      if (user?.is_password_changed === 'no' && route.pathname !== '/my-profile') {
        setSecurityOpen(true)
      } else {
        setSecurityOpen(false)
      }
    }
    securityAlert()
  }, [user, route])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 959) {
        setDrawerOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (drawerOpen || drawerNotifOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen, drawerNotifOpen])

  useEffect(() => {
    const getRequestNotif = async () => {
      await axios.get('/registrar/get-request-notif')
        .then(({ data }) => {
          setReqNotif(data)
        })
    }
    getRequestNotif()

    const getPayNotif = async () => {
      await axios.get('/cashier/get-pay-notif')
        .then(({ data }) => {
          setPayNotif(data)
        })
    }
    getPayNotif()
    getDocumentNotif()
    getCredentialNotif()
  }, [])

  const getDocumentNotif = async () => {
    if (user?.role === 'student') {
      await axios.get('/student/get-document-notif')
      .then(({ data }) => {
        setDocumentNotif(data)
      })
    }
    await axios.get('/registrar/get-document-notif')
      .then(({ data }) => {
        setDocumentNotif(data)
      })
  }

  const readDocumentNotif = async (id) => {
    if (user?.role === 'student') {
      await axios.post('/student/read-document-notif', { id })
      .then(() => {
        getDocumentNotif()
      })
    }
    await axios.post('/registrar/read-document-notif', { id })
      .then(() => {
        getDocumentNotif()
      })
  }

  const getCredentialNotif = async () => {
    if (user?.role === 'student') {
      await axios.get('/student/get-credential-notif')
      .then(({ data }) => {
        setCredentialNotif(data)
      })
    }
    await axios.get('/registrar/get-credential-notif')
      .then(({ data }) => {
        setCredentialNotif(data)
      })
  }

  const readCredenttialNotif = async (id) => {
    if (user?.role === 'student') {
      await axios.post('/student/read-credential-notif', { id })
      .then(() => {
        getCredentialNotif()
      })
    }
    await axios.post('/registrar/read-credential-notif', { id })
      .then(() => {
        getCredentialNotif()
      })
  }

  return (
    <div>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div>
          <Card className="fixed h-[calc(100vh-2rem)] w-[272px] inset-y-4 left-4 p-2 overflow-y-scroll max-lg:hidden" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <NavigationList
              user={user}
              open={open}
              handleOpen={handleOpen}
              navigate={navigate}
              route={route}
              setDrawerOpen={setDrawerOpen}
              dialogOpen={() => setDialogOpen(!dialogOpen)}
              notif={notif}
              payNotif={payNotif}
              status={status}
            />
          </Card>
          <Drawer placement='left' open={drawerOpen} onClose={() => setDrawerOpen(!drawerOpen)} className='p-2 overflow-y-scroll w-[272px]'>
            <NavigationList
              user={user}
              open={open}
              handleOpen={handleOpen}
              navigate={navigate}
              route={route}
              setDrawerOpen={() => setDrawerOpen(!drawerOpen)}
              dialogOpen={() => setDialogOpen(!dialogOpen)}
              notif={notif}
              payNotif={payNotif}
              status={status}
            />
          </Drawer>
          <div className="lg:ml-[290px] p-4 max-sm:p-2">
            <div className='flex items-center justify-end max-lg:justify-between'>
              <IconButton onClick={() => setDrawerOpen(!drawerOpen)} variant="text" className="lg:hidden">
                <Bars3BottomLeftIcon className="h-5 w-5 opacity-60" />
              </IconButton>
              <Badge content={documentNotif.filter(notif => notif.notification_status === 'unread').length + credentialNotif.filter(notif => notif.notification_status === 'unread').length} invisible={(documentNotif.filter(notif => notif.notification_status === 'unread').length > 0 || credentialNotif.filter(notif => notif.notification_status === 'unread').length) ? false : true}>
                <IconButton onClick={() => setDrawerNotifOpen(!drawerNotifOpen)} variant="filled" color='white'>
                  <BellIcon color="orange" className="h-5 w-5" />
                </IconButton>
              </Badge>
            </div>
            <div className="mx-auto max-w-[1280px]">
              <Outlet />
            </div>
          </div>
        </div>
      )}

      <Confirmation open={dialogOpen} label="Logout?" color="text-red-500" handleOpen={() => setDialogOpen(!dialogOpen)} onClick={() => {
        setDialogOpen(!dialogOpen)
        logout()
      }} />

      <SecurityAlert open={securityOpen} onClick={() => {
        setSecurityOpen(!securityOpen)
        navigate('/my-profile')
      }} />

      <Drawer placement='right' open={drawerNotifOpen} onClose={() => setDrawerNotifOpen(!drawerNotifOpen)}>
        <div className='h-screen p-4 space-y-4 overflow-y-scroll' style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-900'>Notifications</span>
            <IconButton onClick={() => setDrawerNotifOpen(!drawerNotifOpen)} variant="text">
              <XMarkIcon className="h-5 w-5 opacity-60" />
            </IconButton>
          </div>
          {(user?.role === 'admin' || user?.role === 'student') && (
            <Tabs value="document_notif" className="space-y-4">
              <TabsHeader className="rounded-none bg-transparent space-x-2 p-0"
                indicatorProps={{
                  className:
                    "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none",
                }}>
                <Tab value="document_notif" className="text-sm whitespace-nowrap capitalize">Documents</Tab>
                <Tab value="credential_notif" className="text-sm whitespace-nowrap capitalize">Credentials</Tab>
              </TabsHeader>
              <TabsBody>
                <TabPanel value="document_notif" className='p-0 space-y-2'>
                  {user?.role === 'admin' && documentNotif.map((notif, index) => (
                    <div onClick={() => {
                      setDrawerNotifOpen(false)
                      navigate(`/registrar/documents/records/${notif.submit.student.student_number}/${notif.submit.record[0].document.id}`)
                      if (notif.notification_status === 'unread') {
                        readDocumentNotif(notif.id)
                      }
                    }} key={index} className={`p-2 rounded-lg space-y-2 cursor-pointer ${notif.notification_status === 'unread' && 'bg-blue-100/50 border border-blue-200' || notif.notification_status === 'read' && 'bg-gray-50 border border-gray-200'}`}>
                      <span className='text-sm font-normal text-gray-900'>{notif.submit.student.information.first_name} {notif.submit.student.information.last_name} has {notif.submit_status === 'submit' && 'submitted' || notif.submit_status === 'resubmit' && 're-submitted'} a {notif.submit.record[0].document.document_name}.</span>
                      <p className='text-xs font-normal text-end text-gray-900'>{formatDateTime(notif.created_at)}</p>
                    </div>
                  ))}
                  {user?.role === 'student' && documentNotif.map((notif, index) => (
                    <div onClick={() => {
                      setDrawerNotifOpen(false)
                      navigate(`/student/my-documents/${notif.submit.record[0].document.document_name}/${notif.submit.record[0].document.id}`)
                      if (notif.notification_status === 'unread') {
                        readDocumentNotif(notif.id)
                      }
                    }} key={index} className={`p-2 rounded-lg space-y-2 cursor-pointer ${notif.notification_status === 'unread' && 'bg-blue-100/50 border border-blue-200' || notif.notification_status === 'read' && 'bg-gray-50 border border-gray-200'}`}>
                      <span className='text-sm font-pregular'>Your submission of <span className="text-blue-500 font-pmedium">{notif.submit.record[0].document.document_name}</span> has been <span className={`font-pmedium ${notif.submit_status === 'confirm' && 'text-green-500' || notif.submit_status === 'decline' && 'text-red-500'}`}>{notif.submit_status === 'confirm' && 'Confirmed' || notif.submit_status === 'decline' && 'Declined'}</span> by the admin.</span>
                      <p className='text-xs font-normal text-end text-gray-900'>{formatDateTime(notif.created_at)}</p>
                    </div>
                  ))}
                </TabPanel>
                <TabPanel value="credential_notif" className='p-0 space-y-2'>
                  {user?.role === 'admin' && credentialNotif.map((notif, index) => (
                    <div onClick={() => {
                      setDrawerNotifOpen(false)
                      navigate(`/registrar/credentials/requests/${notif.request.request_number}`)
                      if (notif.notification_status === 'unread') {
                        readCredenttialNotif(notif.id)
                      }
                    }} key={index} className={`p-2 rounded-lg space-y-2 border border-gray-200 cursor-pointer ${notif.notification_status === 'unread' && 'bg-blue-100/50 border border-blue-200' || notif.notification_status === 'read' && 'bg-gray-50 border border-gray-200'}`}>
                      <span className='text-sm font-normal text-gray-900'>{notif.request.student.information.first_name} {notif.request.student.information.last_name} has {notif.request_status === 'request' && 'requested' || notif.request_status === 'paid' && 'completed the payment for' || notif.request_status === 'claim' && 'requested to claim'} a {notif.request.request_credential.credential.credential_name}.</span>
                      <p className='text-xs font-normal text-end text-gray-900'>{formatDateTime(notif.created_at)}</p>
                    </div>
                  ))}
                  {user?.role === 'student' && credentialNotif.map((notif, index) => (
                    <div onClick={() => {
                      setDrawerNotifOpen(false)
                      navigate(`/student/my-credentials/request-detail/${notif.request.request_number}`)
                      if (notif.notification_status === 'unread') {
                        readCredenttialNotif(notif.id)
                      }
                    }} key={index} className={`p-2 rounded-lg space-y-2 border border-gray-200 cursor-pointer ${notif.notification_status === 'unread' && 'bg-blue-100/50 border border-blue-200' || notif.notification_status === 'read' && 'bg-gray-50 border border-gray-200'}`}>
                      <span className='text-sm font-pregular'>Your request for a <span className="text-blue-500 font-pmedium">{notif.request.request_credential.credential.credential_name}</span> {notif.request_status === 'receive' ? 'is now ready for a' : 'has been'}{notif.request_status !== 'receive' ? ' ' : ''}{notif.request_status === 'paid' && 'marked as'} <span className={`font-pmedium ${notif.request_status === 'confirm' && 'text-green-500' || notif.request_status === 'decline' && 'text-red-500' || notif.request_status === 'paid' && 'text-green-500' || notif.request_status === 'process' && 'text-cyan-500' || notif.request_status === 'receive' && 'text-indigo-500' || notif.request_status === 'complete' && 'text-green-500' || notif.request_status === 'cancel' && 'text-red-500'}`}>{notif.request_status === 'confirm' && 'Confirmed' || notif.request_status === 'decline' && 'Declined' || notif.request_status === 'paid' && 'Paid' || notif.request_status === 'process' && 'Processed' || notif.request_status === 'receive' && 'Claim' || notif.request_status === 'complete' && 'Completed' || notif.request_status === 'cancel' && 'Cancelled'}</span>{notif.request_status !== 'receive' ? ' ' : ''}{notif.request_status !== 'receive' && `by the ${notif.request_status === 'paid' ? 'cashier' : 'admin'}`}.</span>
                      <p className='text-xs font-normal text-end text-gray-900'>{formatDateTime(notif.created_at)}</p>
                    </div>
                  ))}
                </TabPanel>
              </TabsBody>
            </Tabs>
          )}
          {user?.role === 'cashier' && (
            <div className='space-y-4'>
              {credentialNotif.map((notif, index) => (
                <div onClick={() => {
                  setDrawerNotifOpen(false)
                  navigate(`/cashier/credentials/requests/${notif.request.request_number}`)
                  if (notif.notification_status === 'unread') {
                    readCredenttialNotif(notif.id)
                  }
                }} key={index} className={`p-2 rounded-lg space-y-2 border border-gray-200 cursor-pointer ${notif.notification_status === 'unread' && 'bg-blue-100/50 border border-blue-200' || notif.notification_status === 'read' && 'bg-gray-50 border border-gray-200'}`}>
                  <span className='text-sm font-normal text-gray-900'>{notif.request.student.information.first_name} {notif.request.student.information.last_name} has requested to make a {notif.request_status === 'pay' && 'payment'} for a {notif.request.request_credential.credential.credential_name}.</span>
                  <p className='text-xs font-normal text-end text-gray-900'>{formatDateTime(notif.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}

const NavigationList = ({ user, open, handleOpen, navigate, route, setDrawerOpen, dialogOpen, notif, payNotif, status }) => {
  return (
    <div>
      <div className="flex items-center justify-between p-2">
        <img src={Logo} className="h-8 w-fit object-contain" />
        <IconButton onClick={setDrawerOpen} variant="text" className='lg:hidden'>
          <XMarkIcon className="h-5 w-5 opacity-60" />
        </IconButton>
      </div>
      <List>
        <span className="font-medium text-sm py-2 capitalize">
          {user?.role}
        </span>
        <Accordion open={open === 1} icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`} />} >
          <ListItem className="p-0">
            <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
              <ListItemPrefix>
                <img src={User} className="h-8 w-8" />
              </ListItemPrefix>
              <span className="mr-auto text-sm font-normal">
                {user?.role === 'student' ? `${user?.student.information.first_name} ${ user?.student.information.last_name}` : `${user?.staff.information.first_name} ${ user?.staff.information.last_name}`}
              </span>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem onClick={() => {
                navigate('/my-profile')
                setDrawerOpen(false)
              }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/my-profile' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="mr-auto text-sm font-normal">My Profile</span>
              </ListItem>
              <ListItem onClick={dialogOpen}>
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="mr-auto text-sm font-normal">Logout</span>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
      </List>
      <hr className="m-2 border-blue-gray-50" />
      {user?.role === 'admin' && (
        <List>
          <span className="font-medium text-sm py-2">Main</span>
          <ListItem onClick={() => {
            navigate('/registrar/dashboard')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/dashboard' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <PresentationChartLineIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">Dashboard</span>
          </ListItem>
          <span className="font-medium text-sm py-2">Users</span>
          <ListItem onClick={() => {
            navigate('/registrar/students')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/students' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <UsersIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">Students</span>
          </ListItem>
          <ListItem onClick={() => {
            navigate('/registrar/staffs')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/staffs' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <UsersIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">Cashier</span>
          </ListItem>
          <span className="font-medium text-sm py-2">Files</span>
          <Accordion open={open === 2} icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`} />} >
            <ListItem className="p-0">
              <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-3">
                <ListItemPrefix>
                  <FolderIcon className="h-5 w-5" />
                </ListItemPrefix>
                <span className="mr-auto text-sm font-normal">Documents</span>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem onClick={() => {
                  navigate('/registrar/documents')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/documents' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">All Documents</span>
                </ListItem>
                <ListItem onClick={() => {
                  navigate('/registrar/documents/records')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/documents/records' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">Records</span>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>
          <Accordion open={open === 3} icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${open === 3 ? "rotate-180" : ""}`} />} >
            <ListItem className="p-0">
              <AccordionHeader onClick={() => handleOpen(3)} className="border-b-0 p-3">
                <ListItemPrefix>
                  <DocumentTextIcon className="h-5 w-5" />
                </ListItemPrefix>
                <span className="mr-auto text-sm font-normal">Credentials</span>
                <ListItemSuffix className={notif?.notif === 'no' && 'hidden'}>
                  <div className="flex items-center justify-center">
                    <div className='relative inset-0 flex items-center justify-center'>
                      <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      <div className="absolute w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </ListItemSuffix>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem onClick={() => {
                  navigate('/registrar/credentials')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/credentials' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">All Credentials</span>
                </ListItem>
                <ListItem onClick={() => {
                  navigate('/registrar/credentials/purposes')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/credentials/purposes' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">Purposes</span>
                </ListItem>
                <ListItem onClick={() => {
                  navigate('/registrar/credentials/requests')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/credentials/requests' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">Requests</span>
                  <ListItemSuffix className={notif?.notif === 'no' && 'hidden'}>
                    <div className="flex items-center justify-center">
                      <div className='relative inset-0 flex items-center justify-center mr-2'>
                        <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        <div className="absolute w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  </ListItemSuffix>
                </ListItem>
                <ListItem onClick={() => {
                  navigate('/registrar/credentials/reports')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/registrar/credentials/reports' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">Reports</span>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>
        </List>
      )}
      {user?.role === 'cashier' && (
        <List>
          <span className="font-medium text-sm py-2">Main</span>
          <ListItem onClick={() => {
            navigate('/cashier/dashboard')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/cashier/dashboard' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <PresentationChartLineIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">Dashboard</span>
          </ListItem>
          <span className="font-medium text-sm py-2">Credentials</span>
          <Accordion open={open === 2} icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`} />} >
            <ListItem className="p-0">
              <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-3">
                <ListItemPrefix>
                  <ArrowsRightLeftIcon className="h-5 w-5" />
                </ListItemPrefix>
                <span className="mr-auto text-sm font-normal">Requests</span>
                <ListItemSuffix className={payNotif?.notif === 'no' && 'hidden'}>
                  <div className="flex items-center justify-center">
                    <div className='relative inset-0 flex items-center justify-center'>
                      <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      <div className="absolute w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </ListItemSuffix>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem onClick={() => {
                  navigate('/cashier/credentials/requests')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/cashier/credentials/requests' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">All Requests</span>
                  <ListItemSuffix className={payNotif?.notif === 'no' && 'hidden'}>
                    <div className="flex items-center justify-center mr-2">
                      <div className='relative inset-0 flex items-center justify-center'>
                        <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        <div className="absolute w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  </ListItemSuffix>
                </ListItem>
                <ListItem onClick={() => {
                  navigate('/cashier/credentials/reports')
                  setDrawerOpen(false)
                }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/cashier/credentials/reports' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <span className="mr-auto text-sm font-normal">Reports</span>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>
        </List>
      )}
      {user?.role === 'student' && (
        <List>
          <span className="font-medium text-sm py-2">Main</span>
          <ListItem onClick={() => {
            navigate('/student/dashboard')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/student/dashboard' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <PresentationChartLineIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">Dashboard</span>
          </ListItem>
          <ListItem onClick={() => {
            navigate('/student/my-documents')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/student/my-documents' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <FolderIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">My Documents</span>
          </ListItem>
          {status && status === 'complete' && (
            <ListItem onClick={() => {
            navigate('/student/my-credentials')
            setDrawerOpen(false)
          }} className={`focus:bg-blue-500 focus:text-white ${route.pathname === '/student/my-credentials' && 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'}`}>
            <ListItemPrefix>
              <DocumentTextIcon className="h-5 w-5" />
            </ListItemPrefix>
            <span className="mr-auto text-sm font-normal">My Credentials</span>
          </ListItem>
          )}
        </List>
      )}
    </div>
  )
}

export default DefaultLayout