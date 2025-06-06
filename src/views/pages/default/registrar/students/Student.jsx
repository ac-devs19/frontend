import { useEffect, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from "@heroicons/react/24/solid"
import { Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Input } from "@material-tailwind/react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CloudArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import axios from '../../../../../api/axios'
import { ToastContainer, toast } from 'react-toastify'
import LoadingScreen from '../../../../components/LoadingScreen'

const Student = () => {
  const [file, setFile] = useState(null)
  const [open, setOpen] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [filteredStudents, setFilteredStudents] = useState([])
  const [search, setSearch] = useState("")
  const [openSearch, setOpenSearch] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    setFile(null)
  }

  useEffect(() => {
    getStudent()
  }, [])

  const getStudent = async () => {
    await axios.get('/registrar/get-student')
      .then(({ data }) => {
        setStudents(data)
        setFilteredStudents(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const importFile = async () => {
    setBtnLoading(true)
    const formData = new FormData()
    formData.append('import_file', file)
    await axios.post('/registrar/import-student', formData)
      .then(() => {
        handleOpen()
        getStudent()
        toast.success('Student added successfully.')
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const exportFile = async () => {
    setBtnLoading(true)
    await axios.get('/registrar/export-student', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'students.xlsx')
        document.body.appendChild(link)
        link.click()
        link.remove()
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
  const records = filteredStudents.slice(firstIndex, lastIndex)
  const npage = Math.ceil(filteredStudents.length / recordPerPage)
  const pageLimit = 3
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1
  const endPage = Math.min(startPage + pageLimit - 1, npage)
  const numbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase()
    setSearch(keyword)
    if (keyword === "") {
      setFilteredStudents(students)
    } else {
      const results = students.filter((student) =>
        [student.student_number, student.information.last_name, student.information.first_name,
        student.information.middle_name || "", student.information.email_address]
          .some((field) => field.toLowerCase().includes(keyword))
      )
      setFilteredStudents(results)
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
          <span>Students</span>
        </Breadcrumbs>
        <div className="flex items-center gap-3">
          <Button onClick={exportFile} loading={btnLoading} size="sm" variant="outlined" className="flex items-center gap-3">
            <ArrowDownTrayIcon className={`w-4 h-4 ${btnLoading ? 'hidden' : ''}`} />
            <span className='max-sm:hidden'>Export</span>
          </Button>
          <Button onClick={handleOpen} color="blue" size="sm" className="flex items-center gap-3">
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span className='max-sm:hidden'>Import</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Students</span>
              <span className="font-medium text-sm">Total: {filteredStudents.length}</span>
            </div>
            <div className='w-full max-w-[250px] max-sm:hidden'>
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
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Student ID Number</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Last Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">First Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Middle Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Email Address</th>
                </tr>
              </thead>
              <tbody>
                {records.map((student, index) => (
                  <tr key={index} onClick={() => navigate(`/registrar/students/informations/${student.student_number}`)} className="border-b cursor-pointer hover:bg-blue-gray-50/50">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {firstIndex + index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {student.student_number}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {student.information.last_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {student.information.first_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {student.information.middle_name ? student.information.middle_name : '-'}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {student.information.email_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length > 0 && (
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

      <Dialog size="xs" open={open}>
        <DialogHeader>
          <span className="text-lg">Import Students</span>
        </DialogHeader>
        <DialogBody>
          <Button onClick={() => document.getElementById("file").click()} variant="outlined" fullWidth className="flex items-center justify-center gap-3">
            <CloudArrowUpIcon className="w-5 h-5" />
            <span className='font-medium text-gray-900 normal-case'>Choose File {file ? `| ${file.name}` : ''}</span>
          </Button>
          <input onChange={(e) => setFile(e.target.files[0])} id="file" type="file" hidden />
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button onClick={handleOpen} variant="text" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button onClick={importFile} color='blue' loading={btnLoading}>
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

export default Student