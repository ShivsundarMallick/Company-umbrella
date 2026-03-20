import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-full">
                        <ShieldAlert className="w-12 h-12 text-red-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
                <p className="text-gray-600 mb-8">
                    You do not have permission to view this page. Please contact your administrator if you believe this is an error.
                </p>
                <div className="flex flex-col gap-3">
                    <Link to="/website">
                        <Button className="w-full">Go to Dashboard</Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="ghost" className="w-full">Sign in with another account</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
