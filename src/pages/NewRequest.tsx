import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { fetchSingleHoarding } from "@/data/requests"
import { SingleHoarding } from "@/types/Types"
import { LogOut, Menu, Search } from 'lucide-react'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"

const NewRequest = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [hoarding, setHoarding] = useState<SingleHoarding>();
    const [error, setError] = useState<string | null>(null);

    const fetchHoarding = async () => {
        try {
            const response = await fetchSingleHoarding(searchQuery);
            setHoarding(response.payload.hoarding_details)
        } catch (error: any) {
          if(error.status === 404) {
            setHoarding(undefined);
            setError("Hoarding not found. Please enter a valid hoarding number.");
          } else {
          console.error("Error fetching hoarding:", error);
        }}
    }

    useEffect(() => {
        if (searchQuery) {
            fetchHoarding();
        }
    }, [searchQuery]);

    console.log(hoarding);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Hi Cody!</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Menu size={24}/>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 h-18">
            <DropdownMenuItem onClick={() => navigate('/')}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-4 h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between border border-[#D9D9D9] rounded-lg">
          <input
            type="text"
            placeholder="Enter Hoarding ID"
            className="flex-1 p-2 border-none outline-none rounded-tl-lg rounded-bl-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center justify-center p-3 px-4 bg-black text-white rounded-tr-lg rounded-br-lg">
            <Search size={24} />
          </div>
        </div>
        {!hoarding ? (
          <div className="flex-1 flex items-center justify-center text-4xl text-[#D9D9D9]">
            {error ? error : 'Add new hoarding'}
          </div>
        ) : (
          <Card className="mt-6 cursor-pointer" onClick={() => navigate(`/hoarding/${hoarding.Hoarding_ID}`, {state: { hoardingcode: hoarding.Hoarding_Code, hoardingID: hoarding.Hoarding_ID }})}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-10">
                  <img 
                    src="https://images.unsplash.com/photo-1563990308267-cd6d3cc09318?q=80&w=1000&auto=format&fit=crop"
                    alt={hoarding["Location/Route"]}
                    className="w-20 h-20 object-cover rounded-full"
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium">{hoarding["Location/Route"]}</h3>
                    <p className="text-sm text-gray-600">{hoarding.District}</p>
                    <p className="text-sm text-gray-600">Size: {hoarding["Size W"]} x {hoarding["Size H"]}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default NewRequest