import { Navigate, Route, Routes } from "react-router-dom"
import AuthLayout from './views/layouts/AuthLayout'
import Login from './views/pages/auth/Login'
import DefaultLayout from './views/layouts/DefaultLayout'
import RegistrarDashboard from './views/pages/default/registrar/dashboard/Dashboard'
import Student from './views/pages/default/registrar/students/Student'
import { useAuthContext } from './contexts/AuthContext'
import NotFound from './views/pages/default/NotFound'
import Staff from './views/pages/default/registrar/staffs/Staff'
import Document from './views/pages/default/registrar/documents/Document'
import Credential from './views/pages/default/registrar/credentials/Credential'
import Record from './views/pages/default/registrar/documents/Record'
import Requirement from './views/pages/default/registrar/documents/Requirement'
import SoftCopy from './views/pages/default/registrar/documents/SoftCopy'
import Purpose from './views/pages/default/registrar/credentials/Purpose'
import RegistrarRequest from './views/pages/default/registrar/credentials/Request'
import RegistrarRequestDetail from './views/pages/default/registrar/credentials/RequestDetail'
import CashierDashboard from './views/pages/default/cashier/dashboard/Dashboard'
import CashierRequest from './views/pages/default/cashier/requests/Request'
import CashierReport from './views/pages/default/cashier/requests/Report'
import CashierRequestDetail from './views/pages/default/cashier/requests/RequestDetail'
import RegistrarReport from './views/pages/default/registrar/credentials/Report'
import Profile from './views/pages/default/profile/Profile'
import StudentInformation from './views/pages/default/registrar/students/Information'
import StaffInformation from './views/pages/default/registrar/staffs/Information'
import ForgotPassword from './views/pages/auth/ForgotPassword'
import CreateNewPassword from './views/pages/auth/CreateNewPassword'
import EmailVerification from './views/pages/auth/EmailVerification'

const App = () => {
  const { token, user, email_address, otp } = useAuthContext()

  return (
    <Routes>

      <Route path='/' element={<AuthLayout />}>
        <Route path='/' element={<Navigate to='/login' />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        {email_address && (
          <Route path='/email-verification' element={<EmailVerification />} />
        )}
        {otp && (
          <Route path='/create-new-password' element={<CreateNewPassword />} />
        )}
      </Route>

      {token ? (
        <Route path='/' element={<DefaultLayout />}>

          {user?.role === 'admin' && (
            <>
              <Route path='/registrar/dashboard' element={<RegistrarDashboard />} />

              <Route path='/registrar/students' element={<Student />} />
              <Route path='/registrar/students/informations/:student_number' element={<StudentInformation />} />

              <Route path='/registrar/staffs' element={<Staff />} />
              <Route path='/registrar/staffs/informations/:id' element={<StaffInformation />} />

              <Route path='/registrar/documents' element={<Document />} />
              <Route path='/registrar/documents/records' element={<Record />} />
              <Route path='/registrar/documents/records/:student_number' element={<Requirement />} />
              <Route path='/registrar/documents/records/:student_number/:document_id' element={<SoftCopy />} />

              <Route path='/registrar/credentials' element={<Credential />} />
              <Route path='/registrar/credentials/purposes' element={<Purpose />} />
              <Route path='/registrar/credentials/requests' element={<RegistrarRequest />} />
              <Route path='/registrar/credentials/requests/:request_number' element={<RegistrarRequestDetail />} />
              <Route path='/registrar/credentials/reports' element={<RegistrarReport />} />
            </>
          )}

          {user?.role === 'cashier' && (
            <>
              <Route path='/cashier/dashboard' element={<CashierDashboard />} />

              <Route path='/cashier/credentials/requests' element={<CashierRequest />} />
              <Route path='/cashier/credentials/requests/:request_number' element={<CashierRequestDetail />} />
              <Route path='/cashier/credentials/reports' element={<CashierReport />} />
            </>
          )}

          <Route path='/my-profile' element={<Profile />} />

          <Route path='*' element={<NotFound />} />

        </Route>
      ) : (
        <Route path='*' element={<Navigate to='/login' />} />
      )}

    </Routes>
  )
}

export default App