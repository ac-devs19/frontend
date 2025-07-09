import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import {
  Alert,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../../../../api/axios";
import LoadingScreen from "../../../../components/LoadingScreen";
import { useAuthContext } from "../../../../../contexts/AuthContext";

export default function RequestDetail() {
  const navigate = useNavigate();
  const { request_number } = useParams();
  const [request, setRequest] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [studentLinks, setStudentLinks] = useState([]);
  const [open, setOpen] = useState(true);
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const { user } = useAuthContext();
  const formatDateTime = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" })

  useEffect(() => {
    const loadRequest = async () => {
      setLoading(true);
      await getRequest();
      await getStudentLink();
      setLoading(false);
    };
    loadRequest();
  }, []);

  const getRequest = async () => {
    await axios
      .get("/student/get-request-detail", {
        params: { req_number: request_number },
      })
      .then(({ data }) => {
        setRequest(data);
      });
  };

  const getStudentLink = async () => {
    await axios.get("/credential/get-student-link").then(({ data }) => {
      setStudentLinks(data);
    });
  };

  const calculateAmount = () => {
    const reqCred = request.request_credential;
    const credentialAmount = parseFloat(reqCred?.credential_amount);
    const page = parseInt(reqCred?.page);

    const totalAmount = reqCred?.credential_purpose.reduce(
      (subTotal, purpose) => {
        const quantity = parseInt(purpose.quantity);

        return subTotal + credentialAmount * quantity * page;
      },
      0
    );

    return totalAmount;
  };

  function calculateEstimatedFinishDate(startDate, daysToAdd) {
    const holidays = [
      "01-01", // New Year's Day
      "04-09", // Araw ng Kagitingan
      "02-20", // Birthday ni bado
      "05-01", // Labor Day
      "06-12", // Independence Day
      "06-19", // Birthday ni kokoy
      "08-21", // Ninoy Aquino Day
      "10-08", // Birthday ni bogart
      "11-01", // All Saints' Day
      "11-02", // All Saints' Day
      "11-30", // Bonifacio Day
      "12-25", // Christmas Day
      "12-29", // Birthday ni lolay, bulay, lor, langlang, layx, bukag, lore
      "12-30", // Rizal Day
    ];

    let date = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      date.setDate(date.getDate() + 1);

      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const formattedDate = `${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
      const isHoliday = holidays.includes(formattedDate);

      if (!isWeekend && !isHoliday) {
        addedDays++;
      }
    }

    return date;
  }

  const isDisabled = studentLinks.some(
    (studentLink) =>
      studentLink.credential_id === request.request_credential?.credential.id &&
      studentLink.student_id === user.student.id
  );

  if (loading) {
    return <LoadingScreen className="lg:left-[304px]" />;
  }

  return (
    <div>
      <div className="h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="text"
            size="sm"
            className="flex items-center gap-3 rounded-full p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <Breadcrumbs className="bg-transparent p-0">
            <Link to="/student/dashboard" className="opacity-60">
              <HomeIcon className="w-5 h-5" />
            </Link>
            <Link to="/student/my-credentials" className="opacity-60">
              My Credentials
            </Link>
            <span>{request_number}</span>
          </Breadcrumbs>
        </div>
      </div>
      <div className="space-y-4">
        {((request.request_status === "review" &&
          request.request_credential?.credential.on_page === "yes") ||
          (request.request_status === "pay" && !request.payment) ||
          (request.request_status === "pay" && request.payment) ||
          request.request_credential?.request_credential_status ===
            "claim") && (
          <Alert
            color="amber"
            variant="ghost"
            open={open}
            onClose={() => setOpen(false)}
          >
            <span className="text-sm">
              {request.request_status === "review" &&
              request.request_credential?.credential.on_page === "yes"
                ? "Note: There will be changes in the partial amount on the review as the admin adds pages."
                : request.request_status === "pay" && !request.payment
                ? "If payment is not completed, you will not be able to request again."
                : request.request_status === "pay" && request.payment
                ? "Note: Please wait, your request is being processed."
                : request.request_credential?.request_credential_status ===
                  "claim"
                ? "Note: Please wait, your request is being released."
                : null}
            </span>
          </Alert>
        )}
        <Card className="text-sm">
          <CardHeader
            floated={false}
            shadow={false}
            className={`p-4 m-0 font-medium text-white rounded-b-none flex items-center justify-between ${
              (request.request_status === "review" && "bg-orange-500") ||
              (request.request_status === "pay" && "bg-deep-orange-500") ||
              (request.request_status === "process" && "bg-cyan-500") ||
              (request.request_status === "receive" && "bg-indigo-500") ||
              (request.request_status === "complete" && "bg-green-500") ||
              (request.request_status === "cancel" && "bg-red-500")
            }`}
          >
            <span>Request Number: {request.request_number}</span>
            <span className="capitalize">
              {(request.request_status === "review" && "To Review") ||
                (request.request_status === "pay" && "To Pay") ||
                (request.request_status === "process" && "In Process") ||
                (request.request_status === "receive" && "To Receive") ||
                (request.request_status === "complete" && "Completed") ||
                (request.request_status === "cancel" && "Cancelled")}
            </span>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="flex items-center justify-between">
              <span>Date Requested: {formatDate(request.created_at)}</span>
              {request.request_status === "complete" && (
                <span>Date Completed: {formatDate(request.updated_at)}</span>
              )}
              {request.request_status === "cancel" && (
                <span>Date Cancelled: {formatDate(request.updated_at)}</span>
              )}
            </div>
          </CardBody>
        </Card>
        {request.request_status === "process" && (
          <Card className="bg-white space-y-4 p-4 rounded-xl">
            <CardBody>
              <span className="font-pmedium text-sm">
                Estimated Date to Claim
              </span>
              <div className="flex-row items-center justify-between">
                <span className="text-sm font-pregular">
                  {formatDate(
                    calculateEstimatedFinishDate(
                      request.updated_at,
                      parseInt(
                        request.request_credential?.credential.working_day
                      )
                    )
                  )}
                </span>
              </div>
            </CardBody>
          </Card>
        )}
        <div className="flex gap-4">
          <div className='flex-1 space-y-4'>
            <Card className="flex-1 text-sm h-fit">
              <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
                <span>Requested Credential</span>
              </CardHeader>
              <CardBody className='py-4 flex items-center justify-between'>
                <div className='flex flex-col space-y-1'>
                  <span>{request.request_credential?.credential.credential_name}</span>
                  <span>₱ {request.request_credential?.credential_amount}</span>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='space-x-1'>
                    <span>Page/s: {request.request_credential?.page}</span>
                  </div>
                </div>
              </CardBody>
              <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
                <span>Selected Purpose/s</span>
              </CardHeader>
              <CardBody className='pt-4 space-y-4'>
                {request.request_credential?.credential_purpose.map((credPurpose, index) => (
                  <div key={index} className='flex items-center'>
                    <span className='w-6'>{index + 1}</span>
                    <div className='flex flex-col space-y-1'>
                      <span>{credPurpose.purpose.purpose_name}</span>
                      <div className='space-x-1'>
                        <span>Copy/s:</span>
                        <span>{credPurpose.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
            {request.request_status === 'cancel' && (
              <Card className='flex-1 text-sm h-fit'>
                <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium">
                  <span>Reason</span>
                </CardHeader>
                <CardBody className='py-4'>
                  <span>{request.message}</span>
                </CardBody>
              </Card>
            )}
          </div>
          <Card className="flex-1 text-sm h-fit">
            <CardHeader floated={false} shadow={false} className="m-0 px-4 pt-4 font-medium flex items-center justify-between">
              <span>Payment</span>
              {(request.request_status !== 'review' && request.request_status !== 'cancel') && (
                <span className={request.payment ? 'text-green-500' : 'text-orange-500'}>{request.payment ? 'Paid' : 'Pending'}</span>
              )}
            </CardHeader>
            <CardBody className='py-4 space-y-4'>
              {request.payment && (
                <div className='flex items-center justify-between'>
                  <span>Date and Time:</span>
                  <span>{formatDateTime(request.payment?.created_at)}</span>
                </div>
              )}
              {request.payment && (
                <div className='flex items-center justify-between'>
                  <span>OR Number:</span>
                  <span>{request.payment?.or_number}</span>
                </div>
              )}
              <div className='flex items-center justify-between'>
                <span>{request.request_status !== 'review' && request.request_status !== 'cancel' ? 'Total Pay:' : 'Total Amount:'}</span>
                <span>₱ {calculateAmount()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
