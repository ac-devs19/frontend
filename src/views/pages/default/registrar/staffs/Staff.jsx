import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from '@heroicons/react/24/solid'
import { Alert, Breadcrumbs, Button, Card, CardBody, Chip, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Input, Option, Select, Switch } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../../../../api/axios'
import { toast, ToastContainer } from 'react-toastify'
import LoadingScreen from '../../../../components/LoadingScreen'

const Staff = () => {
  const [open, setOpen] = useState(false)
  const [last_name, setLastName] = useState("")
  const [first_name, setFirstName] = useState("")
  const [middle_name, setMiddleName] = useState("")
  const [gender, setGender] = useState("")
  const [email_address, setEmailAddress] = useState("")
  const [contact_number, setContactNumber] = useState("")
  const [role, setRole] = useState("cashier")
  const [staff_status, setStaffStatus] = useState("active")
  const [cashiers, setCashiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [errors, setErrors] = useState([])
  const navigate = useNavigate()
  const [openSearch, setOpenSearch] = useState(false)
  const [filteredCashiers, setFilteredCashiers] = useState([])

  const handleOpen = () => {
    setOpen(!open)
    setLastName("")
    setFirstName("")
    setMiddleName("")
    setGender("")
    setEmailAddress("")
    setContactNumber("")
    setStaffStatus("active")
    setErrors([])
  }

  useEffect(() => {
    getStaff()
  }, [])

  const getStaff = async () => {
    await axios.get('/registrar/get-staff')
      .then(({ data }) => {
        setCashiers(data)
        setFilteredCashiers(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleAddStaff = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/registrar/add-staff', { last_name, first_name, middle_name, gender, email_address, contact_number, role, staff_status })
      .then(() => {
        handleOpen()
        getStaff()
        toast.success('Staff added successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 539) {
        setOpenSearch(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const recordPerPage = 10
  const lastIndex = currentPage * recordPerPage
  const firstIndex = lastIndex - recordPerPage
  const records = filteredCashiers.slice(firstIndex, lastIndex)
  const npage = Math.ceil(filteredCashiers.length / recordPerPage)
  const pageLimit = 3
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1
  const endPage = Math.min(startPage + pageLimit - 1, npage)
  const numbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase()
    setSearch(keyword)
    if (keyword === "") {
      setFilteredCashiers(cashiers)
    } else {
      const results = cashiers.filter((cashier) => (
        search.toLowerCase() === "" ||
        [cashier.staff.information.last_name, cashier.staff.information.first_name, cashier.staff.information.middle_name || "", cashier.staff.information.email_address]
          .some((name) => (
            name.toLowerCase().includes(search.toLowerCase())
          ))
      ))
      setFilteredCashiers(results)
      setCurrentPage(1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const changeCurrentPage = (number) => {
    setCurrentPage(number)
  }

  const nextPage = () => {
    if (currentPage < npage) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <Breadcrumbs className="bg-transparent p-0">
          <Link to='/registrar/dashboard' className="opacity-60">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <span>Cashier</span>
        </Breadcrumbs>
        <Button onClick={handleOpen} color="blue" size="sm" className="flex items-center gap-3">
          <PlusIcon className="w-4 h-4" />
          <span className='max-sm:hidden'>Add</span>
        </Button>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Cashier</span>
              <span className="font-medium text-sm">Total: {filteredCashiers.length}</span>
            </div>
            <div className="w-full max-w-[250px] max-sm:hidden">
              <Input value={search} onChange={handleSearch} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
            </div>
            <div className='sm:hidden'>
              <IconButton onClick={() => setOpenSearch(!openSearch)} size='sm' variant='outlined'>
                <MagnifyingGlassIcon className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className="w-full table-auto text-left">
              <thead className="bg-blue-gray-50/50">
                <tr>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">#</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Last Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">First Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Middle Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Email Address</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((cashier, index) => (
                  <tr key={index} onClick={() => navigate(`/registrar/staffs/informations/${cashier.staff.id}`)} className="border-b cursor-pointer hover:bg-blue-gray-50/50">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {firstIndex + index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {cashier.staff.information.last_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {cashier.staff.information.first_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {cashier.staff.information.middle_name ? cashier.staff.information.middle_name : '-'}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {cashier.staff.information.email_address}
                    </td>
                    <td className="p-4">
                      <Chip variant='ghost' value={cashier.staff.staff_status} color={cashier.staff.staff_status === 'active' ? 'green' : 'red'} size='sm' className='w-fit' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCashiers.length > 0 && (
            <div className='flex justify-end'>
              <div className="flex items-center gap-3">
                <Button
                  size='sm'
                  onClick={prevPage}
                  variant="text"
                  className="flex items-center gap-3"
                  disabled={currentPage === 1}
                >
                  <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
                  <span className='max-sm:hidden'>Previous</span>
                </Button>
                <div className="flex items-center gap-2">
                  {numbers.map((number, index) => (
                    <IconButton
                      onClick={() => changeCurrentPage(number)}
                      color='blue'
                      variant={currentPage === number ? 'filled' : 'text'}
                      key={index}
                      size='sm'
                    >
                      {number}
                    </IconButton>
                  ))}
                </div>
                <Button
                  size='sm'
                  onClick={nextPage}
                  variant="text"
                  className="flex items-center gap-3"
                  disabled={currentPage === npage}
                >
                  <span className='max-sm:hidden'>Next</span>
                  <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog size="md" open={open}>
        <DialogHeader>
          <span className="text-lg">
            Add Cashier
          </span>
        </DialogHeader>
        {(errors.last_name || errors.first_name || errors.gender || errors.email_address || errors.contact_number) && (
          <div className='px-4'>
            <Alert variant="ghost" color="red">
              {errors.last_name && errors.last_name.map((error_message, index) => (
                <p key={index} className="text-sm">{`• ${error_message}`}</p>
              ))}
              {errors.first_name && errors.first_name.map((error_message, index) => (
                <p key={index} className="text-sm">{`• ${error_message}`}</p>
              ))}
              {errors.gender && errors.gender.map((error_message, index) => (
                <p key={index} className="text-sm">{`• ${error_message}`}</p>
              ))}
              {errors.email_address && errors.email_address.map((error_message, index) => (
                <p key={index} className="text-sm">{`• ${error_message}`}</p>
              ))}
              {errors.contact_number && errors.contact_number.map((error_message, index) => (
                <p key={index} className="text-sm">{`• ${error_message}`}</p>
              ))}
            </Alert>
          </div>
        )}
        <DialogBody className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Input label="Last Name" onChange={(e) => setLastName(e.target.value)} />
          <Input label="First Name" onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Middle Name" onChange={(e) => setMiddleName(e.target.value)} placeholder="Optional" />
          <Select label="Select Gender" onChange={(val) => setGender(val)}>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
          </Select>
          <Input label="Email Address" onChange={(e) => setEmailAddress(e.target.value)} />
          <Input label="Contact Number" onChange={(e) => {
            let input = e.target.value.replace(/\D/g, '')
            if (input.length > 11) {
              input = input.slice(0, 11)
            }
            let formattedNumber = input
            if (input.length > 4) {
              formattedNumber = `${input.slice(0, 4)}-${input.slice(4, 7)}`
              if (input.length > 7) {
                formattedNumber += `-${input.slice(7)}`
              }
            }
            setContactNumber(input)
            e.target.value = formattedNumber
          }} />
          <Switch color='blue' label={staff_status === 'active' ? 'Active' : 'Inactive'} checked={staff_status === 'active'} onChange={() => setStaffStatus(staff_status === 'active' ? 'inactive' : 'active')} labelProps={{ className: 'text-sm font-normal text-gray-900' }} />
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button onClick={handleOpen} variant="text" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button onClick={handleAddStaff} color='blue' loading={btnLoading}>
            <span>Save</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog size="xs" open={openSearch} handler={() => setOpenSearch(!openSearch)}>
        <DialogBody className='p-2'>
          <Input value={search} onChange={handleSearch} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
        </DialogBody>
      </Dialog>

      <ToastContainer
        position='top-center'
        pauseOnHover={false}
        hideProgressBar
        className="text-sm"
      />
    </div>
  )
}

export default Staff