import { useEffect, useState } from 'react'
import { ChartBarIcon, ChartPieIcon, HomeIcon, UsersIcon } from "@heroicons/react/24/solid"
import { Breadcrumbs, Card, CardBody, IconButton, Option, Select } from "@material-tailwind/react"
import { Link, useNavigate } from "react-router-dom"
import axios from '../../../../../api/axios'
import Chart from "react-apexcharts"
import LoadingScreen from '../../../../components/LoadingScreen'

const years = [
  '2024',
  '2025',
  '2026',
  '2027',
  '2028',
  '2028',
  '2030',
]

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [complete, setComplete] = useState(0)
  const [incomplete, setIncomplete] = useState(0)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [monthlyCounts, setMonthlyCounts] = useState(Array(12).fill(0))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      await getUserCount()
      await getRecordCount()
      await getRequestCount(year)
      setLoading(false)
    }
    loadDashboard()
  }, [year])

  const getRequestCount = async (selectedYear) => {
    await axios.get('/dashboard/get-request-count', {
      params: { year: selectedYear },
    })
      .then(({ data }) => (
        setMonthlyCounts(data)
      ))
  }

  const getUserCount = async () => {
    await axios.get('/dashboard/get-user-count')
      .then(({ data }) => {
        setUser(data)
      })
  }

  const getRecordCount = async () => {
    await axios.get('/dashboard/get-record-count')
      .then(({ data }) => {
        setComplete(data.complete)
        setIncomplete(data.incomplete)
      })
  }

  const pieChartConfig = {
    type: "pie",
    width: 280,
    height: 280,
    series: [incomplete, complete],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: true,
      },
      colors: ["#bdbdbd", "#2196f3"],
      labels: ["Incomplete", "Completed"],
      legend: {
        show: false,
      },
    },
  }

  const barChartConfig = {
    type: "bar",
    height: 255,
    series: [
      {
        name: "Requested",
        data: monthlyCounts,
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#2196f3"],
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "light",
      },
    },
  };

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
          <span>Dashboard</span>
        </Breadcrumbs>
      </div>
      <div className='space-y-4'>
        <div className='grid grid-cols-4 gap-4 max-xl:grid-cols-1'>
          <div onClick={() => navigate('/registrar/students')} className="relative pt-4 cursor-pointer">
            <div className="absolute z-10 top-0 left-4">
              <IconButton size='lg' color="blue">
                <UsersIcon className="w-5 h-5" />
              </IconButton>
            </div>
            <Card>
              <CardBody>
                <div className="flex flex-col gap-1 text-end mt-4">
                  <span className="text-sm font-medium">Total Students</span>
                  <span className="text-sm font-bold">{user.student}</span>
                </div>
              </CardBody>
            </Card>
          </div>
          <div onClick={() => navigate('/registrar/staffs')} className="relative pt-4 cursor-pointer">
            <div className="absolute z-10 top-0 left-4">
              <IconButton size='lg' color="cyan">
                <UsersIcon className="w-5 h-5" />
              </IconButton>
            </div>
            <Card>
              <CardBody>
                <div className="flex flex-col gap-1 text-end mt-4">
                  <span className="text-sm font-medium">Total Cashier</span>
                  <span className="text-sm font-bold">{user.staff}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 max-xl:grid-cols-1'>
          <div className="relative flex-1 pt-4">
            <div className="absolute z-10 top-0 left-4">
              <IconButton size='lg' color="orange">
                <ChartPieIcon className="w-5 h-5" />
              </IconButton>
            </div>
            <Card className='w-full'>
              <div className='ml-20 mr-4 mt-4 flex justify-between max-sm:flex-col max-sm:gap-4 max-sm:items-end'>
                <span className="text-sm font-medium">Submmited Documents</span>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 bg-blue-500 rounded-full'></div>
                    <span className='text-sm'>Completed</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 bg-gray-400 rounded-full'></div>
                    <span className='text-sm'>Incomplete</span>
                  </div>
                </div>
              </div>
              <CardBody className="grid place-items-center">
                <Chart {...pieChartConfig} />
              </CardBody>
            </Card>
          </div>
          <div className="relative flex-1 pt-4">
            <div className="absolute z-10 top-0 left-4">
              <IconButton size='lg' color="indigo">
                <ChartBarIcon className="w-5 h-5" />
              </IconButton>
            </div>
            <Card className='w-full'>
              <div className='ml-20 mr-4 mt-4 flex justify-between max-sm:flex-col max-sm:gap-4 max-sm:items-end'>
                <span className="text-sm font-medium">Requested Credentials</span>
                <div className="w-fit mb-6">
                  <Select label="Year" value={year} onChange={(value) => setYear(value)}>
                    {years.map((year, index) => (
                      <Option key={index} value={year}>{year}</Option>
                    ))}
                  </Select>
                </div>
              </div>
              <CardBody className="px-4 pt-0 pb-4">
                <Chart {...barChartConfig} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard