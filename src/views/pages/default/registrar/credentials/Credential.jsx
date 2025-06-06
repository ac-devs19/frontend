import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Alert, Breadcrumbs, Button, Card, CardBody, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Input, Option, Select, Switch } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'
import { ToastContainer, toast } from 'react-toastify'

const Credential = () => {
  const [open, setOpen] = useState(false)
  const [credential, setCredential] = useState("")
  const [amount, setAmount] = useState("")
  const [onPage, setOnPage] = useState("no")
  const [credentials, setCredentials] = useState([])
  const [purposes, setPurposes] = useState([])
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [errors, setErrors] = useState([])
  const [toggle, setToggle] = useState(false)
  const [working_day, setWorkingDay] = useState("")
  const [selected, setSelected] = useState(null)
  const [links, setLinks] = useState([])
  const [openSearch, setOpenSearch] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    setCredential("")
    setAmount("")
    setSelectedCredential(null)
    setOnPage("no")
    setErrors([])
    setWorkingDay("")
    setSelected(null)
    getLink()
  }

  useEffect(() => {
    const loadCredentialPurpose = async () => {
      await getCredential()
      await getPurpose()
      await getLink()
      setLoading(false)
    }
    loadCredentialPurpose()
  }, [])

  const getPurpose = async () => {
    await axios.get('/credential/get-purpose')
      .then(({ data }) => {
        setPurposes(data)
      })
  }

  const getCredential = async () => {
    await axios.get('/credential/get-credential')
      .then(({ data }) => {
        setCredentials(data)
      })
  }

  const getLink = async () => {
    await axios.get('/credential/get-link')
      .then(({ data }) => {
        setLinks(data)
      })
  }

  const handleCreateCredential = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/credential/create-credential', { credential_name: credential, amount, on_page: onPage, working_day, purpose_id: selected })
      .then(() => {
        handleOpen()
        getCredential()
        getLink()
        toast.success('Credential created successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleUpdateCredential = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/credential/update-credential', { id: selectedCredential.id, credential_name: selectedCredential.credential_name, amount: selectedCredential.amount, on_page: selectedCredential.on_page, working_day: selectedCredential.working_day, purpose_id: selected })
      .then(() => {
        handleOpen()
        getCredential()
        getLink()
        toast.success('Credential updated successfully.')
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleSelectedCredential = (credential) => {
    setSelectedCredential(credential)
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

  const filteredCredentials = credentials
    .filter(credential =>
      search.toLowerCase() === "" ||
      [credential.credential_name]
        .some(name => name.toLowerCase().includes(search.toLowerCase()))
    )

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
          <span>Credentials</span>
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
              <span className="font-medium text-sm">List of Credentials</span>
              <span className="font-medium text-sm">Total: {filteredCredentials.length}</span>
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
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Credential Name</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Amount</th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredentials.map((credential, index) => (
                  <tr key={index} className="border-b hover:bg-blue-gray-50/50">
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      {credential.credential_name}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      ₱ {parseFloat(credential.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-normal text-sm whitespace-nowrap">
                      <span onClick={() => handleSelectedCredential(credential)} className='cursor-pointer hover:underline text-blue-500'>Edit</span>
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
            {selectedCredential ? "Update Credential" : "Create Credential"}
          </span>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {(errors.credential_name || errors.amount || errors.working_day || errors.message) && (
            <div className='space-y-3'>
              {errors.credential_name && errors.credential_name.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
              {errors.amount && errors.amount.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
              {errors.working_day && errors.working_day.map((error_message, index) => (
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
          <Input value={selectedCredential && selectedCredential.credential_name} onChange={(e) => {
            selectedCredential ? setSelectedCredential({ ...selectedCredential, credential_name: e.target.value }) : setCredential(e.target.value)
          }} label="Name" />
          <Input value={selectedCredential && selectedCredential.amount} onChange={(e) => {
            selectedCredential ? setSelectedCredential({ ...selectedCredential, amount: e.target.value }) : setAmount(e.target.value)
          }} label="Amount" type='number' />
          <Input value={selectedCredential && selectedCredential.working_day} onChange={(e) => {
            selectedCredential ? setSelectedCredential({ ...selectedCredential, working_day: e.target.value }) : setWorkingDay(e.target.value)
          }} label='Working Days' containerProps={{ className: "min-w-[50px]" }} type='number' />
          <div className='flex justify-end'>
            <span onClick={() => setToggle(!toggle)} className='text-sm font-normal text-blue-500 cursor-pointer hover:underline'>
              {`${!toggle ? 'Show' : 'Less'} Settings`}
            </span>
          </div>
          {toggle && (
            <div className='space-y-2'>
              <div className='flex items-center gap-4'>
                <span className='text-sm text-gray-900 font-normal'>Editable Page:</span>
                <Switch label={`${selectedCredential ? selectedCredential.on_page === 'no' ? 'Off' : 'On' : onPage === 'no' ? 'No' : 'Yes'}`} labelProps={{ className: 'text-sm text-gray-900 font-normal' }} checked={selectedCredential ? selectedCredential.on_page === 'no' ? false : true : null} onChange={() => { selectedCredential ? setSelectedCredential({ ...selectedCredential, on_page: selectedCredential.on_page === 'no' ? 'yes' : 'no' }) : setOnPage(onPage === 'no' ? 'yes' : 'no') }} color='blue' />
              </div>
              <div className='space-y-2'>
                <div className='flex justify-end'>
                  <span onClick={() => {
                    selectedCredential
                      ? setLinks([])
                      : setSelected(null)
                  }} className='text-sm font-normal text-blue-500 hover:underline cursor-pointer'>Clear</span>
                </div>
                <Select label="Link Purpose" value={
                  selectedCredential
                    ? links.find(link => link.credential_id === selectedCredential.id)?.purpose_id
                    : selected
                } onChange={(val) => setSelected(val)}>
                  {purposes.map((purpose, index) => (
                    <Option key={index} value={purpose.id}>{purpose.purpose_name}</Option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button onClick={handleOpen} variant="text" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button color='blue' onClick={selectedCredential ? handleUpdateCredential : handleCreateCredential} loading={btnLoading}>
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

export default Credential