import Logo from '../../assets/images/OCC_LOGO.png'
import { Spinner } from '@material-tailwind/react'

const LoadingScreen = ({ className }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center ${className}`}>
      <Spinner color="yellow" className="absolute w-[103px] h-[103px] text-transparent" />
      <img src={Logo} className="absolute w-[85px] h-[85px] object-contain" />
    </div>
  )
}

export default LoadingScreen