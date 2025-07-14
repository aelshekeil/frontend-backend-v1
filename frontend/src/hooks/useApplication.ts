import { useState } from 'react';
import { submitDrivingLicenseApplication, submitVisaApplication, trackApplication, DrivingLicenseApplicationData, VisaApplicationData } from '../lib/applicationApi';

export const useApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<any | null>(null);

  const submitDrivingLicense = async (data: DrivingLicenseApplicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await submitDrivingLicenseApplication(data);
      setTrackingNumber(response.data.trackingNumber);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitVisa = async (data: VisaApplicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await submitVisaApplication(data);
      setTrackingNumber(response.data.trackingNumber);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const track = async (trackingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await trackApplication(trackingId);
      setApplicationStatus(response);
    } catch (err) {
      setError('Failed to track application. Please check the tracking number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    trackingNumber,
    applicationStatus,
    submitDrivingLicense,
    submitVisa,
    track,
  };
};
