import { useEffect, useState } from 'react'
import { ChartBarIcon, HomeIcon, WalletIcon } from "@heroicons/react/24/solid"
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
  const [paid, setPaid] = useState()
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [monthlyCounts, setMonthlyCounts] = useState(Array(12).fill(0))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      await getUserCount()
      await getRequestCount(year)
      setLoading(false)
    }
    loadDashboard()
  }, [year])

  const getUserCount = async () => {
    await axios.get('/dashboard/get-paid-count')
      .then(({ data }) => {
        setPaid(data)
      })
  }

  const getRequestCount = async (selectedYear) => {
    await axios.get('/dashboard/get-sales-count', {
      params: { year: selectedYear },
    })
      .then(({ data }) => (
        setMonthlyCounts(data)
      ))
  }

  const barChartConfig = {
    type: "bar",
    height: 255,
    series: [
      {
        name: "Total Pay",
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
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
          formatter: (value) => {
            return `₱ ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        y: {
          formatter: (value) => {
            return `₱ ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
  }

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <Breadcrumbs className="bg-transparent p-0">
          <Link to='/cashier/dashboard' className="opacity-60">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <span>Dashboard</span>
        </Breadcrumbs>
      </div>
      <div className='space-y-4'>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div onClick={() => navigate('/cashier/credentials/reports')} className="relative pt-4 cursor-pointer">
            <div className="absolute z-10 top-0 left-4">
              <IconButton size='lg' color="green">
                <WalletIcon className="w-5 h-5" />
              </IconButton>
            </div>
            <Card>
              <CardBody>
                <div className="flex flex-col gap-1 text-end mt-4">
                  <span className="text-sm font-medium">Total Paid</span>
                  <span className="text-sm font-bold">{paid}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className="relative flex-1 pt-4">
            <div className="absolute z-10 top-0 left-4">
              <IconButton size='lg' color="blue">
                <ChartBarIcon className="w-5 h-5" />
              </IconButton>
            </div>
            <Card className='w-full'>
              <div className='ml-20 mr-4 mt-4 flex justify-between'>
                <span className="text-sm font-medium">Credentials Payment Summary</span>
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