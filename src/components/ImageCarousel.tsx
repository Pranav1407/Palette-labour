import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
  import { Dialog } from "@/components/ui/dialog"
  import { X } from "lucide-react"
  
  interface ImageCarouselProps {
    images: string[]
    initialIndex: number
    isOpen: boolean
    onClose: () => void
  }
  
  export function ImageCarousel({ images, initialIndex, isOpen, onClose }: ImageCarouselProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
  
          <Carousel className="w-full max-w-[90vw]" defaultValue={initialIndex}>
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white" />
            <CarouselNext className="text-white" />
          </Carousel>
        </div>
      </Dialog>
    )
  }  