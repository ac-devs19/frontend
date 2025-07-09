import {
  ArrowLeftIcon,
  CameraIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import {
  Alert,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingScreen from "../../../../components/LoadingScreen";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import axios from "../../../../../api/axios";
import { useAuthContext } from "../../../../../contexts/AuthContext";

export default function DocumentId() {
  const { url } = useAuthContext();
  const navigate = useNavigate();
  const { document_name, document_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const inputRef = useRef(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [softCopy, setSoftCopy] = useState({});
  const [bannerVisible, setBannerVisible] = useState(true);
  const [reupload, setReupload] = useState(false);
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const cameraInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  useEffect(() => {
    loadSoftCopy();
  }, []);

  const loadSoftCopy = async () => {
    setLoading(true);
    await getSoftCopy();
    setLoading(false);
  };

  const getSoftCopy = async () => {
    await axios
      .get("/student/get-softcopy", {
        params: { document_id: document_id },
      })
      .then(({ data }) => {
        setSoftCopy(data);
      });
  };

  const handleSubmit = async () => {
    setBtnLoading(true);
    const formData = new FormData();
    formData.append("document_id", document_id);
    images.forEach((image) => {
      formData.append("images[]", image);
    });
    await axios
      .post("/student/submit-requirement", formData)
      .then(() => {
        setImages([]);
        loadSoftCopy();
      })
      .catch((error) => {
        console.log(error.response.data);
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  const handleReSubmit = async (submit_id) => {
    setBtnLoading(true);
    const formData = new FormData();
    formData.append("submit_id", submit_id);
    formData.append("document_id", document_id);
    images.forEach((image) => {
      formData.append("images[]", image);
    });
    await axios
      .post("/student/resubmit-requirement", formData)
      .then(() => {
        setReupload(!reupload);
        setImages([]);
        loadSoftCopy();
        if (!bannerVisible) {
          setBannerVisible(true);
        }
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  const handleSelectClick = () => {
    inputRef.current?.click();
  };

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
            <Link to="/student/my-documents" className="opacity-60">
              My Documents
            </Link>
            <span>{document_name}</span>
          </Breadcrumbs>
        </div>
        {images[0] && (
          <Button
            onClick={() => {
              softCopy.submit_status === "resubmit"
                ? handleReSubmit(softCopy.id)
                : handleSubmit();
            }}
            color="blue"
            size="sm"
            disabled={btnLoading}
          >
            <span>
              {softCopy.submit_status === "resubmit" ? "Re-Submit" : "Submit"}
            </span>
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {softCopy.record && softCopy.submit_status !== "confirm" && (
          <Alert
            open={bannerVisible}
            onClose={() => setBannerVisible(false)}
            color="amber"
            variant="ghost"
          >
            {(softCopy.submit_status === "review" &&
              "Note: Please submit your document/s manually in the registrar's office.") ||
              (softCopy.submit_status === "resubmit" &&
                "Note: Please Re-Upload your document/s and submit manually in the registrar's office.")}
          </Alert>
        )}
        {softCopy.record && !reupload && (
          <>
            <Card>
              <CardHeader
                floated={false}
                shadow={false}
                className={`p-4 m-0 font-medium text-white rounded-b-none flex items-center justify-between ${
                  (softCopy.submit_status === "confirm" && "bg-green-500") ||
                  (softCopy.submit_status === "review" && "bg-yellow-500") ||
                  (softCopy.submit_status === "resubmit" && "bg-red-500")
                }`}
              >
                <span>
                  {(softCopy.submit_status === "review" && "To Review") ||
                    (softCopy.submit_status === "confirm" && "Confirmed") ||
                    (softCopy.submit_status === "resubmit" && "Resubmit")}
                </span>
              </CardHeader>
              <div className="bg-white p-4 rounded-b-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-pregular text-sm">Date Submitted:</span>
                  <span className="font-pregular text-sm">
                    {formatDate(softCopy.created_at)}
                  </span>
                </div>
                {softCopy.submit_status === "confirm" && (
                  <div className="flex items-center justify-between">
                    <span className="font-pregular text-sm">
                      Date Confirmed:
                    </span>
                    <span className="font-pregular text-sm">
                      {formatDate(softCopy.updated_at)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
            {softCopy.submit_status === "resubmit" && (
              <Card className="flex-1 text-sm h-fit">
                <CardHeader
                  floated={false}
                  shadow={false}
                  className="m-0 px-4 pt-4 font-medium"
                >
                  <span>Reason</span>
                </CardHeader>
                <CardBody className="py-4">{softCopy.message}</CardBody>
              </Card>
            )}
            <Card>
              <CardBody>
                {softCopy.submit_status === "resubmit" && !reupload && (
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      onClick={() => setReupload(!reupload)}
                      size="sm"
                      variant="outlined"
                      className="flex items-center gap-2"
                    >
                      <CameraIcon className="size-5" />
                      <span>Re-Upload</span>
                    </Button>
                  </div>
                )}
                <LightGallery
                  speed={500}
                  plugins={[lgThumbnail, lgZoom]}
                  elementClassNames="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {softCopy.record?.map((copy, index) => (
                    <a key={index} href={url + copy.uri}>
                      <img
                        src={url + copy.uri}
                        className="object-cover h-72 w-full rounded-xl"
                      />
                    </a>
                  ))}
                </LightGallery>
              </CardBody>
            </Card>
          </>
        )}
        {images[0] && (
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  onClick={handleCameraClick}
                  size="sm"
                  color="blue"
                  className="flex items-center gap-2"
                >
                  <CameraIcon className="size-5" />
                  <span>Take a Photo</span>
                </Button>
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  onClick={handleSelectClick}
                  size="sm"
                  variant="outlined"
                  className="flex items-center gap-2"
                >
                  <PhotoIcon className="size-5" />
                  <span>Select a Photo</span>
                </Button>
                <input
                  type="file"
                  ref={inputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <LightGallery
                speed={500}
                plugins={[lgThumbnail, lgZoom]}
                elementClassNames="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {images.map((image, index) => {
                  const objectUrl = URL.createObjectURL(image);
                  return (
                    <a
                      key={index}
                      href={objectUrl}
                      className="relative group border rounded-xl overflow-hidden block"
                    >
                      <img
                        src={objectUrl}
                        alt={`Image ${index}`}
                        className="object-cover h-72 w-full"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setImages(images.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </a>
                  );
                })}
              </LightGallery>
            </CardBody>
          </Card>
        )}
        {((!softCopy.record && !images[0]) || reupload) && (
          <div
            className={`flex items-center justify-center ${
              images[0] && "hidden"
            }`}
          >
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleCameraClick}
                size="sm"
                color="blue"
                className="flex items-center gap-2"
              >
                <CameraIcon className="size-5" />
                <span>Take a Photo</span>
              </Button>
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                onClick={handleSelectClick}
                size="sm"
                variant="outlined"
                className="flex items-center gap-2"
              >
                <PhotoIcon className="size-5" />
                <span>Select a Photo</span>
              </Button>
            </div>
            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
