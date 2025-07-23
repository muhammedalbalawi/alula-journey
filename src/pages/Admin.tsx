import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  return (
    <div className="relative">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main
          </Button>
        </Link>
      </div>
      
      <AdminDashboard />
    </div>
  );
}