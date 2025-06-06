import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { HomeIcon } from "@heroicons/react/24/solid"
import { Badge, Breadcrumbs, Card, CardBody, Chip, Dialog, DialogBody, IconButton, Input, Option, Select, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from "@material-tailwind/react"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from 'react'
import axios from "../../../../../api/axios"
import LoadingScreen from "../../../../components/LoadingScreen"

const tabs = ['review', 'pay', 'process', 'receive']

const Request = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const [selected, setSelected] = useState("all")
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const [openSearch, setOpenSearch] = useState(false)
  const [selectedTab, setSelectedTab] = useState(tabs[0])

  useEffect(() => {
    const getRequest = async () => {
      await axios.get('/registrar/get-credential-request')
        .then(({ data }) => {
          setRequests(data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    getRequest()
  }, [])

  const getStatusCount = () => {
    const counts = { review: 0, pay: 0, process: 0, receive: 0 }

    requests.forEach((request) => {
      const status = request.request_status
      counts[status] = (counts[status] || 0) + 1
    })

    return counts
  }

  const statusCount = getStatusCount()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 539) {
        setOpenSearch(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredRequests = (tab) => {
    return (
      requests.filter((request) => (
        search.toLowerCase() === "" ||
        [request.request_number, request.request_credential.credential.credential_name, request.student.information.last_name, request.student.information.first_name, request.student.information.middle_name]
          .some((name) => (
            name.toLowerCase().includes(search.toLowerCase())
          ))
      ))
        .filter((request) => {
          if (tab !== 'pay') return request.request_status === tab
          if (request.request_status === tab) {
            if (selected === 'all') return request.request_status === 'pay'
            if (selected === 'pending') return !request.payment
            if (selected === 'paid') return request.payment
          }
        })
    )
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
          <span>Requests</span>
        </Breadcrumbs>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Requests</span>
              <span className="font-medium text-sm">Total: {filteredRequests(selectedTab).length}</span>
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
          <Tabs value={selectedTab}>
            <div className='overflow-x-auto pt-2'>
              <TabsHeader className="w-fit space-x-4">
                {tabs.map((tab, index) => (
                  <Badge key={index} content={statusCount[tab]} className={`z-50 ${statusCount[tab] <= 0 && 'hidden'}`}>
                    <Tab onClick={() => setSelectedTab(tab)} value={tab} className="text-sm whitespace-nowrap capitalize">
                      {tab === 'review' && 'To Review' || tab === 'pay' && 'To Pay' || tab === 'process' && 'In Process' || tab === 'receive' && 'To Receive'}
                    </Tab>
                  </Badge>
                ))}
              </TabsHeader>
            </div>
            <TabsBody>
              {tabs.map((tab, index) => (
                <TabPanel key={index} value={tab} className="p-0 mt-6 max-sm:mt-4">
                  {tab === 'pay' && (
                    <div className="w-fit mb-6">
                      <Select label="Select Status" value={selected} onChange={(val) => setSelected(val)}>
                        <Option value="all">All</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="paid">Paid</Option>
                      </Select>
                    </div>
                  )}
                  <div className='overflow-x-auto'>
                    <table className="w-full table-auto text-left">
                      <thead className="bg-blue-gray-50/50">
                        <tr>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">#</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Request Number</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Student Name</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Credential Name</th>
                          {tab === 'pay' && <th className="font-medium text-sm p-4 whitespace-nowrap">Status</th>}
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Date Requested</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests(tab).map((request, index) => (
                          <tr key={index} onClick={() => navigate(`/registrar/credentials/requests/${request.request_number}`)} className="border-b hover:bg-blue-gray-50/50 cursor-pointer">
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {request.request_number}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {request.student.information.last_name}, {request.student.information.first_name}  {request.student.information.middle_name}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {request.request_credential.credential.credential_name}
                            </td>
                            {tab === 'pay' && (
                              <td className="p-4">
                                <Chip value={request.payment ? 'Paid' : 'Pending'} variant='ghost' color={request.payment ? 'green' : 'yellow'} size="sm" className="w-fit" />
                              </td>
                            )}
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {formatDate(request.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
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