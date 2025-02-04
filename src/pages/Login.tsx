import { Button } from "@/components/ui/button"
import { loginUser } from "@/data/requests"
import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"


function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    })
    const navigate = useNavigate()

    const handleLogin = async () => {
        const data = await loginUser(credentials);
        if (data.payload.role === "labour") {
            sessionStorage.setItem("user_id", data.payload.user_id.toString())
            navigate('/home')
        } else {
            toast.error("You are not authorized to login")
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
    }

    return (
        <div className="min-h-screen w-full flex justify-center">
            <div
                style={{
                    backgroundImage: "url('/assets/loginBanner.png')",
                }}
            >
                <div className="h-full mx-auto w-full flex flex-col space-y-6">
                    <div className="h-1/4">hi</div>
                    <div className="w-full h-full p-4 pt-[40%]"
                         style={{
                             background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 0.3))'
                         }}
                    >
                        <div className="w-4/6 ml-20 p-1">
                            <h1 className="text-2xl font-regular mb-10">Welcome! Let's get you signed in.</h1>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Email / Employee ID"
                                    className="w-full px-3 py-4 border rounded-md outline-none"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full px-3 py-4 border rounded-md outline-none"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={20}/> : <FaEye size={20}/>}
                                </button>
                            </div>

                            <Button type="submit" className="w-full mt-8">
                                Login
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
