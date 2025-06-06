import { ArrowLeftIcon, ArrowRightIcon, HomeIcon, MagnifyingGlassIcon, NewspaperIcon, PencilSquareIcon, UserIcon } from '@heroicons/react/24/solid'
import { Alert, Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Input, List, ListItem, ListItemPrefix, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../../../../../api/axios'
import User from '../../../../../assets/images/user.png'
import LoadingScreen from '../../../../components/LoadingScreen'

const tabs = ['complete', 'cancel']

const Information = () => {
  const navigate = useNavigate()
  const { student_number } = useParams()
  const [student, setStudent] = useState({})
  const [open, setOpen] = useState(false)
  const [email_address, setEmailAddress] = useState("")
  const [errors, setErrors] = useState([])
  const [btnLoading, setBtnLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const personal = useRef(null)
  const history = useRef(null)
  const [search, setSearch] = useState("")
  const [selectedTab, setSelectedTab] = useState(tabs[0])

  const [filteredCompleteHistories, setFilteredCompleteHistories] = useState([])
  const [filteredCancelHistories, setFilteredCancelHistories] = useState([])
  const [currentCompletePage, setCurrentCompletePage] = useState(1)
  const [currentCancelPage, setCurrentCancelPage] = useState(1)

  const recordPerPage = 10
  const pageLimit = 3

  const paginate = (historyData, currentPage) => {
    const lastIndex = currentPage * recordPerPage
    const firstIndex = lastIndex - recordPerPage
    return historyData.slice(firstIndex, lastIndex)
  }

  const npage = (historyData) => Math.ceil(historyData.length / recordPerPage)

  const numbers = (currentPage, totalPages) => {
    const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1
    const endPage = Math.min(startPage + pageLimit - 1, totalPages)
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const prevPage = (setCurrentPage, currentPage) => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const nextPage = (setCurrentPage, currentPage, npage) => {
    if (currentPage < npage) setCurrentPage(currentPage + 1)
  }

  const changeCurrentPage = (setCurrentPage, number) => {
    setCurrentPage(number)
  }

  const scrollToSection = (sectionRef) => {
    sectionRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const handleOpen = () => {
    setOpen(!open)
    setEmailAddress("")
    setErrors([])
  }

  useEffect(() => {
    const loadStudent = async () => {
      await getStudent()
      setLoading(false)
    }
    loadStudent()
  }, [])

  const getStudent = async () => {
    await axios.get('/registrar/get-student-information', {
      params: { student_number }
    })
      .then(({ data }) => {
        setStudent(data.student)
        setFilteredCompleteHistories(data.histories.filter(history => history.request_status === 'complete'))
        setFilteredCancelHistories(data.histories.filter(history => history.request_status === 'cancel'))
      })
  }

  const handleEdit = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/registrar/edit-email-address', { student_number, email_address })
      .then(() => {
        handleOpen()
        getStudent()
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  useEffect(() => {
    const filterCompleteHistories = filteredCompleteHistories.filter((history) => (
      search.toLowerCase() === "" || [history.request_number, history.request_credential.credential.credential_name].some((name) => name.toLowerCase().includes(search.toLowerCase()))
    ))
    setFilteredCompleteHistories(filterCompleteHistories)
    setCurrentCompletePage(1)
  }, [search])

  useEffect(() => {
    const filterCancelHistories = filteredCancelHistories.filter((history) => (
      search.toLowerCase() === "" || [history.request_number, history.request_credential.credential.credential_name].some((name) => name.toLowerCase().includes(search.toLowerCase()))
    ))
    setFilteredCancelHistories(filterCancelHistories)
    setCurrentCancelPage(1)
  }, [search])

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
            <Link to="/registrar/students" className="opacity-60">Students</Link>
            <span>{student.student_number}</span>
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
            <ListItem onClick={() => scrollToSection(history)}>
              <ListItemPrefix>
                <NewspaperIcon className="h-5 w-5" />
              </ListItemPrefix>
              <span className='mr-auto text-sm font-normal'>Request History</span>
            </ListItem>
          </List>
        </Card>
        <div className='flex-1 space-y-4'>
          <Card className='h-fit'>
            <CardBody className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <img src={User} className="h-24 w-24" />
                <div className='flex flex-col'>
                  <span className='text-base font-semibold'>{student.information?.first_name} {student.information?.last_name}</span>
                  <span className='text-sm font-medium capitalize'>Student</span>
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
                  <span className='text-sm'>{student.information?.last_name}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">First Name</span>
                  <span className='text-sm'>{student.information?.first_name}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Middle Name</span>
                  <span className='text-sm'>{student.information?.middle_name ? student.information?.middle_name : '-'}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Gender</span>
                  <span className='text-sm capitalize'>{student.information?.gender}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <div className='flex items-center gap-2'>
                    <span className="text-xs font-medium">Email Address</span>
                    <PencilSquareIcon onClick={handleOpen} className='w-4 h-4 text-blue-500 cursor-pointer' />
                  </div>
                  <span className='text-sm'>{student.information?.email_address}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Phone Number</span>
                  <span className='text-sm'>{student.information?.contact_number ? student.information?.contact_number : '-'}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Student ID Number</span>
                  <span className='text-sm'>{student.student_number}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Course</span>
                  <span className='text-sm uppercase'>{student.course}</span>
                </div>
                <div className="flex flex-col space-y-2 border-b border-gray-400 pb-2">
                  <span className="text-xs font-medium">Student Type</span>
                  <span className='text-sm capitalize'>{student.student_type}</span>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card ref={history} className='h-fit'>
            <CardBody className='space-y-6'>
              <div className="flex items-center justify-between">
                <div className='w-full flex flex-col'>
                  <span className="font-medium text-sm">Request History</span>
                  <span className="font-medium text-sm">Total: {selectedTab === 'complete' ? filteredCompleteHistories.length : filteredCancelHistories.length}</span>
                </div>
                <div className='w-full max-w-[250px] max-sm:hidden'>
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
                </div>
              </div>
              <Tabs value={selectedTab}>
                <div className='overflow-x-auto pt-2'>
                  <TabsHeader className="w-fit space-x-4">
                    {tabs.map((tab, index) => (
                      <Tab onClick={() => setSelectedTab(tab)} key={index} value={tab} className="text-sm whitespace-nowrap capitalize">
                        {tab === 'complete' && 'Completed' || tab === 'cancel' && 'Cancelled'}
                      </Tab>
                    ))}
                  </TabsHeader>
                </div>
                <TabsBody>
                  {tabs.map((tab, index) => (
                    <TabPanel key={index} value={tab} className="p-0 mt-6 max-sm:mt-4">
                      <div className='overflow-x-auto'>
                        <table className="w-full table-auto text-left">
                          <thead className="bg-blue-gray-50/50">
                            <tr>
                              <th className="font-medium text-sm p-4">#</th>
                              <th className="font-medium text-sm p-4">Request Number</th>
                              <th className="font-medium text-sm p-4">Credential Name</th>
                              <th className="font-medium text-sm p-4">Date Requested</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(tab === 'complete' ? paginate(filteredCompleteHistories, currentCompletePage) : paginate(filteredCancelHistories, currentCancelPage)).map((history, index) => (
                              <tr key={index} onClick={() => navigate(`/registrar/credentials/requests/${history.request_number}`)} className="border-b cursor-pointer hover:bg-blue-gray-50/50">
                                <td className="p-4 font-normal text-sm">
                                  {(selectedTab === 'complete' ? (currentCompletePage - 1) * recordPerPage : (currentCancelPage - 1) * recordPerPage) + index + 1}
                                </td>
                                <td className="p-4 font-normal text-sm">
                                  {history.request_number}
                                </td>
                                <td className="p-4 font-normal text-sm">
                                  {history.request_credential.credential.credential_name}
                                </td>
                                <td className="p-4 font-normal text-sm">
                                  {formatDate(history.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {((tab === 'complete' && filteredCompleteHistories.length > 0) || (tab === 'cancel' && filteredCancelHistories.length > 0)) && (
                        <div className='mt-6 flex justify-end'>
                          <div className="flex items-center gap-3">
                            <Button
                              size='sm'
                              onClick={() => prevPage(tab === 'complete' ? setCurrentCompletePage : setCurrentCancelPage, tab === 'complete' ? currentCompletePage : currentCancelPage)}
                              variant="text"
                              className="flex items-center gap-3"
                              disabled={tab === 'complete' ? currentCompletePage === 1 : currentCancelPage === 1}
                            >
                              <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
                              <span className='max-sm:hidden'>Previous</span>
                            </Button>
                            {tab === 'complete' && (
                              <div className="flex items-center gap-2">
                                {numbers(currentCompletePage, npage(filteredCompleteHistories)).map((number, index) => (
                                  <IconButton
                                    onClick={() => changeCurrentPage(setCurrentCompletePage, number)}
                                    color='blue'
                                    variant={currentCompletePage === number ? 'filled' : 'text'}
                                    key={index}
                                    size='sm'
                                  >
                                    {number}
                                  </IconButton>
                                ))}
                              </div>
                            )}
                            {tab === 'cancel' && (
                              <div className="flex items-center gap-2">
                                {numbers(currentCancelPage, npage(filteredCancelHistories)).map((number, index) => (
                                  <IconButton
                                    onClick={() => changeCurrentPage(setCurrentCancelPage, number)}
                                    color='blue'
                                    variant={currentCancelPage === number ? 'filled' : 'text'}
                                    key={index}
                                    size='sm'
                                  >
                                    {number}
                                  </IconButton>
                                ))}
                              </div>
                            )}
                            <Button
                              size='sm'
                              onClick={() => nextPage(tab === 'complete' ? setCurrentCompletePage : setCurrentCancelPage, tab === 'complete' ? currentCompletePage : currentCancelPage, npage(tab === 'complete' ? filteredCompleteHistories : filteredCancelHistories))}
                              variant="text"
                              className="flex items-center gap-3"
                              disabled={tab === 'complete' ? currentCompletePage === npage(filteredCompleteHistories) : currentCancelPage === npage(filteredCancelHistories)}
                            >
                              <span className='max-sm:hidden'>Next</span>
                              <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabPanel>
                  ))}
                </TabsBody>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>
      <Dialog size="xs" open={open}>
        <DialogHeader>
          <span className="text-lg">
            Edit Email Address
          </span>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {(errors.email_address) && (
            <div className='space-y-3'>
              {errors.email_address && errors.email_address.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
            </div>
          )}
          <p className='text-sm font-normal text-gray-900'>Are you sure you want to update this email address: <span className='font-medium text-blue-500'>{student.information?.email_address}</span></p>
          <Input onChange={(e) => setEmailAddress(e.target.value)} label='Email Address' disabled={btnLoading} />
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button onClick={handleOpen} variant="text" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button onClick={handleEdit} color='blue' loading={btnLoading}>
            <span>Change</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

export default Information