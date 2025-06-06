import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, IconButton, Input } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'

const Request = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const [openSearch, setOpenSearch] = useState(false)
  const [filteredRequests, setFilteredRequests] = useState([])

  useEffect(() => {
    const getRequest = async () => {
      await axios.get('/cashier/get-credential-request')
        .then(({ data }) => {
          setRequests(data)
          setFilteredRequests(data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    getRequest()
  }, [])

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
  const records = filteredRequests.slice(firstIndex, lastIndex)
  const npage = Math.ceil(filteredRequests.length / recordPerPage)
  const pageLimit = 3
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1
  const endPage = Math.min(startPage + pageLimit - 1, npage)
  const numbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  useEffect(() => {
    const results = requests
      .filter((request) => (
        search.toLowerCase() === "" ||
        [request.request_number, request.request_credential.credential.credential_name, request.student.information.last_name, request.student.information.first_name, request.student.information.middle_name]
          .some((name) => (
            name.toLowerCase().includes(search.toLowerCase())
          ))
      ))
    setFilteredRequests(results)
    setCurrentPage(1)
  }, [search])

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
          <Link to='/cashier/dashboard' className="opacity-60">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <span>Requests</span>
        </Breadcrumbs>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Requests</span>
              <span className="font-medium text-sm">Total: {filteredRequests.length}</span>
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
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Date Requested</th>
                </tr>
              </thead>
              <tbody>
                {records.map((request, index) => (
                  <tr key={index} onClick={() => navigate(`/cashier/credentials/requests/${request.request_number}`)} className="border-b hover:bg-blue-gray-50/50 cursor-pointer">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {firstIndex + index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {request.request_number}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {request.student.information.last_name}, {request.student.information.first_name} {request.student.information.middle_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {request.request_credential.credential.credential_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {formatDate(request.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequests.length > 0 && (
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

      <Dialog size="xs" open={openSearch} handler={() => setOpenSearch(!openSearch)}>
        <DialogBody className='p-2'>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
        </DialogBody>
      </Dialog>
    </div>
  )
}

export default Request