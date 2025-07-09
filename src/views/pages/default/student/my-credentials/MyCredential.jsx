import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import {
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Input,
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "../../../../components/LoadingScreen";
import axios from "../../../../../api/axios";

const tabs = ["review", "pay", "process", "receive", "complete", "cancel"];

export default function MyCredential() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRequest = async () => {
      await axios
        .get("/student/get-request-status", {
          params: { status: selectedTab },
        })
        .then(({ data }) => {
          setRequests(data);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getRequest();
  }, [selectedTab]);

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />;
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <Breadcrumbs className="bg-transparent p-0">
          <Link to="/student/dashboard" className="opacity-60">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <span>My Credentials</span>
        </Breadcrumbs>
        <Button
          onClick={() => navigate("/student/my-credentials/requests")}
          color="blue"
          size="sm"
          className="flex items-center gap-3"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="max-sm:hidden">Request</span>
        </Button>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className="w-full flex flex-col">
              <span className="font-medium text-sm">List of Requests</span>
              <span className="font-medium text-sm">Total: {requests.length}</span>
            </div>
            <div className="w-full max-w-[250px] max-sm:hidden">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
          </div>
          <Tabs value={selectedTab}>
            <div className="overflow-x-auto pt-2">
              <TabsHeader className="w-fit space-x-4">
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    onClick={() => setSelectedTab(tab)}
                    value={tab}
                    className="text-sm whitespace-nowrap capitalize"
                  >
                    {(tab === "review" && "To Review") ||
                      (tab === "pay" && "To Pay") ||
                      (tab === "process" && "In Process") ||
                      (tab === "receive" && "To Receive") ||
                      (tab === "complete" && "Completed") ||
                      (tab === "cancel" && "Cancelled")}
                  </Tab>
                ))}
              </TabsHeader>
            </div>
            <TabsBody>
              {tabs.map((tab, index) => (
                <TabPanel
                  key={index}
                  value={tab}
                  className="p-0 mt-6 max-sm:mt-4"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left">
                      <thead className="bg-blue-gray-50/50">
                        <tr>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">
                            #
                          </th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">
                            Request Number
                          </th>
                          <th className="font-medium text-sm p-4 whitespace-nowrap">
                            Credential Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request, index) => (
                          <tr
                            key={index}
                            onClick={() =>
                              navigate(
                                `/student/my-credentials/request-detail/${request.request_number}`
                              )
                            }
                            className="border-b hover:bg-blue-gray-50/50 cursor-pointer"
                          >
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {request.request_number}
                            </td>
                            <td className="p-4 font-normal text-sm whitespace-nowrap">
                              {
                                request.request_credential.credential
                                  .credential_name
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
