import { ArrowLeftIcon, HomeIcon, UserIcon } from '@heroicons/react/24/solid'
import { Breadcrumbs, Button, Card, CardBody, List, ListItem, ListItemPrefix, Switch } from '@material-tailwind/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../../../../../api/axios'
import { Confirmation } from '../../../../components/Dialog'
import LoadingScreen from '../../../../components/LoadingScreen'
import User from '../../../../../assets/images/user.png'

const Information = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [staff, setStaff] = useState({})
  const [loading, setLoading] = useState(true)
  const [staff_status, setStaffStatus] = useState(null)
  const [initialStatus, setInitialStatus] = useState(null)
  const [open, setOpen] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const personal = useRef(null)

  const scrollToSection = (sectionRef) => {
    sectionRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const handleOpen = () => {
    setOpen(!open)
  }

  useEffect(() => {
    const loadStaff = async () => {
      await getStaff()
      setLoading(false)
    }
    loadStaff()
  }, [])

  const getStaff = async () => {
    await axios.get('/registrar/get-staff-information', {
      params: { id }
    })
      .then(({ data }) => {
        setStaff(data)
        setStaffStatus(data.staff_status)
        setInitialStatus(data.staff_status)
      })
  }

  const handleChangeStatus = async () => {
    setBtnLoading(true)
    await axios.post('/registrar/change-staff-status', { id, user_id: staff.user_id, staff_status })
      .then(() => {
        handleOpen()
        getStaff()
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const status = staff_status !== initialStatus

  useEffect(() => {
    if (status) {
      handleOpen()
    }
  }, [status])

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="text" size="sm" className="flex items-center gap-3 rounded-full p-2">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <Breadcrumbs className="bg-transparent p-0">
            <Link to="/registrar/dashboard" className="opacity-60">
              <HomeIcon className="w-5 h-5" />
            </Link>
            <Link to="/registrar/staffs" className="opacity-60">Staffs</Link>
            <span>{staff.id}</span>
          </Breadcrumbs>
        </div>
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
          </List>
        </Card>
        <div className='flex-1 space-y-4'>
          <Card className='h-fit'>
            <CardBody className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <img src={User} className="h-24 w-24" />
                <div className='flex flex-col'>
                  <span className='text-base font-semibold'>{staff.information?.first_name} {staff.information?.last_name}</span>
                  <span className='text-sm font-medium capitalize'>Cashier</span>
                </div>
              </div>
              <Switch color='blue' label={staff_status === 'active' ? 'Active' : 'Inactive'} checked={staff_status === 'active'} onChange={() => setStaffStatus(staff_status === 'active' ? 'inactive' : 'active')} labelProps={{ className: "text-sm capitalize font-normal" }} />
            </CardBody>
          </Card>
          <Card ref={personal} className='h-fit'>
            <CardBody className='space-y-6'>
              <span className="font-medium text-sm">Personal Details</span>
              <div className='grid grid-cols-3 gap-10'>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Last Name</span>
                  <span className='text-sm'>{staff.information?.last_name}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">First Name</span>
                  <span className='text-sm'>{staff.information?.first_name}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Middle Name</span>
                  <span className='text-sm'>{staff.information?.middle_name ? staff.information?.middle_name : '-'}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Gender</span>
                  <span className='text-sm capitalize'>{staff.information?.gender}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Email Address</span>
                  <span className='text-sm'>{staff.information?.email_address}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Phone Number</span>
                  <span className='text-sm'>{staff.information?.contact_number ? staff.information?.contact_number : '-'}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Confirmation open={open} label="Change Status?" color="text-green-500" handleOpen={() => {
        handleOpen()
        getStaff()
      }} onClick={handleChangeStatus} loading={btnLoading} />
    </div>
  )
}

export default Information