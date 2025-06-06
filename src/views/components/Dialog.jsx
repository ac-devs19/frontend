import { LockClosedIcon } from '@heroicons/react/24/solid'
import { Alert, Button, Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react'

const Confirmation = ({ open, label, handleOpen, onClick, loading, color, errors }) => {
  return (
    <Dialog size='xs' open={open} dismiss={false}>
      <DialogHeader>
        <span className='text-lg'>Confirmation Alert!</span>
      </DialogHeader>
      <DialogBody className="space-y-6">
        {errors?.message && (
          <div className='space-y-3'>
            {errors.message && errors.message.map((error_message, index) => (
              <Alert key={index} variant="ghost" color="red">
                <span className="text-xs">{error_message}</span>
              </Alert>
            ))}
          </div>
        )}
        <p className='text-sm font-normal text-gray-900'>Are you sure you want to <span className={`capitalize font-medium ${color}`}>{label}</span></p>
      </DialogBody>
      <DialogFooter className="space-x-3">
        <Button variant="text" onClick={handleOpen} className="mr-1" disabled={loading}>
          <span>No</span>
        </Button>
        <Button loading={loading} color='blue' onClick={onClick}>
          <span>Yes</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

const SecurityAlert = ({ open, onClick }) => {
  return (
    <Dialog size='xs' open={open} dismiss={false}>
      <DialogHeader className='flex justify-center'>
        <span className='text-lg'>Security Alert!</span>
      </DialogHeader>
      <DialogBody className='flex flex-col items-center'>
        <LockClosedIcon color='red' className='w-20 h-20' />
        <span className='text-sm font-normal text-gray-900'>Please change your password.</span>
      </DialogBody>
      <DialogFooter>
        <Button color='blue' fullWidth onClick={onClick}>
          <span>Change Password</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export { Confirmation, SecurityAlert }