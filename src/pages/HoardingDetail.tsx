import { ArrowLeft, Plus, X, Camera, Map, Upload } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
// import { hoardingData } from "@/mockData"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { uploadMedia, addHoardingTask, fetchSingleHoarding } from "@/data/requests";
import { SingleHoarding } from "@/types/Types";
import toast from "react-hot-toast";

export default function HoardingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const code = location.state.hoardingcode;
  const id = location.state.hoardingID;
  const [isOpen, setIsOpen] = useState(false)
  const [cameraImages, setCameraImages] = useState<string[]>([])
  const [cameraVideos, setCameraVideos] = useState<string[]>([])
  const [geoMapImage, setGeoMapImage] = useState<string>('')
  const [hoardingData, setHoardingData] = useState<SingleHoarding>()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [addingTask, setAddingTask] = useState(false)

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
    setIsOpen(false);
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setCameraImages(prev => [...prev, imageUrl])
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(false);
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
  
    if (geoMapImage) {
      const geoMapBlob = await fetch(geoMapImage).then(r => r.blob());
      formData.append('geo_images', geoMapBlob);
    }
  
    await Promise.all(
      cameraImages.map(async (imageUrl) => {
        const imageBlob = await fetch(imageUrl).then(r => r.blob());
        formData.append(`images`, imageBlob);
      })
    );
  
    if (cameraVideos.length > 0) {
      const videoBlob = await fetch(cameraVideos[0]).then(r => r.blob());
      formData.append('video', videoBlob);
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
      try {
        await addHoardingTask(taskData);
        setAddingTask(false);
        setTimeout(() => {
          setShowSuccess(true);
          navigate('/home');
        }, 2000);
      } catch (error) {
        toast.error('Error adding task. Please try again later.');
      }
    } catch (error) {
      toast.error('Error uploading media. Please try again later.');
    }
};

  
  const handleGeoMapImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(false);
    const file = event.target.files?.[0]
    
    if (file) {
      setLoading(true);
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
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
    <div className="min-h-screen bg-[#FCFCFC]">
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
            <div
              onClick={handleSubmitMedia}
              className={
                (geoMapImage && cameraImages.length) ? "bg-[#4BB543] text-white p-2 px-4 rounded-lg cursor-pointer" : ''
              }
            >
              {(geoMapImage && cameraImages.length) && (uploading ? 'Uploading...' : 'Upload')}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 flex flex-col items-center justify-center relative h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
        {cameraImages.length === 0 && cameraVideos.length === 0 && !geoMapImage ? (
          <h1 className="text-3xl text-[#d9d9d9] font-regular text-center">
            {loading ? "Processing Image..." : "Share images/videos for approval"}
          </h1>
        ) : (
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
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                    onClick={(e) => {
                        e.stopPropagation()
                        setGeoMapImage('')
                    }}
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
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
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
        )}

        <div className="fixed bottom-20 right-1/2 transform translate-x-1/2 flex flex-col items-center gap-4">
          <div
            className={`h-24 w-24 rounded-full p-6 bg-[#F48D49] shadow-lg transition-all duration-300 flex items-center ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          >
            <label htmlFor="geoMapInput" className="cursor-pointer">
              <Map size={48} className="text-white" />
              {/* <span className="text-sm mt-1 text-white">Geo Map</span> */}
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

          <div
            className={`h-24 w-24 rounded-full p-6 bg-[rgb(72,63,176,0.61)] shadow-lg transition-all duration-300 flex flex-col items-center ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          >
            <label htmlFor="cameraInput" className="cursor-pointer">
              <Camera size={48} className="text-white" />
              {/* <span className="text-sm mt-1 text-white">Camera</span> */}
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

          <div
            className={`h-24 w-24 rounded-full p-6 bg-[rgb(72,63,176,0.61)] shadow-lg transition-all duration-300 flex flex-col items-center ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          >
           <label htmlFor="uploadInput" className="cursor-pointer">
              <Upload size={48} className="text-white" />
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

          <div
            className="h-24 w-24 rounded-full hover:shadow-2xl transition-all duration-300 p-4"
            style={{
              backgroundColor: isOpen ? '' : '#4BB543',
              boxShadow: isOpen ? '' : '0px 0px 10px 0px rgba(0,0,0,0.2)',
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X size={64} className="transition-transform duration-300 rotate-0" />
            ) : (
              <Plus size={64} className="text-white transition-transform duration-300 rotate-0" />
            )}
          </div>
        </div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 bg-green-500 flex flex-col items-center justify-center z-50">
          <div className="loader" />
          <h2 className="text-white text-3xl font-bold">
            {uploading ? 'Uploading...' : addingTask ? 'Adding Task...' : 'Request Sent!'}
          </h2>
        </div>
      )}
    </div>
  )
}
