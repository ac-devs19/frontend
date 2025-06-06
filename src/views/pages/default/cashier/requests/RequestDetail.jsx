import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Alert, Breadcrumbs, Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader, Input } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'

const RequestDetail = () => {
  const [request, setRequest] = useState({})
  const navigate = useNavigate()
  const { request_number } = useParams()
  const [btnLoading, setBtnLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [or_number, setOrNumber] = useState("")
  const [formattedOrNumber, setFormattedOrNumber] = useState("")
  const [errors, setErrors] = useState([])
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const formatDateTime = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" })
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
    setErrors([])
    setOrNumber("")
    setFormattedOrNumber("")
  }

  useEffect(() => {
    const loadRequest = async () => {
      await getRequest()
      setLoading(false)
    }
    loadRequest()
  }, [request_number])

  const getRequest = async () => {
    await axios.get('/cashier/get-request-detail', {
      params: { request_number }
    })
      .then(({ data }) => {
        setRequest(data)
      })
  }

  const calculateAmount = () => {
    const reqCred = request.request_credential
    const credentialAmount = parseFloat(reqCred?.credential_amount)
    const page = parseInt(reqCred?.page)

    const totalAmount = reqCred?.credential_purpose.reduce((subTotal, purpose) => {
      const quantity = parseInt(purpose.quantity)

      return subTotal + credentialAmount * quantity * page
    }, 0)

    return totalAmount
  }

  const handleConfirm = async () => {
    setErrors([])
    setBtnLoading(true)
    await axios.post('/cashier/request-confirm', { id: request.id, or_number, user_id: request.student.user_id })
      .then(() => {
        setIsOpen(!isOpen)
        getRequest()
      })
      .catch((error) => {
        setErrors(error.response.data.errors)
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const ORNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 7) {
      value = value.slice(0, 7)
    }
    let formattedValue = value
    if (value.length > 2 && value.length <= 5) {
      formattedValue = value.replace(/(\d{2})(\d{1,3})/, '$1-$2')
    } else if (value.length > 5) {
      formattedValue = value.replace(/(\d{2})(\d{3})(\d{1,2})/, '$1-$2-$3')
    }
    setOrNumber(value)
    setFormattedOrNumber(e.target.value = formattedValue)
  }

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
            <Link to='/cashier/dashboard' className="opacity-60">
              <HomeIcon className="w-5 h-5" />
            </Link>
            <Link to='/cashier/credentials/requests' className="opacity-60">Requests</Link>
            <span>{request.request_number}</span>
          </Breadcrumbs>
        </div>
        {(!request.payment) && (
          <Button onClick={handleOpen} size="sm" color='blue' className={request.request_status === 'cancel' && 'hidden'}>
            <span>Confirm</span>
          </Button>
        )}
      </div>
      <div className='space-y-4'>
        <Card className='text-sm'>
          <CardHeader floated={false} shadow={false} className={`p-4 m-0 font-medium text-white rounded-b-none flex items-center justify-between ${(request.request_status === 'cancel' && !request.payment) ? 'bg-red-500' : !request.payment && 'bg-deep-orange-500' || request.payment && 'bg-green-500'}`}>
            <span>Request Number: {request.request_number}</span>
            <span className="capitalize">{(request.request_status === 'cancel' && !request.payment) ? 'Cancelled' : !request.payment && 'Pay' || request.payment && 'Paid'}</span>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className='flex items-center justify-between'>
              <span>Date Requested: {formatDate(request.created_at)}</span>
              {request.request_status === 'cancel' && (
                <span>Date Cancelled: {formatDate(request.updated_at)}</span>
              )}
            </div>
            <div className="grid grid-cols-3">
              <span>Name: {request.student?.information.last_name}, {request.student?.information.first_name} {request.student?.information.middle_name}</span>
              <span>Course: {request.student?.course}</span>
              <span>Email Address: {request.student?.information.email_address}</span>
            </div>
          </CardBody>
        </Card>
        <div className="flex gap-4">
          <div className='flex-1 space-y-4'>
            <Card className="flex-1 text-sm h-fit">
              <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
                <span>Requested Credential</span>
              </CardHeader>
              <CardBody className='py-4 flex items-center justify-between'>
                <div className='flex flex-col space-y-1'>
                  <span>{request.request_credential?.credential.credential_name}</span>
                  <span>₱ {request.request_credential?.credential_amount}</span>
                </div>
                <div className='space-x-1'>
                  <span>Page/s:</span>
                  <span>{request.request_credential?.page}</span>
                </div>
              </CardBody>
              <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
                <span>Selected Purpose/s</span>
              </CardHeader>
              <CardBody className='pt-4 space-y-4'>
                {request.request_credential?.credential_purpose.map((credPurpose, index) => (
                  <div className='flex items-center'>
                    <span className='w-6'>{index + 1}</span>
                    <div className='flex flex-col space-y-1'>
                      <span>{credPurpose.purpose.purpose_name}</span>
                      <div className='space-x-1'>
                        <span>Copy/s:</span>
                        <span>{credPurpose.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
            {request.request_status === 'cancel' && (
              <Card className='flex-1 text-sm h-fit'>
                <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
                  <span>Reason</span>
                </CardHeader>
                <CardBody className='py-4'>
                  <span>{request.message}</span>
                </CardBody>
              </Card>
            )}
          </div>
          <Card className="flex-1 text-sm h-fit">
            <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
              <span>Payment</span>
            </CardHeader>
            <CardBody className='py-4 space-y-4'>
              {request.payment && (
                <div className="flex items-center justify-between">
                  <span>Date and Time:</span>
                  <span>{formatDateTime(request.payment?.created_at)}</span>
                </div>
              )}
              {request.payment && (
                <div className='flex items-center justify-between'>
                  <span>OR Number:</span>
                  <span>{request.payment?.or_number}</span>
                </div>
              )}
              <div className='flex items-center justify-between'>
                <span>Total {(request.request_status === 'cancel' && !request.payment) ? 'Amount' : 'Pay'}:</span>
                <span>₱ {calculateAmount()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Dialog size='xs' open={open} dismiss={false}>
        <DialogHeader>
          <span className='text-lg'>Confirmation Alert!</span>
        </DialogHeader>
        <DialogBody className='space-y-6'>
          <p className='text-sm font-normal text-gray-900'>Please enter the OR Number</p>
          <Input value={formattedOrNumber} onChange={(e) => ORNumber(e)} label='OR Number' disabled={btnLoading} />
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button variant="text" onClick={handleOpen} className="mr-1" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button onClick={() => {
            setOpen(!open)
            setIsOpen(!isOpen)
          }} loading={btnLoading} color='blue' disabled={!formattedOrNumber || formattedOrNumber.length !== 9}>
            <span>Okay</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog size='xs' open={isOpen} dismiss={false}>
        <DialogHeader>
          <span className='text-lg'>Confirmation Alert!</span>
        </DialogHeader>
        <DialogBody className='space-y-6'>
          {(errors.or_number) && (
            <div className='space-y-3'>
              {errors.or_number && errors.or_number.map((error_message, index) => (
                <Alert key={index} variant="ghost" color="red">
                  <span className="text-xs">{error_message}</span>
                </Alert>
              ))}
            </div>
          )}
          <div className='space-y-2'>
            <p className='font-normal text-gray-900 text-sm'>Kindly double-check the OR Number for accuracy.</p>
            <p className='font-medium text-gray-900 text-base'>{formattedOrNumber}</p>
          </div>
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button variant="text" onClick={() => {
            setIsOpen(!isOpen)
            setOpen(!open)
          }} className="mr-1" disabled={btnLoading}>
            <span>Edit</span>
          </Button>
          <Button onClick={handleConfirm} loading={btnLoading} color='blue'>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

export default RequestDetail