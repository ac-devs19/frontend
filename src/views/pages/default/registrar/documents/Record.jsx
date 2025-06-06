import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, IconButton, Input, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'

const tabs = ['complete', 'incomplete']

const Record = () => {
  const [students, setStudents] = useState({ complete: [], incomplete: [] })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [openSearch, setOpenSearch] = useState(false)
  const [filteredRecords, setFilteredRecords] = useState({ complete: [], incomplete: [] })

  useEffect(() => {
    const getRecord = async () => {
      await axios.get('/registrar/get-record')
        .then(({ data }) => {
          setStudents(data)
          setFilteredRecords(data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    getRecord()
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

  const [currentPage, setCurrentPage] = useState({ complete: 1, incomplete: 1 })
  const recordPerPage = 10
  const pageLimit = 3
  const startIndex = (currentPage[activeTab] - 1) * recordPerPage
  const recordsToDisplay = filteredRecords[activeTab].slice(startIndex, startIndex + recordPerPage)
  const totalPages = Math.ceil(filteredRecords[activeTab].length / recordPerPage)
  const startPage = Math.floor((currentPage[activeTab] - 1) / pageLimit) * pageLimit + 1
  const endPage = Math.min(startPage + pageLimit - 1, totalPages)
  const paginationNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  useEffect(() => {
    const updateFilteredRecords = () => {
      const updatedRecords = {}
      tabs.forEach((tab) => {
        updatedRecords[tab] = students[tab].filter((record) =>
          [record.student_number, record.information.last_name, record.information.first_name, record.information.middle_name || ""]
            .some((name) => name.toLowerCase().includes(search.toLowerCase()))
        )
      })
      setFilteredRecords(updatedRecords);
      setCurrentPage((prev) => ({ ...prev, [activeTab]: 1 }))
    }
    updateFilteredRecords()
  }, [search, students])

  const prevPage = () => {
    setCurrentPage((prev) => ({
      ...prev,
      [activeTab]: Math.max(prev[activeTab] - 1, 1)
    }))
  }

  const changeCurrentPage = (number) => {
    setCurrentPage((prev) => ({ ...prev, [activeTab]: number }))
  }

  const nextPage = () => {
    const totalPages = Math.ceil(filteredRecords[activeTab].length / recordPerPage)
    setCurrentPage((prev) => ({
      ...prev,
      [activeTab]: Math.min(prev[activeTab] + 1, totalPages)
    }))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage((prev) => ({ ...prev, [tab]: 1 }))
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
          <Link to='/registrar/documents' className="opacity-60">
            Documents
          </Link>
          <span>Records</span>
        </Breadcrumbs>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Records</span>
              <span className="font-medium text-sm">Total: {filteredRecords[activeTab]?.length}</span>
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
          <Tabs value={tabs[0]}>
            <div className='overflow-x-auto'>
              <TabsHeader className="w-fit space-x-2">
                {tabs.map((tab, index) => (
                  <Tab key={index} value={tab} onClick={() => handleTabChange(tab)} className="text-sm whitespace-nowrap capitalize">
                    {tab === 'complete' && 'Completed' || tab === 'incomplete' && 'Incomplete'}
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
                          <th className="font-medium text-sm p-4 whitespace-nowrap">#</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Student ID Number</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Last Name</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">First Name</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Middle Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recordsToDisplay.map((record, index) => (
                          <tr key={index} onClick={() => navigate(`/registrar/documents/records/${record.student_number}`)} className="border-b hover:bg-blue-gray-50/50 cursor-pointer">
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {startIndex + index + 1}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {record.student_number}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {record.information.last_name}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {record.information.first_name}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {record.information.middle_name ? record.information.middle_name : '-'}
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
          {filteredRecords[activeTab].length > 0 && (
            <div className='flex justify-end'>
              <div className="flex items-center gap-3">
                <Button
                  size='sm'
                  onClick={prevPage}
                  variant="text"
                  className="flex items-center gap-3"
                  disabled={currentPage[activeTab] === 1}
                >
                  <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
                  <span className='max-sm:hidden'>Previous</span>
                </Button>
                <div className="flex items-center gap-2">
                  {paginationNumbers.map((number, index) => (
                    <IconButton
                      onClick={() => changeCurrentPage(number)}
                      color='blue'
                      variant={currentPage[activeTab] === number ? 'filled' : 'text'}
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
                  disabled={currentPage[activeTab] === totalPages}
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

export default Record