import { ArrowLeftIcon, ArrowRightIcon, FunnelIcon, MagnifyingGlassIcon, QueueListIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, DialogHeader, IconButton, Input, Option, Select } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'

const Report = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [dateRange, setDateRange] = useState(null)
  const formatDateTime = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" })
  const [open, setOpen] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)
  const [filteredReports, setFilteredReports] = useState([])

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    const today = new Date()
    if (range === '7') {
      setFromDate(new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0])
      setToDate(new Date().toISOString().split('T')[0])
    } else if (range === '30') {
      setFromDate(new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0])
      setToDate(new Date().toISOString().split('T')[0])
    } else if (range === '60') {
      setFromDate(new Date(today.setDate(today.getDate() - 60)).toISOString().split('T')[0])
      setToDate(new Date().toISOString().split('T')[0])
    } else {
      setFromDate(null)
      setToDate(null)
    }
  }

  const clearFilter = () => {
    setFromDate(null)
    setToDate(null)
    setSearch("")
    setDateRange(null)
    setFilteredReports(reports)
  }

  useEffect(() => {
    const getReport = async () => {
      await axios.get('/cashier/get-paid-report')
        .then(({ data }) => {
          setReports(data)
          setFilteredReports(data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    getReport()
  }, [])

  const calculateAmount = (report) => {
    const reqCred = report.request_credential
    const credentialAmount = parseFloat(reqCred?.credential_amount)
    const page = parseInt(reqCred?.page)

    const totalAmount = reqCred?.credential_purpose.reduce((subTotal, purpose) => {
      const quantity = parseInt(purpose.quantity)

      return subTotal + credentialAmount * quantity * page
    }, 0)

    return totalAmount
  }

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
    const results = reports
      .filter((report) => (
        search.toLowerCase() === "" ||
        [report.request_number, report.request_credential.credential.credential_name,
        report.student.information.last_name, report.student.information.first_name,
        report.student.information.middle_name, report.payment.or_number
        ].some((name) => name.toLowerCase().includes(search.toLowerCase()))
      ))
      .filter((report) => {
        if (fromDate && toDate) {
          const from = new Date(fromDate)
          const to = new Date(toDate)
          to.setHours(23, 59, 59, 999)
          const paymentDate = new Date(report.payment.created_at)
          return paymentDate >= from && paymentDate <= to
        }
        return true
      })
    setFilteredReports(results)
    setCurrentPage(1)
  }, [search, fromDate, toDate])

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

  const calculateTotalPay = () => {
    return filteredReports.reduce((total, report) => total + calculateAmount(report), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <Breadcrumbs className="bg-transparent p-0">
          <Link to='/cashier/dashboard' className="opacity-60">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <Link to='/cashier/credentials/requests' className="opacity-60">Requests</Link>
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
          <div className='flex items-center justify-end'>
            <span className='text-sm'>Total Pay: ₱ {calculateTotalPay()}</span>
          </div>
          <div className='overflow-x-auto'>
            <table className="w-full table-auto text-left">
              <thead className="bg-blue-gray-50/50">
                <tr>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">#</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Request Number</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Credential Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Pay</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">OR Number</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Date and Time</th>
                </tr>
              </thead>
              <tbody>
                {records.map((report, index) => (
                  <tr key={index} onClick={() => navigate(`/cashier/credentials/requests/${report.request_number}`)} className="border-b hover:bg-blue-gray-50/50 cursor-pointer">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {firstIndex + index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {report.request_number}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {report.request_credential.credential.credential_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      ₱ {calculateAmount(report)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {report.payment.or_number}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {formatDateTime(report.payment.created_at)}
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

      <Dialog size="xs" open={open} handler={() => setOpen(!open)}>
        <DialogHeader>
          <span className="text-lg">
            Filter Reports
          </span>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Select value={dateRange} label='Date Range' onChange={(val) => handleDateRangeChange(val)}>
            <Option value='7'>Last 7 Days</Option>
            <Option value='30'>Last 30 Days</Option>
            <Option value='60'>Last 60 Days</Option>
            <Option value='custom'>Custom</Option>
          </Select>
          <Input value={fromDate || ''} onChange={(e) => setFromDate(e.target.value)} label="From" type='date' disabled={dateRange !== 'custom'} />
          <Input value={toDate || ''} onChange={(e) => setToDate(e.target.value)} label="To" type='date' disabled={dateRange !== 'custom'} />
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