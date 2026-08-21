import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      } else {
        setError('Failed to fetch applications');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      // Update local state
      setApplications(apps => 
        apps.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><CheckCircle size={12}/> Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><XCircle size={12}/> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[--color-acm-blue] rounded flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <span className="font-bold text-xl text-gray-900">Admin Dashboard</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 text-sm mt-1">Manage new member registrations</p>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total: {applications.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domains</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center text-[--color-acm-blue]">
                        <Loader2 className="animate-spin" size={32} />
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                        <div className="text-sm text-gray-500">{app.rollNumber}</div>
                        <div className="text-xs text-gray-400 mt-1">{app.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.yearOfStudy} Year</div>
                        <div className="text-sm text-gray-500">{app.branch} {app.section && `- Sec ${app.section}`}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {app.domainsInterested.map((domain, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-[--color-acm-blue] text-xs rounded border border-blue-100">
                              {domain}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {app.status !== 'approved' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'approved')}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-1.5 rounded-md transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
