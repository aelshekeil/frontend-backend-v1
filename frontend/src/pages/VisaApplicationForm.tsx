import { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { VisaApplicationData, submitVisaApplication } from '../lib/applicationApi';
import Dropzone from './Dropzone';
import ProgressBar from './ProgressBar';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import arLocale from 'i18n-iso-countries/langs/ar.json';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

const VisaApplicationForm: FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState<Partial<VisaApplicationData>>({});
  const [files, setFiles] = useState<{ passportCopy?: File, photo?: File, additionalDocuments?: File[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isLoggedIn, user } = useAuth();

  const handleFileChange = useCallback((file: File, field: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string, name?: string) => {
    if (name === 'phone' && typeof e === 'string') {
      setFormData(prev => ({ ...prev, phone: e }));
    } else if (typeof e === 'object' && 'target' in e) {
      const { name: targetName, value } = e.target;
      setFormData(prev => ({ ...prev, [targetName]: value }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const requiredFields: (keyof Omit<VisaApplicationData, 'passportCopy' | 'photo' | 'additionalDocuments'>)[] = [
      'fullName', 'email', 'phone', 'passportNumber', 'nationality', 'destinationCountry', 'visaType', 'travelDate'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setValidationError(`${t('common.fill_required_fields')}: ${missingFields.join(', ')}`);
      return;
    }

    if (!files.passportCopy || !files.photo) {
      setValidationError(t('common.upload_required_documents'));
      return;
    }

    if (!user?.id) {
      setValidationError(t('common.login_required_text'));
      return;
    }

    const applicationData: VisaApplicationData = {
      ...formData,
      passportCopy: files.passportCopy,
      photo: files.photo,
    } as VisaApplicationData;

    if (files.additionalDocuments) {
      applicationData.additionalDocuments = files.additionalDocuments;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await submitVisaApplication(applicationData);
      setTrackingNumber(response.data.trackingNumber);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || t('common.submission_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof Omit<VisaApplicationData, 'passportCopy' | 'photo' | 'additionalDocuments'>)[] = [
      'fullName', 'email', 'phone', 'passportNumber', 'nationality', 'destinationCountry', 'visaType', 'travelDate'
    ];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setValidationError(`${t('common.fill_required_fields')}: ${missingFields.join(', ')}`);
      return;
    }
    if (!files.passportCopy || !files.photo) {
      setValidationError(t('common.upload_required_documents'));
      return;
    }
    setValidationError(null);
    setIsReviewing(true);
    setCurrentStep(2);
  };

  const steps = [
    t('visa_application.steps.upload'),
    t('visa_application.steps.review'),
    t('visa_application.steps.payment'),
    t('visa_application.steps.delivery'),
  ];

  if (trackingNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl w-full border border-gray-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('common.submission_successful')}</h2>
          <p className="text-gray-600 mb-6">Your application has been successfully submitted and is being processed.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-lg text-gray-700 mb-2">{t('common.tracking_number_is')}</p>
            <p className="text-2xl font-bold text-blue-600">{trackingNumber}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgressBar currentStep={currentStep} steps={steps} />
      {!isLoggedIn ? (
        <div className="text-center p-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl mt-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          </div>
          <h3 className="text-2xl font-bold text-yellow-800 mb-4">{t('common.login_required_title')}</h3>
          <p className="text-yellow-700 text-lg">{t('common.login_required_text')}</p>
        </div>
      ) : (
        <form onSubmit={isReviewing ? handleSubmit : handleReview}>
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="w-6 h-6 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    name="fullName" 
                    placeholder={t('common.full_name')} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                    required 
                    disabled={isReviewing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder={t('common.email')} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                    required 
                    disabled={isReviewing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <PhoneInput
                    name="phone"
                    placeholder={t('common.phone')}
                    value={formData.phone}
                    onChange={(value) => handleChange(value || '', 'phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    required
                    disabled={isReviewing}
                    defaultCountry="US"
                    international
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                  <input 
                    name="passportNumber" 
                    placeholder={t('visa_application.passport_number')} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                    required 
                    disabled={isReviewing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select
                    name="nationality"
                    value={formData.nationality || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    required
                    disabled={isReviewing}
                  >
                    <option value="">{t('common.select_nationality')}</option>
                    {Object.entries(countries.getNames(i18n.language === 'ar' ? 'ar' : 'en')).map(([code, name]) => (
                      <option key={code} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination Country</label>
                  <input 
                    name="destinationCountry" 
                    placeholder={t('visa_application.destination_country')} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                    required 
                    disabled={isReviewing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                  <select 
                    name="visaType" 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                    required 
                    disabled={isReviewing}
                  >
                    <option value="">{t('visa_application.select_visa_type')}</option>
                    <option value="tourist">{t('visa_application.tourist_visa')}</option>
                    <option value="business">{t('visa_application.business_visa')}</option>
                    <option value="student">{t('visa_application.student_visa')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
                  <input 
                    name="travelDate" 
                    type="date" 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                    required 
                    disabled={isReviewing}
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="w-6 h-6 text-green-600" />
                Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Dropzone onFileChange={(file) => handleFileChange(file, 'passportCopy')} label={t('visa_application.passport_copy')} />
                <Dropzone onFileChange={(file) => handleFileChange(file, 'photo')} label={t('visa_application.photo')} />
                <Dropzone onFileChange={(file) => handleFileChange(file, 'additionalDocuments')} label={t('common.additional_documents')} />
              </div>
            </div>
          </div>
          
          {/* Error Messages */}
          {(validationError || error) && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700 font-medium">{validationError || error}</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            {isReviewing ? (
              <>
                <button
                  type="button"
                  onClick={() => { setIsReviewing(false); setCurrentStep(1); }}
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold border border-gray-300 hover:border-gray-400"
                  >
                  {t('common.edit')}
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.submitting')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {t('common.submit_application')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {t('common.review_application')}
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
};

export default VisaApplicationForm;
