import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Menu, Check, Info, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { hoardingData } from "@/mockData"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const filteredData = hoardingData?.length ? hoardingData.filter(item => {
    const matchesTab = activeTab === "all" || item.status === activeTab
    const matchesSearch = item.hoarding_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  }) : []
  

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

      <div className="space-y-6">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="mt-6 h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide space-y-4">
            {filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#D9D9D9] text-4xl">
                No work today!
              </div>
            ) : (
                <>
                    {filteredData.map((item) => (
                      // In the Card component, add onClick handler
                      <Card 
                        key={item.id} 
                        style={{
                          backgroundColor: item.status === 'pending' ? 'rgb(245, 85, 85, 0.45)' : 'rgb(75, 181, 67, 0.45)',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/hoarding/${item.id}`)}
                      >
                        <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-10">
                                {item.image_url ? (
                                    <img 
                                        src={item.image_url} 
                                        alt={item.hoarding_name}
                                        className="w-20 h-20 object-cover rounded-full"
                                    />
                                ) : (
                                    <Skeleton className="w-20 h-20 rounded-full" />
                                )}
                                <div className="space-y-2">
                                    <h3 className="font-medium">{item.hoarding_name}</h3>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {item.status === 'completed' ? (
                                    <Check className="h-5 w-5 text-green-700" />
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
      </div>
    </div>
  )
}