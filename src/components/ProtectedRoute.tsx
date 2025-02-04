import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const userId = sessionStorage.getItem('user_id');
    
    if (!userId) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};
