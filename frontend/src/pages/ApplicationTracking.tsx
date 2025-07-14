import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApplication } from '../hooks/useApplication';
import Search from 'lucide-react/dist/esm/icons/search';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';

const ApplicationTracking: FC = () => {
  const { t } = useTranslation();
  const [trackingId, setTrackingId] = useState('');
  const { loading, error, applicationStatus, track } = useApplication();

  const handleTrack = () => {
    if (trackingId) {
      track(trackingId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('tracking.title') || 'Track Your Application'}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t('tracking.hero_subtitle') || 'Stay updated on your travel document application status with our real-time tracking system'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 rounded-full p-2">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {t('tracking.enter_tracking_id') || 'Enter Your Tracking ID'}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder={t('tracking.placeholder') || 'Enter your tracking number...'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading || !trackingId}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('common.loading') || 'Loading...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {t('tracking.track_button') || 'Track Application'}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Status Display */}
        {applicationStatus && applicationStatus.data && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Status Header */}
            <div className={`px-6 py-4 border-b border-gray-200 ${getStatusColor(applicationStatus.data.licenseStatus)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(applicationStatus.data.licenseStatus)}
                <div>
                  <h3 className="text-lg font-semibold">
                    {t('tracking.status_title') || 'Application Status'}
                  </h3>
                  <p className="text-sm opacity-80">
                    Your application is currently {applicationStatus.data.licenseStatus?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('tracking.tracking_number') || 'Tracking Number'}
                      </p>
                      <p className="text-lg font-semibold text-gray-800 font-mono">
                        {applicationStatus.data.trackingNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('tracking.submission_date') || 'Submission Date'}
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(applicationStatus.data.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      {getStatusIcon(applicationStatus.data.licenseStatus)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('tracking.current_status') || 'Current Status'}
                      </p>
                      <p className="text-lg font-semibold text-gray-800 capitalize">
                        {applicationStatus.data.licenseStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 rounded-full p-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('tracking.application_type') || 'Application Type'}
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {t('tracking.travel_document') || 'Travel Document'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('tracking.need_help') || 'Need Help?'}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('tracking.common_questions') || 'Common Questions'}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('tracking.processing_time_info') || 'Processing usually takes 5-10 business days'}</li>
                <li>• {t('tracking.email_updates_info') || 'You\'ll receive email updates for status changes'}</li>
                <li>• {t('tracking.keep_tracking_number_safe') || 'Keep your tracking number safe for future reference'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('tracking.contact_support') || 'Contact Support'}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {t('tracking.questions_about_application') || 'If you have questions about your application:'}
              </p>
              <div className="flex flex-col gap-2">
                <a href="mailto:tarimtours@gmail.com" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  tarimtours@gmail.com
                </a>
                <a href="tel:+60 10-335 3030" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  +60 10-335 3030
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracking;
