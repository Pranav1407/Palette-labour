import { Input } from "@/components/ui/input"
import { Search, Menu, Check, Info, LogOut, Plus, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchHoardings } from "@/data/requests"
import { HoardingData } from "@/types/Types"

export default function Home() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoardingData, setHoardingData] = useState<HoardingData[]>()
  const navigate = useNavigate()

  const getHoardings = async () => {
    try {
      const response = await fetchHoardings();
      console.log(response.payload.data);
      setHoardingData(response.payload.data);
    } catch (error) {
      console.error('Error fetching hoardings:', error);
    }
  }

  const filteredData = hoardingData?.length ? hoardingData
  .filter(item => {
    const matchesTab = activeTab === "all" || item.current_status === activeTab
    const matchesSearch = item.hoarding_details["Location/Route"].toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })
  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  : []

  useEffect(() => {
    getHoardings();
  },[activeTab]);
  
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

      <div className="space-y-6 relative">
        <div className="relative">
          <Input
            placeholder="Search..."
            className="w-full pl-4 pr-10 py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <div className="mt-6 h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide space-y-4">
            {filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#D9D9D9] text-4xl">
                No hoardings found
              </div>
            ) : (
                <>
                  {filteredData.map((item) => (
                    <Card
                        key={item.request_id}
                        style={{
                          backgroundColor: item.current_status === 'pending' ? 'rgb(253, 224, 71, 0.45)' : 
                          item.current_status === 'rejected' ? 'rgb(245, 85, 85, 0.45)' : 
                          'rgb(75, 181, 67, 0.45)',
                          cursor: 'pointer'
                        }}
                        onClick={() => 
                          navigate(`/request-history/${item.request_id}`)}
                    >
                      <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-10">
                              <img 
                                src="https://images.unsplash.com/photo-1559060017-445fb9722f2a"
                                alt={item.hoarding_details["Location/Route"]}
                                className="w-20 h-20 min-w-20 min-h-20 object-cover rounded-full"
                              />
                              <div className="space-y-2">
                                <h3 className="font-medium">{item.hoarding_details["Hoarding Code"]}, {item.hoarding_details["Location/Route"]}</h3>
                                <p className="text-sm text-gray-600">{item.hoarding_details.District}</p>
                                <p className="text-sm text-gray-600">Size: {item.hoarding_details["Size W"]} x {item.hoarding_details["Size H"]}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {item.current_status === 'approved' ? (
                                  <Check className="h-5 w-5 text-green-700" />
                              ) : item.current_status === 'pending' ? (
                                  <Clock className="h-5 w-5 text-yellow-500" />
                              ) : (
                                  <Info className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
            )}
          </div>
        </Tabs>

          <div
            className="h-24 w-24 rounded-full hover:shadow-2xl transition-all duration-300 p-4 absolute bottom-0 right-0"
            style={{
              backgroundColor:'#4BB543',
              boxShadow:'0px 0px 10px 0px rgba(0,0,0,0.2)',
            }}
            onClick={() => navigate('/new-request')}
          >
            <Plus size={64} className="text-white transition-transform duration-300 rotate-0" />
          </div>
      </div>
    </div>
  )
}