import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import HoardingDetail from "./pages/HoardingDetail";
import ImagePreview from "./pages/PreviewScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NewRequest from "./pages/NewRequest";
import RequestHistory from "./pages/RequestHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <ProtectedRoute><Home /></ProtectedRoute>,
  },
  {
    path: "/hoarding/:id",
    element: <ProtectedRoute><HoardingDetail /></ProtectedRoute>,
  },
  {
    path: "/preview",
    element: <ProtectedRoute><ImagePreview /></ProtectedRoute>,
  },
  {
    path: "/new-request",
    element: <ProtectedRoute><NewRequest /></ProtectedRoute>,
  },
  {
    path: "/request-history/:id",
    element: <ProtectedRoute><RequestHistory /></ProtectedRoute>,
  }
]);
