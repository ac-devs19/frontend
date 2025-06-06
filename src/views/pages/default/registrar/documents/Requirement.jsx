import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { HomeIcon } from '@heroicons/react/24/solid'
import { Badge, Breadcrumbs, Button, Card, CardBody, Input, Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from '../../../../../api/axios'
import LoadingScreen from '../../../../components/LoadingScreen'

const tabs = ['empty', 'review', 'confirm', 'resubmit']

const Requirement = () => {
  const navigate = useNavigate()
  const { student_number } = useParams()
  const [documents, setDocuments] = useState([])
  const [submits, setSubmits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const getRequirement = async () => {
      await axios.get('/registrar/get-requirement', {
        params: { student_number }
      })
        .then(({ data }) => {
          setDocuments(data.documents)
          setSubmits(data.submits)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    getRequirement()
  }, [])

  const getDocumentStatus = (documentId) => {
    const recordMap = new Map()
    submits.forEach((submit) =>
      submit.record.forEach((record) => {
        recordMap.set(record.document_id, submit.submit_status)
      })
    )
    return recordMap.get(documentId) || 'empty'
  }

  const getStatusCount = () => {
    const counts = { empty: 0, review: 0, confirm: 0, resubmit: 0 }

    documents.forEach((document) => {
      const status = getDocumentStatus(document.id)
      counts[status] = (counts[status] || 0) + 1
    })

    return counts
  }

  const statusCount = getStatusCount()

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
            <span>{student_number}</span>
          </Breadcrumbs>
        </div>
      </div>
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">List of Requirements</span>
            <div className="w-full max-w-[250px]">
              <Input onChange={(e) => setSearch(e.target.value)} label="Search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
            </div>
          </div>
          <Tabs value={tabs[0]} className="pt-2">
            <TabsHeader className="w-fit space-x-4">
              {tabs.map((tab, index) => (
                <Badge key={index} content={statusCount[tab]} className={`z-50 ${statusCount[tab] <= 0 && 'hidden'}`}>
                  <Tab value={tab} className="text-sm whitespace-nowrap capitalize">
                    {tab === 'empty' && 'Pending' || tab === 'review' && 'To Review' || tab === 'confirm' && 'Confirmed' || tab === 'resubmit' && 'Resubmit'}
                  </Tab>
                </Badge>
              ))}
            </TabsHeader>
            <TabsBody>
              {tabs.map((tab, index) => (
                <TabPanel key={index} value={tab} className="p-0 mt-6">
                  <table className="w-full table-auto text-left">
                    <thead className="bg-blue-gray-50/50">
                      <tr>
                        <th className="font-medium text-sm p-4">#</th>
                        <th className="font-medium text-sm p-4">Document Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents
                        .filter((document) => (
                          search.toLowerCase() === "" ||
                          document.document_name.toLowerCase().includes(search.toLowerCase())
                        ))
                        .filter((document) => getDocumentStatus(document.id) === tab)
                        .map((document, index) => {
                          const hasRecord = getDocumentStatus(document.id)

                          let status = 'empty'

                          if (hasRecord === 'confirm') {
                            status = 'confirm'
                          } else if (hasRecord === 'review') {
                            status = 'review'
                          } else if (hasRecord === 'resubmit') {
                            status = 'resubmit'
                          }

                          return (
                            <tr key={index} onClick={() => status !== 'empty' && navigate(`/registrar/documents/records/${student_number}/${document.id}`)} className={`border-b hover:bg-blue-gray-50/50 ${status !== 'empty' ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                              <td className="p-4 font-normal text-sm">
                                {index + 1}
                              </td>
                              <td className="p-4 font-normal text-sm">
                                {document.document_name}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}

export default Requirement