import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Checkbox,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../../../contexts/AuthContext";
import axios from "../../../../../api/axios";
import LoadingScreen from "../../../../components/LoadingScreen";

export default function Request() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);
  const [credentials, setCredentials] = useState([]);
  const [credentialChecked, setCredentialChecked] = useState({});
  const [purposes, setPurposes] = useState([]);
  const [purposeChecked, setPurposeChecked] = useState({});
  const [credentialCount, setCredentialCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [studentLinks, setStudentLinks] = useState([]);
  const { user } = useAuthContext();
  const [open, setOpen] = useState(0);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  useEffect(() => {
    const loadCredentialPurpose = async () => {
      setLoading(true);
      await getCredential();
      await getPurpose();
      await getLink();
      await getStudentLink();
      setLoading(false);
    };
    loadCredentialPurpose();
  }, []);

  const getCredential = async () => {
    await axios.get("/credential/get-credential").then(({ data }) => {
      setCredentials(data);
    });
  };

  const getPurpose = async () => {
    await axios.get("/credential/get-purpose").then(({ data }) => {
      setPurposes(data);
    });
  };

  const getLink = async () => {
    await axios.get("/credential/get-link").then(({ data }) => {
      setLinks(data);
    });
  };

  const getStudentLink = async () => {
    await axios.get("/credential/get-student-link").then(({ data }) => {
      setStudentLinks(data);
    });
  };

  const handleCredentialCheckbox = (id) => {
    setCredentialChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    if (credentialChecked[id]) {
      setPurposeChecked((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const handlePurposeCheckbox = (credentialId, purposeId) => {
    setPurposeChecked((prev) => {
      const current = prev[credentialId] || {};
      return {
        ...prev,
        [credentialId]: {
          ...current,
          [purposeId]: !current[purposeId],
        },
      };
    });
  };

  const handleQuantityChange = (credentialId, purposeId, delta) => {
    setCredentialCount((prevCounts) => {
      const currentCount = prevCounts[credentialId]?.[purposeId] || 1;
      const newCount = Math.max(currentCount + delta, 1);
      return {
        ...prevCounts,
        [credentialId]: {
          ...prevCounts[credentialId],
          [purposeId]: newCount,
        },
      };
    });
  };

  const selectedCredentials = credentials.filter((credential) =>
    Object.keys(purposeChecked[credential.id] || {}).some(
      (purposeId) => purposeChecked[credential.id][purposeId]
    )
  );

  const checkOutData = selectedCredentials.map((credential) => ({
    credentialId: credential.id,
    credentialAmount: credential.amount,
    selectedPurposes: Object.keys(purposeChecked[credential.id] || {}).filter(
      (purposeId) => purposeChecked[credential.id][purposeId]
    ),
    quantities: Object.keys(purposeChecked[credential.id] || {}).reduce(
      (acc, purposeId) => {
        acc[purposeId] = credentialCount[credential.id]?.[purposeId] || 1;
        return acc;
      },
      {}
    ),
  }));

  const handleCheckOut = async () => {
    setBtnLoading(true);
    await axios
      .post("/student/request-credential", { checkOutData })
      .then(() => {
        navigate(-1);
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  const isTab1Valid = Object.values(credentialChecked).some(
    (checked) => checked
  );

  const isTab2Valid = Object.values(purposeChecked).some((purposes) =>
    Object.values(purposes).some((checked) => checked)
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
            <span>Request</span>
          </Breadcrumbs>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h1 className="font-semibold">
            {tab === 1 && "Credentials"}
            {tab === 2 && "Purposes"}
            {tab === 3 && "Check Out"}
          </h1>
          <p className="text-sm font-pregular">
            {tab === 1 && "Please select document/s."}
            {tab === 2 && "Please select your purpose of request."}
            {tab === 3 && "Review your request credentials."}
          </p>
        </div>
        <Card>
          <CardBody className="space-y-4">
            {tab === 1 && (
              <div className="flex flex-col gap-2">
                {credentials.map((credential, index) => {
                  const isDisabled = studentLinks.some(
                    (studentLink) =>
                      studentLink.credential_id === credential.id &&
                      studentLink.student_id === user.student.id
                  );
                  return (
                    <Checkbox
                      key={index}
                      onChange={() => handleCredentialCheckbox(credential.id)}
                      checked={credentialChecked[credential.id] ? true : false}
                      label={
                        <div>
                          <Typography color="blue-gray" className="font-medium">
                            <span>{credential.credential_name}</span>
                          </Typography>
                          <Typography
                            variant="small"
                            color="gray"
                            className="font-normal"
                          >
                            <span>
                              {isDisabled
                                ? "This credential is one-time request only."
                                : `₱ ${parseFloat(
                                    credential.amount
                                  ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`}
                            </span>
                          </Typography>
                        </div>
                      }
                      containerProps={{
                        className: "-mt-5",
                      }}
                      disabled={isDisabled}
                    />
                  );
                })}
              </div>
            )}
            {tab === 2 &&
              credentials
                .filter((credential) => credentialChecked[credential.id])
                .map((credential, credentialIndex) => (
                  <Accordion
                    key={credentialIndex}
                    open={open === credentialIndex + 1}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`${
                          credentialIndex + 1 === open ? "rotate-180" : ""
                        } h-5 w-5 transition-transform`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    }
                  >
                    <AccordionHeader
                      onClick={() => handleOpen(credentialIndex + 1)}
                    >
                      <span className="text-base">
                        {credential.credential_name}
                      </span>
                    </AccordionHeader>
                    <AccordionBody>
                      {purposes.map((purpose, purposeIndex) => {
                        const isHidden = links.some(
                          (link) =>
                            link.credential_id === credential.id &&
                            link.purpose_id !== purpose.id
                        );
                        return (
                          <Checkbox
                            key={purposeIndex}
                            onChange={() =>
                              handlePurposeCheckbox(credential.id, purpose.id)
                            }
                            checked={
                              purposeChecked[credential.id]?.[purpose.id]
                                ? true
                                : false
                            }
                            label={
                              <div className={isHidden && "hidden"}>
                                <Typography
                                  color="blue-gray"
                                  className="font-medium"
                                >
                                  <span>{purpose.purpose_name}</span>
                                </Typography>
                              </div>
                            }
                            containerProps={{
                              className: isHidden ? "hidden" : "",
                            }}
                          />
                        );
                      })}
                    </AccordionBody>
                  </Accordion>
                ))}
            {tab === 3 &&
              credentials
                .filter((credential) => credentialChecked[credential.id])
                .map((credential, credentialIndex) => {
                  const selectedPurposes = purposes.filter(
                    (purpose) => purposeChecked[credential.id]?.[purpose.id]
                  );
                  const totalAmount = selectedPurposes
                    .reduce((total, purpose) => {
                      const credentialAmount = parseFloat(credential.amount);
                      const quantity =
                        credentialCount[credential.id]?.[purpose.id] || 1;
                      return total + credentialAmount * quantity;
                    }, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                  if (selectedPurposes.length > 0) {
                    return (
                      <Accordion
                        key={credentialIndex}
                        open={open === credentialIndex + 1}
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={`${
                              credentialIndex + 1 === open ? "rotate-180" : ""
                            } h-5 w-5 transition-transform`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        }
                      >
                        <AccordionHeader
                          onClick={() => handleOpen(credentialIndex + 1)}
                        >
                          <span className="text-base">
                            {credential.credential_name}
                          </span>
                        </AccordionHeader>
                        <AccordionBody className="space-y-4">
                          {credential.on_page === "yes" && (
                            <div>
                              <span className="font-pregular text-sm pr-4">
                                Note: There will be changes in the partial
                                amount on the review as the admin adds pages.
                              </span>
                            </div>
                          )}
                          {selectedPurposes.map((purpose, purposeIndex) => (
                            <div
                              key={purposeIndex}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <h1>{purpose.purpose_name}</h1>
                                <p>Copy/s:</p>
                              </div>
                              <div>
                                {links.some(
                                  (link) =>
                                    link.credential_id === credential.id &&
                                    link.purpose_id === purpose.id
                                ) ? (
                                  <span className="text-sm font-pregular">
                                    x 1
                                  </span>
                                ) : (
                                  <div className={`flex gap-2 items-center`}>
                                    <IconButton
                                      size="sm"
                                      variant="outlined"
                                      onClick={() =>
                                        handleQuantityChange(
                                          credential.id,
                                          purpose.id,
                                          -1
                                        )
                                      }
                                    >
                                      -
                                    </IconButton>
                                    <span className="text-sm font-pregular">
                                      {credentialCount[credential.id]?.[
                                        purpose.id
                                      ] || 1}
                                    </span>
                                    <IconButton
                                      size="sm"
                                      variant="outlined"
                                      onClick={() =>
                                        handleQuantityChange(
                                          credential.id,
                                          purpose.id,
                                          1
                                        )
                                      }
                                    >
                                      +
                                    </IconButton>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between">
                            <h1>
                              {credential.on_page === "yes"
                                ? "Partial Amount:"
                                : "Total Amount:"}
                            </h1>
                            <p>₱ {totalAmount}</p>
                          </div>
                        </AccordionBody>
                      </Accordion>
                    );
                  }
                })}
            <div className="flex items-center justify-end gap-2">
              {tab === 1 && (
                <Button
                  color="blue"
                  onClick={() => setTab(2)}
                  disabled={!isTab1Valid}
                >
                  Next
                </Button>
              )}
              {tab === 2 && (
                <>
                  <Button variant="outlined" onClick={() => setTab(1)}>
                    Back
                  </Button>
                  <Button
                    color="blue"
                    onClick={() => setTab(3)}
                    disabled={!isTab2Valid}
                  >
                    Next
                  </Button>
                </>
              )}
              {tab === 3 && (
                <>
                  <Button variant="outlined" onClick={() => setTab(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    color="blue"
                    disabled={btnLoading}
                  >
                    Check Out
                  </Button>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
