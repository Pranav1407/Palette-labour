import { Card, CardContent } from "@/components/ui/card";
import { fetchRequestDetails, redoRejected, uploadMedia } from "@/data/requests";
import { HoardingDetailsData, RequestData } from "@/types/Types";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { formatDate, handleGeoMapImageCapture } from "@/utils/mediaCapture";
// import { ImageCarousel } from "@/components/ImageCarousel";
import toast from "react-hot-toast";


const RequestHistory = () => {

  const navigate = useNavigate();
  const { id: request_id } = useParams();

  const [hoardingData, setHoardingData] = useState<HoardingDetailsData>();
  // const [mediaData, setMediaData] = useState<MediaData[]>([]);
  const [requestData, setRequestData] = useState<RequestData>();
  const [geoMapImage, setGeoMapImage] = useState<string>("");
  const [cameraImages, setCameraImages] = useState<string[]>([]);
  // const [cameraVideos, setCameraVideos] = useState<string[]>([]);
  const [editedCameraImages, setEditedCameraImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [edited,setEdited] = useState(false);
  // const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  // const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchRequestHistory = async (id: string) => {
      try {
        const response = await fetchRequestDetails(id);
        setHoardingData(response.payload.hoarding_data);
        // setMediaData(response.payload.media_data);

        const geoMap = response.payload.media_data.find(media => media.media_type === 'geo_image');
        setGeoMapImage(geoMap?.presigned_url || "");
      
        const cameraImages = response.payload.media_data
          .filter(media => media.media_type === "image")
          .map(media => media.presigned_url);
        setCameraImages(cameraImages);

        setRequestData(response.payload.request_data);
      } catch (error) {
        console.error('Error fetching request history:', error);
      }
    }

    if (request_id) {
      fetchRequestHistory(request_id);
    }

  }, [request_id]);

  const geoMapImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const img_url = await handleGeoMapImageCapture(e)
    console.log("img_url", img_url)
    //@ts-expect-error type not identified
    setGeoMapImage(img_url);
    setEdited(true);
  }

  const handleCameraImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setEditedCameraImages(prev => [...prev, imageUrl])
      setEdited(true);
    }
}

  const handleSubmitMedia = async () => {
    setUploading(true);

    const formData = new FormData();
    const user_id = sessionStorage.getItem('user_id');
    const hoarding_id = hoardingData?.Hoarding_ID;
    formData.append('uploaded_by', user_id || '');

    formData.append('hoarding_id', hoarding_id?.toString() || '');
  
    if (geoMapImage) {
      const geoMapBlob = await fetch(geoMapImage).then(r => r.blob());
      formData.append('geo_images', geoMapBlob);
    }
  
    await Promise.all(
      (editedCameraImages.length > 0 ? editedCameraImages : cameraImages).map(async (imageUrl) => {
        const imageBlob = await fetch(imageUrl).then(r => r.blob());
        formData.append(`images`, imageBlob);
      })
    );
  
    // if (cameraVideos.length > 0) {
    //   const videoBlob = await fetch(cameraVideos[0]).then(r => r.blob());
    //   formData.append('video', videoBlob);
    // }
  
    try {
      console.log("inside try")
      const mediaResponse = await uploadMedia(formData);
      console.log('Media upload response:', mediaResponse);
      try {
        await redoRejected(request_id, mediaResponse.payload.media_id);
        setUploading(false);
        toast.success('Request resubmitted successfully');
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } catch (error) {
        toast.error('Error adding task. Please try again later.');
      }
    } catch (error) {
      toast.error('Error uploading media. Please try again later.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ArrowLeft 
                  className="h-6 w-6 cursor-pointer" 
                  onClick={() => navigate(-1)}
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <img 
                        src="https://images.unsplash.com/photo-1563990308267-cd6d3cc09318?q=80&w=1000&auto=format&fit=crop"
                        alt={hoardingData && hoardingData["Location/Route"]}
                        className="w-20 h-20 object-cover rounded-full"
                    />
                    <div className="space-y-2">
                      <h3 className="font-medium">{hoardingData && hoardingData["Location/Route"]}</h3>
                      <p className="text-sm text-gray-600">{hoardingData && hoardingData.District}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className={edited ? "bg-[#4BB543] text-white p-2 px-4 rounded-lg cursor-pointer" : ''}>
                {edited && (uploading ? 'Uploading...' : 'Upload')}
              </div> */}
            </div>
          </CardContent>
        </Card>

        <div className="text-center p-2 px-4 flex flex-col gap-2">
          <p 
            className={
              requestData?.current_status === 'approved' ? 'text-green-600' :
              requestData?.current_status === 'rejected' ? 'text-red-600' :
              requestData?.current_status === 'pending' ? 'text-yellow-600' : ''
            }
          >
            {
              requestData?.current_status === 'approved' ? `Request Approved` : 
              requestData?.current_status === 'rejected' ? `Request rejected` :
              requestData?.current_status === 'pending' ? `Awaiting approval` : ''
            }
          </p>
          <p>
            {
              requestData?.current_status === 'approved' ? `Approved on ${formatDate(requestData?.updated_at)}` : 
              requestData?.current_status === 'rejected' ? `Rejected on ${formatDate(requestData?.updated_at)}` :
              requestData?.current_status === 'pending' ? `Requested on ${formatDate(requestData?.updated_at)}` : ''
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-8">
          {/* First row */}
          <div className="w-full h-[300px] rounded-lg flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p>Geo Map</p>
              <div className="flex items-center gap-2 cursor-pointer">
                <label htmlFor="geoMapInput" className="flex items-center gap-2">
                  Edit
                  <Pencil size={14} />
                  <input
                    id="geoMapInput"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={geoMapImageInput}
                  />
                </label>
              </div>
            </div>
            <img 
              src={geoMapImage}
              alt="Geo Map" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-4 pb-4">
            <div className="flex justify-between items-center">
              <p>Camera</p>
              <div className="flex items-center gap-2 cursor-pointer">
                <label htmlFor="cameraInput" className="flex items-center gap-2">
                  Edit
                  <Pencil size={14} />
                  <input
                    id="cameraInput"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCameraImageCapture}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 h-[300px]">
              {(editedCameraImages.length > 0 ? editedCameraImages : cameraImages).map((url, index) => (
                  <img 
                    key={index}
                    src={url}
                    alt={`Camera ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    // onClick={() => {
                    //   setSelectedImageIndex(index)
                    //   setIsCarouselOpen(true)
                    // }}
                  />
                ))
              }
            </div>
          </div>

          {/* <div className="w-full h-[300px] bg-gray-100 rounded-lg md:col-span-2">
            <video 
              controls 
              className="w-full h-full object-cover rounded-lg"
            >
              <source src="" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div> */}
        </div>
        
        {/* <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <AnimatePresence>
            {showOptions && (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={menuVariants}
                  custom={0}
                >
                  <div className="rounded-full p-4 bg-emerald-500 text-white">
                    <label htmlFor="geoMapInput">
                      <Map size={36} />
                      <input
                        id="geoMapInput"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={geoMapImageInput}
                      />
                    </label>
                  </div>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={menuVariants}
                  custom={1}
                >
                  <div
                    className="rounded-full p-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <label htmlFor="cameraInput">
                      <Camera size={36} />
                      <input
                        id="cameraInput"
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={handleCameraImageCapture}
                      />
                    </label>
                  </div>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={menuVariants}
                  custom={2}
                >
                  <div
                    className="rounded-full p-4 bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Upload size={36} />
                  </div>
                </motion.div>

                {/* <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={menuVariants}
                  custom={3}
                >
                  <Button
                    className="rounded-full p-4 bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="h-6 w-6 text-white" />
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ rotate: showOptions ? 135 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="rounded-full p-4 bg-primary hover:bg-primary/90 text-white"
              onClick={() => setShowOptions(!showOptions)}
            >
              <Pencil size={36} />
            </div>
          </motion.div>
        </div> */}
        {edited && 
          <div
            className="fixed bottom-6 right-6 rounded-full py-2 px-4 bg-green-500 text-white"
            onClick={() => handleSubmitMedia()}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </div>
        }
      </div>
      
      {/* <ImageCarousel 
        images={cameraImages}
        initialIndex={selectedImageIndex}
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
      /> */}
    </>
  )
}

export default RequestHistory