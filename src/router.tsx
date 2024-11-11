import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import HoardingDetail from "./pages/HoardingDetail";
import ImagePreview from "./pages/PreviewScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/hoarding/:id",
    element: <HoardingDetail />,
  },
  {
    path: "/preview",
    element: <ImagePreview />,
  }
]);
