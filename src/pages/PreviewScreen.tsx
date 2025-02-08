import { Check, ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"

export default function ImagePreview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { imageUrl, setGeoMapImage } = location.state

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <Card className="rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ArrowLeft 
                className="h-6 w-6 cursor-pointer" 
                onClick={() => navigate(-1)}
              />
              <h2 className="text-xl font-medium">Image Preview</h2>
            </div>
            <Check 
              className="h-6 w-6 cursor-pointer text-green-500" 
              onClick={() => {
                setGeoMapImage(imageUrl);
                navigate(-1)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="h-screen p-4">
        <div className="h-full">
          <img
            src={imageUrl}
            alt="Preview" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
