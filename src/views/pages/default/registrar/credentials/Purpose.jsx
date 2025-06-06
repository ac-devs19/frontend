import { useEffect, useState } from 'react'
import { Alert, Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Input } from "@material-tailwind/react"
import { Link } from "react-router-dom"
import { HomeIcon } from "@heroicons/react/24/solid"
import axios from '../../../../../api/axios'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import LoadingScreen from '../../../../components/LoadingScreen'
import { ToastContainer, toast } from 'react-toastify'

const Purpose = () => {
  const [open, setOpen] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [btnLoading, setBtnLoading] = useState(false)
  const [purposes, setPurposes] = useState([])
  const [selectedPurpose, setSelectedPurpose] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [errors, setErrors] = useState([])
  const [openSearch, setOpenSearch] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    setPurpose("")
    setSelectedPurpose(null)
    setErrors([])
  }

  useEffect(() => {
    getPurpose()
  }, [])

  const getPurpose = async () => {
    await axios.get('/credential/get-purpose')
      .then(({ data }) => {
        setPurposes(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleCreatePurpose = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/credential/create-purpose', { purpose_name: purpose })
      .then(() => {
        handleOpen()
        getPurpose()
        toast.success('Purpose created successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleUpdatePurpose = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/credential/update-purpose', { id: selectedPurpose.id, purpose_name: selectedPurpose.purpose_name })
      .then(() => {
        handleOpen()
        getPurpose()
        toast.success('Purpose updated successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleSelectPurpose = (purpose) => {
    setSelectedPurpose(purpose)
    setOpen(!open)
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

  const filteredPurposes = purposes
    .filter((purpose) => (
      search.toLowerCase() === "" ||
      [purpose.purpose_name]
        .some((name) => (
          name.toLowerCase().includes(search.toLowerCase())
        ))
    ))

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
          <span>Purposes</span>
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
              <span className="font-medium text-sm">List of Purposes</span>
              <span className="font-medium text-sm">Total: {filteredPurposes.length}</span>
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
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Purpose Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurposes.map((purpose, index) => (
                  <tr key={index} className="border-b hover:bg-blue-gray-50/50">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {purpose.purpose_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      <span onClick={() => handleSelectPurpose(purpose)} className='cursor-pointer hover:underline text-blue-500'>Edit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Dialog size="xs" open={open}>
        <DialogHeader>
          <span className="text-lg">
            {selectedPurpose ? "Update Purpose" : "Create Purpose"}
          </span>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {(errors.purpose_name || errors.message) && (
            <div className='space-y-3'>
              {errors.purpose_name && errors.purpose_name.map((error_message, index) => (
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
          <Input value={selectedPurpose && selectedPurpose.purpose_name} onChange={(e) => {
            selectedPurpose ? setSelectedPurpose({ ...selectedPurpose, purpose_name: e.target.value }) : setPurpose(e.target.value)
          }} label="Name" />
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button onClick={handleOpen} variant="text" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button color='blue' onClick={selectedPurpose ? handleUpdatePurpose : handleCreatePurpose} loading={btnLoading}>
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

export default Purpose