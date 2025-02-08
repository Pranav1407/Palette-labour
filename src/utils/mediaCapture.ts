export const handleGeoMapImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
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
          return imageUrl;
        };    
        img.src = URL.createObjectURL(file);
      } catch (error) {
        const imageUrl = URL.createObjectURL(file);
        return imageUrl;
      }
    }
  }

  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
  
    return `${month} ${day}, ${year}`;
  };
  