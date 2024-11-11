import { ArrowLeft, Plus, X, Camera, Map } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { hoardingData } from "@/mockData"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

export default function HoardingDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [cameraImages, setCameraImages] = useState<string[]>([])
  const [geoMapImage, setGeoMapImage] = useState<string>('')
  //@ts-ignore
  const hoarding = hoardingData.find(item => item.id == id)

  if (!hoarding) return null

  const handleCameraImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(false);
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setCameraImages(prev => [...prev, imageUrl])
    }
  }
  const handleGeoMapImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(false);
    const file = event.target.files?.[0]
    
    if (file) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
        const locationData = await response.json();

        console.log(locationData);
        
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
        
      } catch (error) {
        console.error('Error getting location:', error);
        const imageUrl = URL.createObjectURL(file);
        setGeoMapImage(imageUrl);
      }
    }
  }
  

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <Card className="rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <ArrowLeft 
              className="h-6 w-6 cursor-pointer" 
              onClick={() => navigate(-1)}
            />
            <div className="flex items-center flex-1 justify-between">
              <img 
                src={hoarding.image_url} 
                alt={hoarding.hoarding_name}
                className="w-20 h-20 object-cover rounded-full"
              />
              <h2 className="text-xl align-middle font-medium mt-2">
                {hoarding.hoarding_name}
              </h2>
              <div></div>
            </div>
            <div className="w-6" />
          </div>
        </CardContent>
      </Card>

      <div className="p-4 flex flex-col relative h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
        {cameraImages.length === 0 && !geoMapImage ? (
          <h1 className="text-3xl text-[#d9d9d9] font-regular text-center mt-[70%]">
            Share images/videos for approval
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
                        e.stopPropagation() // Prevent download when clicking delete
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
    </div>
  )
}