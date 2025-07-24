import { FunnelIcon, MagnifyingGlassIcon, QueueListIcon } from '@heroicons/react/24/outline'
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from '@heroicons/react/24/solid'
import { Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, DialogHeader, IconButton, Input, Menu, MenuHandler, MenuItem, MenuList, Option, Select } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'

const Report = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const [open, setOpen] = useState(false)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [credentialName, setCredentialName] = useState('')
  const [purposeName, setPurposeName] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [credentials, setCredentials] = useState([])
  const [purposes, setPurposes] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [weekStartDate, setWeekStartDate] = useState(null)
const [weekEndDate, setWeekEndDate] = useState(null)

  useEffect(() => {
    const loadReport = async () => {
      await getReport()
      await getCredential()
      await getPurpose()
      setLoading(false)
    }
    loadReport()
  }, [])

  const getReport = async () => {
    await axios.get('/registrar/get-complete-report')
      .then(({ data }) => {
        setReports(data)
        setFilteredReports(data)
      })
  }

  const getCredential = async () => {
    await axios.get('/credential/get-credential')
      .then(({ data }) => {
        setCredentials(data)
      })
  }

  const getPurpose = async () => {
    await axios.get('/credential/get-purpose')
      .then(({ data }) => {
        setPurposes(data)
      })
  }

  const clearFilter = () => {
    setFromDate(null)
    setToDate(null)
    setCredentialName('')
    setPurposeName('')
    setSearch("")
    setFilteredReports(reports)
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
  const records = filteredReports.slice(firstIndex, lastIndex)
  const npage = Math.ceil(filteredReports.length / recordPerPage)
  const pageLimit = 3
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1
  const endPage = Math.min(startPage + pageLimit - 1, npage)
  const numbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  useEffect(() => {
    const results = reports.filter((report) => (
      search.toLowerCase() === "" ||
      [report.request_number, report.request_credential.credential.credential_name, report.student.information.last_name, report.student.information.first_name, report.student.information.middle_name]
        .some((name) => (
          name.toLowerCase().includes(search.toLowerCase())
        )) ||
      report.request_credential.credential_purpose
        .some((purpose) => purpose.purpose.purpose_name.toLowerCase().includes(search.toLowerCase()))
    ))
      .filter((report) => {
        if (fromDate && toDate) {
          const from = new Date(fromDate)
          const to = new Date(toDate)
          to.setMonth(to.getMonth() + 1)
          to.setDate(0)
          to.setHours(23, 59, 59, 999)
          const reportDate = new Date(report.updated_at)
          return reportDate >= from && reportDate <= to
        }
        return true
      })
      .filter((report) =>
        credentialName === '' ||
        report.request_credential.credential.credential_name
          .toLowerCase()
          .includes(credentialName.toLowerCase())
      )
      .filter((report) =>
        purposeName === '' ||
        report.request_credential.credential_purpose.some((cp) =>
          cp.purpose.purpose_name.toLowerCase().includes(purposeName.toLowerCase())
        )
      )
    setFilteredReports(results)
    setCurrentPage(1)
  }, [search, fromDate, toDate, credentialName, purposeName])

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
          <Link to='/registrar/credentials' className="opacity-60">Credentials</Link>
          <span>Reports</span>
        </Breadcrumbs>
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(!open)} color="blue" size="sm" className="flex items-center gap-3">
            <FunnelIcon className="w-4 h-4" />
            <span className='max-sm:hidden'>Filter</span>
          </Button>
          <Button onClick={clearFilter} size='sm' variant='outlined' className="flex items-center gap-3">
            <QueueListIcon className="w-4 h-4" />
            <span className='max-sm:hidden'>Clear</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Reports</span>
              <span className="font-medium text-sm">Total: {filteredReports.length}</span>
            </div>
            <div className="w-full max-w-[250px] max-sm:hidden">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
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
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Request Number</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Student Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Credential Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Purpose Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Date Completed</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((report, index) => (
                  <tr key={index} className="border-b hover:bg-blue-gray-50/50">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {firstIndex + index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {report.request_number}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {report.student.information.last_name}, {report.student.information.first_name} {report.student.information.middle_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {report.request_credential.credential.credential_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {(report.request_credential.credential_purpose).length === 1 ? (
                        <span>{report.request_credential.credential_purpose[0].purpose.purpose_name}</span>
                      ) : (
                        <div className='w-fit'>
                          <Menu>
                            <MenuHandler>
                              <Button size='sm' variant='outlined'>
                                <span className='font-medium capitalize'>Show Purposes</span>
                              </Button>
                            </MenuHandler>
                            <MenuList>
                              {report.request_credential.credential_purpose.map((credPurpose, credPurIndex) => (
                                <MenuItem key={credPurIndex}>
                                  <span>{credPurpose.purpose.purpose_name}</span>
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Menu>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {formatDate(report.updated_at)}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      <span onClick={() => navigate(`/registrar/credentials/requests/${report.request_number}`)} className='text-blue-500 hover:underline cursor-pointer'>Show Details</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredReports.length > 0 && (
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

      <Dialog size="md" open={open} handler={() => setOpen(!open)}>
        <DialogHeader>
          <span className="text-lg">
            Filter Reports
          </span>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className='space-y-2'>
            <span className='text-sm font-normal text-gray-900'>Monthly Range</span>
              <div className='grid grid-cols-2 gap-4 max-sm:grid-cols-1'>
                <Input value={fromDate} onChange={(e) => setFromDate(e.target.value)} label='From' type='month' />
                <Input value={toDate} onChange={(e) => setToDate(e.target.value)} label='To' type='month' />
              </div>
          </div>
          <div className='space-y-2'>
            <span className='text-sm font-normal text-gray-900'>Weekly Range</span>
              <div className='grid grid-cols-2 gap-4 max-sm:grid-cols-1'>
                <Input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} label='Week Start' type='date' />
                <Input value={weekEndDate} onChange={(e) => setWeekEndDate(e.target.value)} label='Week End' type='date' />
              </div>
          </div>
          <div className='grid grid-cols-2 gap-4 max-sm:grid-cols-1'>
            <Select value={credentialName} label='Credential Name' onChange={(val) => setCredentialName(val)}>
              {credentials.map((credential, index) => (
                <Option key={index} value={credential.credential_name}>{credential.credential_name}</Option>
              ))}
            </Select>
            <Select value={purposeName} label='Purpose Name' onChange={(val) => setPurposeName(val)}>
              {purposes.map((purpose, index) => (
                <Option key={index} value={purpose.purpose_name}>{purpose.purpose_name}</Option>
              ))}
            </Select>
          </div>
        </DialogBody>
      </Dialog>

      <Dialog size="xs" open={openSearch} handler={() => setOpenSearch(!openSearch)}>
        <DialogBody className='p-2'>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
        </DialogBody>
      </Dialog>
    </div>
  )
}

export default Report