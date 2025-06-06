import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Breadcrumbs, Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader, Radio, Textarea } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LightGallery from 'lightgallery/react'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import { Confirmation } from '../../../../components/Dialog'
import LoadingScreen from '../../../../components/LoadingScreen'
import { useAuthContext } from '../../../../../contexts/AuthContext'

const reasons = ['Photocopy', 'Inconsistent entries', 'Others']

const SoftCopy = () => {
  const { url } = useAuthContext()
  const navigate = useNavigate()
  const { student_number, document_id } = useParams()
  const [submit, setSubmit] = useState({})
  const [open, setOpen] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(reasons[0])
  const [others, setOthers] = useState(null)

  const handleOpen = () => {
    setOpen(!open)
  }

  useEffect(() => {
    const loadSoftCopy = async () => {
      await getSoftCopy()
      setLoading(false)
    }
    loadSoftCopy()
  }, [student_number, document_id])

  const getSoftCopy = async () => {
    await axios.get('/registrar/get-softcopy', {
      params: { student_number, document_id }
    })
      .then(({ data }) => {
        setSubmit(data)
      })
  }

  const handleConfirm = async () => {
    setBtnLoading(true)
    await axios.post('/registrar/confirm-submit', { submit_id: submit.soft_copy?.id, student_number })
      .then(() => {
        handleOpen()
        getSoftCopy()
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const handleDecline = async () => {
    setBtnLoading(true)
    await axios.post('/registrar/decline-submit', { submit_id: submit.soft_copy?.id, message: value, others, student_number })
      .then(() => {
        setIsOpen(false)
        getSoftCopy()
      })
      .finally(() => {
        setBtnLoading(false)
      })
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
            <Link to='/registrar/dashboard' className="opacity-60">
              <HomeIcon className="w-5 h-5" />
            </Link>
            <Link to='/registrar/documents' className="opacity-60">Documents</Link>
            <Link to='/registrar/documents/records' className="opacity-60">Records</Link>
            <Link to={`/registrar/documents/records/${student_number}`} className="opacity-60">{student_number}</Link>
            <span>{submit.document?.document_name}</span>
          </Breadcrumbs>
        </div>
        {submit.soft_copy?.submit_status === 'review' && (
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsOpen(!isOpen)} size="sm" variant="outlined">
              <span>Re Submit</span>
            </Button>
            <Button onClick={() => setOpen(!open)} color='blue' size="sm">
              <span>Confirm</span>
            </Button>
          </div>
        )}
      </div>
      <div className='space-y-4'>
        <Card>
          <CardHeader floated={false} shadow={false} className={`p-4 m-0 flex items-center justify-between font-medium text-white rounded-b-none ${submit.soft_copy?.submit_status === 'confirm' && 'bg-green-500' || submit.soft_copy?.submit_status === 'review' && 'bg-orange-500' || submit.soft_copy?.submit_status === 'resubmit' && 'bg-red-500'}`}>
            <span className='capitalize text-sm'>{submit.soft_copy?.submit_status === 'confirm' && 'Confirmed' || submit.soft_copy?.submit_status === 'review' && 'To Review' || submit.soft_copy?.submit_status === 'resubmit' && 'Resubmit'}</span>
          </CardHeader>
          <CardBody className="flex items-center justify-between text-sm">
            <span>Date Submitted: {formatDate(submit.soft_copy?.created_at)}</span>
            {submit.soft_copy?.submit_status === 'confirm' && (
              <span>Date Confirmed: {formatDate(submit.soft_copy?.updated_at)}</span>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader floated={false} shadow={false} className='p-4 m-0 flex justify-end'>
            <a target='_blank' href={url + submit.soft_copy?.pdf_record.pdf}>
              <Button color='red' size="sm" variant='outlined'>
                <span className='font-medium normal-case'>View PDF</span>
              </Button>
            </a>
          </CardHeader>
          <CardBody>
            <LightGallery
              speed={500}
              plugins={[lgThumbnail, lgZoom]}
              elementClassNames={'grid grid-cols-4 gap-4'}
            >
              {submit.soft_copy?.record.map((copy) => (
                <a href={url + copy.uri}>
                  <img src={url + copy.uri} className="object-cover h-72 w-full rounded-xl" />
                </a>
              ))}
            </LightGallery>
          </CardBody>
        </Card>
        {submit.soft_copy?.submit_status === 'resubmit' && (
          <Card className='flex-1 text-sm h-fit'>
            <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
              <span>Reason</span>
            </CardHeader>
            <CardBody className='py-4'>
              <span>{submit.soft_copy?.message}</span>
            </CardBody>
          </Card>
        )}
      </div>

      <Confirmation open={open} color={'text-green-500'} label={'Confirm?'} handleOpen={handleOpen} onClick={handleConfirm} loading={btnLoading} />

      <Dialog size='xs' open={isOpen} dismiss={false}>
        <DialogHeader>
          <span className='text-lg'>Confirmation Alert!</span>
        </DialogHeader>
        <DialogBody className='space-y-6'>
          <span className='text-sm font-normal text-gray-900'>Are you sure you want to <span className="capitalize font-medium text-red-500">Decline?</span></span>
          <div>
            <span className='text-sm font-normal text-gray-900'>Choose a reason:</span>
            <div className='grid grid-cols-1'>
              {reasons.map((reason, index) => (
                <Radio color='blue' key={index} name="radio" label={<span className='text-sm font-normal text-gray-900'>{reason}</span>} value={reason} checked={value === reason} onChange={(e) => {
                  setValue(e.target.value)
                  setOthers(null)
                }} />
              ))}
            </div>
            {reasons[2] === value && (
              <Textarea label='Type a reason' onChange={(e) => setOthers(e.target.value)} />
            )}
          </div>
        </DialogBody>
        <DialogFooter className="space-x-3">
          <Button variant="text" onClick={() => setIsOpen(!isOpen)} className="mr-1" disabled={btnLoading}>
            <span>Cancel</span>
          </Button>
          <Button onClick={handleDecline} loading={btnLoading} color='blue'>
            <span>Submit</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

export default SoftCopy