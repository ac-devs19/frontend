import { HomeIcon } from "@heroicons/react/24/solid";
import {
  Breadcrumbs,
  Card,
  CardBody,
  Chip,
  Input,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../../api/axios";
import LoadingScreen from "../../../../components/LoadingScreen";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function MyDocument() {
  const [documents, setDocuments] = useState([]);
  const [submits, setSubmits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadRequirement = async () => {
      setLoading(true);
      await getRequirement();
      setLoading(false);
    };
    loadRequirement();
  }, []);

  const getRequirement = async () => {
    await axios.get("/student/get-requirement").then(({ data }) => {
      setDocuments(data.documents);
      setSubmits(data.submits);
    });
  };

  const filteredDocuments = documents.filter(
    (document) =>
      search.toLowerCase() === "" ||
      [document.document_name].some((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
  );

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
          <span>My Documents</span>
        </Breadcrumbs>
      </div>
      <Card>
        <CardBody className="space-y-6 max-sm:space-y-4 max-sm:p-4">
          <div className="flex items-center justify-between">
            <div className="w-full flex flex-col">
              <span className="font-medium text-sm">List of My Documents</span>
              <span className="font-medium text-sm">
                Total: {filteredDocuments.length}
              </span>
            </div>
            <div className="w-full max-w-[250px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead className="bg-blue-gray-50/50">
                <tr>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">
                    #
                  </th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">
                    Document Name
                  </th>
                  <th className="font-medium text-sm p-4 whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document, index) => {
                  const getRecord = new Map();
                  submits.forEach((submit) => {
                    submit.record.forEach((record) => {
                      getRecord.set(record.document_id, submit.submit_status);
                    });
                  });

                  const hasRecord = getRecord.get(document.id);

                  return (
                    <tr
                      key={index}
                      onClick={() =>
                        navigate(
                          `/student/my-documents/${document.document_name}/${document.id}`
                        )
                      }
                      className="border-b cursor-pointer hover:bg-blue-gray-50/50"
                    >
                      <td className="p-4 font-normal text-sm whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="p-4 font-normal text-sm whitespace-nowrap">
                        {document.document_name}
                      </td>
                      <td className="p-4 font-normal text-sm whitespace-nowrap">
                        {hasRecord ? (
                          <Chip
                            className="w-fit"
                            value={
                              (hasRecord === "review" && "To Review") ||
                              (hasRecord === "resubmit" && "Resubmit") ||
                              (hasRecord === "confirm" && "Confirmed")
                            }
                            color={
                              (hasRecord === "review" && "orange") ||
                              (hasRecord === "resubmit" && "red") ||
                              (hasRecord === "confirm" && "green")
                            }
                          />
                        ) : (
                          "Please submit your document/s"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
