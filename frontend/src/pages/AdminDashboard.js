import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'react-router-dom';
import { 
  getPendingAgents, 
  getAllAgents, 
  getAllUsers, 
  getAllProperties,
  verifyAgent,
  rejectAgent
} from '../services/adminService';

const AdminDashboard = () => {
  const { t } = useTranslation('profile');
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('pendingAgents');
  const [pendingAgents, setPendingAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'pendingAgents':
            const pendingData = await getPendingAgents();
            setPendingAgents(pendingData);
            break;
          case 'allAgents':
            const agentsData = await getAllAgents();
            setAllAgents(agentsData);
            break;
          case 'allUsers':
            const usersData = await getAllUsers();
            setAllUsers(usersData);
            break;
          case 'allProperties':
            const propertiesData = await getAllProperties();
            setAllProperties(propertiesData);
            break;
          default:
            break;
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Redirect to="/" />;
  }

  const handleVerify = (agentId) => {
    if (!agentId) return;
    
    verifyAgent(agentId)
      .then(() => {
        return getPendingAgents();
      })
      .then((updatedAgents) => {
        setPendingAgents(updatedAgents);
      })
      .catch((err) => {
        setError(err.message || 'Failed to verify agent');
      });
  };

  const handleReject = (agentId) => {
    if (!agentId) return;
    
    rejectAgent(agentId)
      .then(() => {
        return getPendingAgents();
      })
      .then((updatedAgents) => {
        setPendingAgents(updatedAgents);
      })
      .catch((err) => {
        setError(err.message || 'Failed to reject agent');
      });
  };

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case 'pendingAgents':
        return pendingAgents.filter(agent => 
          (agent?.username || "").toLowerCase().includes(term) || 
          (agent?.company_name || "").toLowerCase().includes(term)
        );
      case 'allAgents':
        return allAgents.filter(agent => 
          (agent?.username || "").toLowerCase().includes(term) || 
          (agent?.company_name || "").toLowerCase().includes(term)
        );
      case 'allUsers':
        return allUsers.filter(user => 
          (user?.username || "").toLowerCase().includes(term) || 
          (user?.email || "").toLowerCase().includes(term)
        );
      case 'allProperties':
        return allProperties.filter(property => 
          (property?.address || "").toLowerCase().includes(term) || 
          (property?.city || "").toLowerCase().includes(term)
        );
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('admin.title')}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-wrap">
        <button
          className={`mr-2 mb-2 px-4 py-2 rounded-md ${
            activeTab === 'pendingAgents' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('pendingAgents')}
        >
          {t('admin.pendingAgents')}
        </button>
        <button
          className={`mr-2 mb-2 px-4 py-2 rounded-md ${
            activeTab === 'allAgents' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('allAgents')}
        >
          {t('admin.allAgents')}
        </button>
        <button
          className={`mr-2 mb-2 px-4 py-2 rounded-md ${
            activeTab === 'allUsers' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('allUsers')}
        >
          {t('admin.allUsers')}
        </button>
        <button
          className={`mr-2 mb-2 px-4 py-2 rounded-md ${
            activeTab === 'allProperties' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('allProperties')}
        >
          {t('admin.allProperties')}
        </button>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('admin.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'pendingAgents' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData().map((agent, index) => (
                    <tr key={agent?.agent_id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">{agent?.agent_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{agent?.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{agent?.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {agent?.license_image && (
                          
                            href={agent.license_image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View License
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleVerify(agent?.agent_id)}
                          className="mr-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md"
                        >
                          {t('admin.verify')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(agent?.agent_id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md"
                        >
                          {t('admin.reject')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {activeTab === 'allAgents' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData().map((agent, index) => (
                    <tr key={agent?.agent_id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">{agent?.agent_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{agent?.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{agent?.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          agent?.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : agent?.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {agent?.verification_status && t(`agent.${agent.verification_status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {activeTab === 'allUsers' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData().map((user, index) => (
                    <tr key={user?.user_id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">{user?.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user?.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user?.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user?.phone_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{user?.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {activeTab === 'allProperties' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (만원)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData().map((property, index) => (
                    <tr key={property?.property_id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">{property?.property_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{property?.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{property?.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{property?.property_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {property?.deposit} / {property?.monthly_rent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{property?.agent_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
