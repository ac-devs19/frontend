import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Alert, Breadcrumbs, Button, Card, CardBody, Checkbox, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Input, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'
import { ToastContainer, toast } from 'react-toastify'

const Document = () => {
  const [open, setOpen] = useState(false)
  const [types, setTypes] = useState([])
  const [document, setDocument] = useState("")
  const [documents, setDocuments] = useState([])
  const [type, setType] = useState({})
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  const [search, setSearch] = useState("")
  const [errors, setErrors] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    setDocument("")
    setType({})
    setSelectedDocument(null)
    setErrors([])
    setSelectAll(false)
  }

  const getType = async () => {
    await axios.get('/document/get-student-type')
      .then(({ data }) => {
        setTypes(data)
        setActiveTab(data[0]?.student_type)
      })
  }

  const getDocument = async () => {
    await axios.get('/document/get-document')
      .then(({ data }) => {
        setDocuments(data)
      })
  }

  useEffect(() => {
    const loadDocument = async () => {
      await getType()
      await getDocument()
      setLoading(false)
    }
    loadDocument()
  }, [])

  const handleCheckbox = (studentType) => {
    if (studentType === 'all') {
      const newSelectAll = !selectAll
      setSelectAll(newSelectAll)

      const updatedTypes = types.reduce((acc, curr) => {
        acc[curr.student_type] = newSelectAll
        return acc
      }, {})

      setType(updatedTypes)
    } else {
      setType((prev) => {
        const newState = { ...prev, [studentType]: !prev[studentType] }
        const allChecked = types.every(({ student_type }) => newState[student_type])
        setSelectAll(allChecked)
        return newState
      })
    }
  }

  const handleCreateDocument = async () => {
    setErrors([])
    setBtnLoading(true)
    const selectedType = Object.keys(type).filter(id => type[id])
    await axios.post('/document/create-document', { document_name: document, document_type: selectedType })
      .then(() => {
        handleOpen()
        getDocument()
        toast.success('Document created successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleUpdateDocument = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/document/update-document', { id: selectedDocument.id, document_name: selectedDocument.document_name, document_type: selectedDocument.document_type })
      .then(() => {
        handleOpen()
        getDocument()
        toast.success('Document updated successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleRemoveDocument = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/document/remove-document', { id: selectedDocument.id })
      .then(() => {
        handleOpen()
        getDocument()
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleSelectedDocument = (document) => {
    setSelectedDocument(document)
    setOpen(!open)
  }

  const handleTab = (tab) => {
    setActiveTab(tab)
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

  const filteredDocuments = documents
    .filter((document) => (
      search.toLowerCase() === "" ||
      [document.document_name]
        .some((name) => (
          name.toLowerCase().includes(search.toLowerCase())
        ))
    ))
    .filter(document => document.document_type === activeTab)

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
          <span>Documents</span>
        </Breadcrumbs>
        <Button onClick={handleOpen} color="blue" size="sm" className="flex items-center gap-3">
          <PlusIcon className="w-4 h-4" />
          <span className='max-sm:hidden'>Create</span>
        </Button>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className='w-full flex flex-col'>
              <span className="font-medium text-sm">List of Documents</span>
              <span className="font-medium text-sm">Total: {filteredDocuments.length}</span>
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
          <Tabs value="0">
            <div className='overflow-x-auto'>
              <TabsHeader className="w-fit space-x-2">
                {types.map((type, index) => (
                  <Tab onClick={() => handleTab(type.student_type)} key={index} value={String(index)} className="text-sm whitespace-nowrap capitalize">
                    {type.student_type}
                  </Tab>
                ))}
              </TabsHeader>
            </div>
            <TabsBody>
              {types.map((type, index) => (
                <TabPanel key={index} value={String(index)} className="p-0 mt-6 max-sm:mt-4">
                  <div className='overflow-x-auto'>
                    <table className="w-full table-auto text-left">
                      <thead className="bg-blue-gray-50/50">
                        <tr>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">#</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Name</th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((document, index) => (
                          <tr key={index} className="border-b hover:bg-blue-gray-50/50">
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {document.document_name}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              <span onClick={() => handleSelectedDocument(document)} className='cursor-pointer hover:underline text-blue-500'>Edit</span>
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

      <Dialog size="xs" open={open}>
        <DialogHeader>
          <span className="text-lg">
            {selectedDocument ? "Update Document" : "Create Document"}
          </span>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {(errors.document_name || errors.document_type || errors.message) && (
            <div className='space-y-3'>
              {errors.document_name && errors.document_name.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
              {errors.document_type && errors.document_type.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
              {errors.message && errors.message.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
            </div>
          )}
          <Input value={selectedDocument && selectedDocument.document_name} onChange={(e) => {
            selectedDocument ? setSelectedDocument({ ...selectedDocument, document_name: e.target.value }) : setDocument(e.target.value)
          }} label="Name"/>
          {selectedDocument ? (
            <div className='flex items-center justify-between'>
              <span className='text-sm font-normal text-gray-900'>Student Type: {selectedDocument.document_type}</span>
              <span onClick={handleRemoveDocument} className='text-sm text-red-500 hover:underline cursor-pointer'>
                {btnLoading ? 'Removing' : 'Remove'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className='text-sm font-normal text-gray-900'>Select Student Type:</span>
              <div className="grid grid-cols-2 max-sm:grid-cols-1">
                <Checkbox
                  onClick={() => handleCheckbox('all')}
                  checked={selectAll}
                  label="Select All"
                  labelProps={{ className: "text-sm text-gray-900 font-normal" }}
                  color='blue'
                />
                {types.map((typeObj, index) => (
                  <Checkbox
                    key={index}
                    onClick={() => handleCheckbox(typeObj.student_type)}
                    checked={!!type[typeObj.student_type]}
                    label={typeObj.student_type}
                    labelProps={{ className: "text-sm text-gray-900 font-normal" }}
                    color='blue'
                  />
                ))}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button onClick={handleOpen} variant="text" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button color='blue' loading={btnLoading} onClick={selectedDocument ? handleUpdateDocument : handleCreateDocument}>
            <span>Save</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog size="xs" open={openSearch} handler={() => setOpenSearch(!openSearch)}>
        <DialogBody className='p-2'>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
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

export default Document