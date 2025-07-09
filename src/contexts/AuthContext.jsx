import { createContext, useContext, useEffect, useState } from "react"
import axios from "../api/axios"
import { useNavigate } from "react-router-dom"

const auth = createContext({})

export const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState([])
  const [btnLoading, setBtnLoading] = useState(false)
  const [token, _setToken] = useState(localStorage.getItem('token'))
  const [email_address, setEmailAddress] = useState(null)
  const [otp, setOtp] = useState(null)
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)

  const url = "http://192.168.0.11:8000/"

  const setToken = (token) => {
    _setToken(token)
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  useEffect(() => {
      const getRecordStatus = async () => {
        await axios.get('/student/get-record-status')
          .then(({ data }) => {
            setStatus(data)
          })
      }
      getRecordStatus()
    }, [])

  useEffect(() => {
    async function loadUser() {
      await getUser()
    }
    loadUser()
  }, [])

  const getUser = async () => {
    setLoading(true)
    await axios.get("/user")
      .then(({ data }) => {
        setUser(data)
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      })
  }

  const login = async ({ ...data }) => {
    setBtnLoading(true)
    setError([])
    await axios.post('/login', data)
      .then(async ({ data }) => {
        setToken(data.token)
        await getUser()
      })
      .catch((error) => {
        if (error.response.status === 422) {
          setError(error.response.data.errors)
        }
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const forgotPassword = async ({ ...data }) => {
    setBtnLoading(true)
    setError([])
    await axios.post('/forgot-password', data)
      .then(() => {
        setEmailAddress(data.staff_email_address)
        navigate('/email-verification')
      })
      .catch((error) => {
        if (error.response.status === 422) {
          setError(error.response.data.errors)
        }
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const verifyOtp = async ({ ...data }) => {
    setBtnLoading(true)
    setError([])
    await axios.post('/verify-otp', data)
      .then(() => {
        setOtp(data.otp)
        navigate('/create-new-password')
      })
      .catch((error) => {
        if (error.response.status === 422) {
          setError(error.response.data.errors)
        }
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const createNewPassword = async ({ ...data }) => {
    setBtnLoading(true)
    setError([])
    await axios.post("/create-new-password", data)
      .then(() => {
        setEmailAddress(null)
        setOtp(null)
        navigate('/login')
      })
      .catch((error) => {
        if (error.response.status === 422) {
          setError(error.response.data.errors)
        }
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const changePassword = async ({ ...data }) => {
    setBtnLoading(true)
    setError([])
    await axios.post("/change-password", data)
      .then(async () => {
        await getUser()
        navigate(-1)
      })
      .catch((error) => {
        if (error.response.status === 422) {
          setError(error.response.data.errors)
        }
      })
      .finally(() => {
        setBtnLoading(false)
      })
  }

  const logout = async () => {
    setLoading(true)
    await axios.get('/logout')
      .then(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <auth.Provider value={{ token, user, loading, btnLoading, error, email_address, otp, url, status, login, forgotPassword, verifyOtp, createNewPassword, changePassword, logout }}>
      {children}
    </auth.Provider>
  )
}

export const useAuthContext = () => useContext(auth)
