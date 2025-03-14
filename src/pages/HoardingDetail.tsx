import { ArrowLeft, Plus, X, Camera, Map, Upload, Check } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { uploadMedia, addHoardingTask, fetchSingleHoarding } from "@/data/requests";
import { SingleHoarding } from "@/types/Types";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function HoardingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const code = location.state.hoardingcode;
  const id = location.state.hoardingID;
  const [cameraImages, setCameraImages] = useState<string[]>([])
  const [cameraVideos, setCameraVideos] = useState<string[]>([])
  const [geoMapImage, setGeoMapImage] = useState<string>('')
  const [hoardingData, setHoardingData] = useState<SingleHoarding>()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showOptions, setShowOptions] = useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    }),
  };

  const fetchHoardingDetail = async () => {
    try {
      const response = await fetchSingleHoarding(code);
      setHoardingData(response.payload.hoarding_details);
    } catch (error) {
      console.error('Error fetching hoarding detail:', error);
    }
  }

  useEffect(() => {
    fetchHoardingDetail();
  },[id]);

  const handleCameraImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setShowOptions(false);
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setCameraImages(prev => [...prev, imageUrl])
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOptions(false);
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Handle image files
        const imageUrl = URL.createObjectURL(file);
        setCameraImages(prev => [...prev, imageUrl]);
      } else if (file.type.startsWith('video/')) {
        // Handle video files - restrict to 1
        if (cameraVideos.length === 0) {
          const videoUrl = URL.createObjectURL(file);
          setCameraVideos([videoUrl]); // Replace existing video if any
        } else {
          alert('Only one video file is allowed');
        }
      }
    });
  };

  const handleSubmitMedia = async () => {
    setUploading(true);

    const formData = new FormData();
    const user_id = sessionStorage.getItem('user_id');
    
    formData.append('uploaded_by', user_id || '');
    formData.append('hoarding_id', id || '');
  
    // Convert base64 geoMapImage to blob before appending
    if (geoMapImage) {
      const geoMapBlob = await fetch(geoMapImage).then(r => r.blob());
      console.log('GeoMap Blob:', geoMapBlob);
      formData.append('geo_images', geoMapBlob, 'geomap.jpg');
    }
  
    for (let i = 0; i < cameraImages.length; i++) {
      const imageBlob = await fetch(cameraImages[i]).then(r => r.blob());
      console.log(`Image ${i} Blob:`, imageBlob);
      formData.append('images', imageBlob, `image${i}.jpg`);
    }
  
    if (cameraVideos.length > 0) {
      const videoBlob = await fetch(cameraVideos[0]).then(r => r.blob());
      formData.append('video', videoBlob, 'video.mp4');
    }

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
  
    try {
      const mediaResponse = await uploadMedia(formData);
      console.log('Media upload response:', mediaResponse);
      const taskData = {
        hoarding_id: Number(id),
        current_status: "pending",
        media_ids: mediaResponse.payload.media_id,
        rejection_count: 0,
        action_by: 0,
        requested_by: Number(user_id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await addHoardingTask(taskData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      setUploading(false);
      toast.error('Error uploading media. Please try again later.');
    }
  };


  
  const handleGeoMapImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOptions(false);
    const file = event.target.files?.[0]
    
    if (file) {
      setLoading(true);
      try {

        if (!navigator.geolocation) {
          toast.error('Geolocation is not supported by your browser');
          return;
        }

        const permissionResult = await navigator.permissions.query({ name: 'geolocation' });

        if (permissionResult.state === 'denied') {
          toast.error('Please enable location access to continue');
          setLoading(false);
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
        const locationData = await response.json();
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx?.drawImage(img, 0, 0);
          
          if (ctx) {
            // Set up the bottom overlay
            const overlayHeight = canvas.height * 0.35;
            const bottomY = canvas.height - overlayHeight;
            
            // Create gradient overlay
            const gradient = ctx.createLinearGradient(0, bottomY - 50, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
            
            // Draw gradient overlay
            ctx.fillStyle = gradient;
            ctx.fillRect(0, bottomY - 50, canvas.width, overlayHeight + 50);
            
            // Calculate layout dimensions
            const padding = 120;
            const mapSection = canvas.width * 0.3;
            const textSection = canvas.width * 0.65;
            
            // Draw map circle
            const mapRadius = overlayHeight * 0.30;
            const mapCenterX = padding + (mapSection / 1.5);
            const mapCenterY = bottomY + (overlayHeight / 2); // Centered in overlay
            
            ctx.beginPath();
            ctx.arc(mapCenterX, mapCenterY, mapRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            
            // Format location details
            const cityStateCountry = [
              locationData.address.state_district,
              locationData.address.state,
              locationData.address.country
            ].filter(Boolean).join(', ');
            
            const streetAddress = [
              locationData.address.road,
              locationData.address.suburb
            ].filter(Boolean).join(', ');
            
            // Get formatted date and time
            const now = new Date();
            const dateTimeStr = now.toLocaleString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            
            // Set up text positioning
            ctx.textAlign = 'left';
            const textCenterX = padding + mapSection + (textSection / 6); // Center of text section
            
            // Calculate vertical spacing for centered text block
            const lineHeight = 180; // Increased space between lines
            const totalTextHeight = lineHeight * 4; // Height of all 4 lines
            const textStartY = mapCenterY - (totalTextHeight / 3); // Start position to center text block
            
            // Draw location details
            ctx.fillStyle = 'white';
            
            // City, State, Country
            ctx.font = 'bold 120px Arial'; // Increased font size
            ctx.fillText(cityStateCountry, textCenterX, textStartY);
            
            // Street Address
            ctx.font = '100px Arial'; // Increased font size
            ctx.fillText(streetAddress, textCenterX, textStartY + lineHeight);
            
            // Date and Time
            ctx.font = '90px Arial'; // Increased font size
            ctx.fillText(dateTimeStr, textCenterX, textStartY + (lineHeight * 2));
            
            // Coordinates
            ctx.font = '90px Arial'; // Increased font size
            ctx.fillText(
              `Lat: ${position.coords.latitude}`,
              textCenterX,
              textStartY + (lineHeight * 3)
            );

            ctx.font = '90px Arial'; // Increased font size
            ctx.fillText(
              `Long: ${position.coords.longitude}`,
              textCenterX,
              textStartY + (lineHeight * 4)
            );
          }
          
          const imageUrl = canvas.toDataURL('image/jpeg');
          setGeoMapImage(imageUrl);
        };
        
        img.src = URL.createObjectURL(file);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const imageUrl = URL.createObjectURL(file);
        setGeoMapImage(imageUrl);
      }
    }
  }


  return (
    <div className="flex flex-col gap-4 bg-[#FCFCFC]">
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
                    <h3 className="font-medium">{hoardingData && `${hoardingData.Hoarding_Code}, ${hoardingData["Location/Route"]}`}</h3>
                    <p className="text-sm text-gray-600">{hoardingData && hoardingData.District}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="px-4 flex flex-col gap-4 relative height-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
        {(geoMapImage.length > 0 && cameraImages.length > 0) &&
          <div
            onClick={handleSubmitMedia}
            className={"bg-[#4BB543] text-white p-2 px-4 rounded-lg cursor-pointer text-center w-fit mx-auto"}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </div>
        }
        {(geoMapImage.length <= 0 && cameraImages.length <= 0) &&
          <div
            className="text-[#d9d9d9] text-[32px] text-center px-2 flex items-center justify-center h-[70vh]"
          >
            {loading ? 'Processing image...' : 'Share Geo Map Image and Camera Images to proceed'}
          </div>
        }
        <div className="space-y-6 mb-24">
          {geoMapImage && (<>
            <h3 className="text-2xl font-semibold mb-2 text-left">Geo Map Image</h3>
            <div className="relative inline-block">
              <img
                src={geoMapImage}
                alt="Geo Map"
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = geoMapImage
                  link.download = `geomap-${Date.now()}.jpg`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              />
              <button 
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                onClick={() => setGeoMapImage('')}
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </>)}

          {cameraImages.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-left">Camera Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {cameraImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Captured ${index + 1}`} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button 
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                      onClick={() => setCameraImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cameraVideos.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-left">Video</h3>
              <div className="w-full">
                <div className="relative">
                  <video 
                    src={cameraVideos[0]}
                    controls
                    autoPlay={false}
                    playsInline
                    preload="metadata"
                    className="w-full h-48 object-cover rounded-lg"
                  >
                    <source src={cameraVideos[0]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <button 
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                    onClick={() => setCameraVideos([])}
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
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
                        onChange={handleGeoMapImageCapture}
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
                  <div className="rounded-full p-4 bg-blue-500 hover:bg-blue-600 text-white">
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
                  <div className="rounded-full p-4 bg-purple-500 hover:bg-purple-600 text-white">
                    <label htmlFor="uploadInput">
                      <Upload size={36} />
                      <input
                        id="uploadInput"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
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
              <Plus size={36} />
            </div>
          </motion.div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-green-500 flex flex-col items-center justify-center z-50">
          <Check size={64} className="text-white" />
          <h2 className="text-white text-3xl font-bold">
            Request Sent!
          </h2>
        </div>
      )}
    </div>
  )
}