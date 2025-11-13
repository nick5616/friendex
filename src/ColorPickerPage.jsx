import { useNavigate, useLocation } from "react-router-dom";
import UserColorPicker from "./UserColorPicker";

function ColorPickerPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const basePath = isDemoMode ? "/demo" : "";
    
    const handleCancel = () => {
        navigate(basePath || "/");
    };
    
    return (
        <div className="min-h-screen p-4 md:p-8">
            <UserColorPicker 
                onCancel={handleCancel}
                basePath={basePath}
            />
        </div>
    );
}

export default ColorPickerPage;

