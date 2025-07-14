import axios, { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://back.tarimtours.com/';

export interface DrivingLicenseApplicationData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  idCopy: File;
  photo: File;
  oldLicenseCopy: File;
}

export interface VisaApplicationData {
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  destinationCountry: string;
  visaType: string;
  travelDate: string;
  passportCopy: File;
  photo: File;
  additionalDocuments?: File[];
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { jwt } = JSON.parse(user);
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
  }
  return config;
});

export const submitDrivingLicenseApplication = async (
  data: DrivingLicenseApplicationData
) => {
  const { idCopy, photo, oldLicenseCopy, ...otherData } = data;

  // Step 1: Create the entry with JSON data first.
  const response = await api.post('/api/driving-license-applications', { data: otherData });
  const entryId = response.data.data.id;

  // Step 2: Upload the files and link them to the new entry.
  const uploadPromises: Promise<AxiosResponse<any>>[] = [];
  const filesToUpload = [
    { file: idCopy, field: 'idCopy' },
    { file: photo, field: 'photo' },
    { file: oldLicenseCopy, field: 'oldLicenseCopy' },
  ];

  filesToUpload.forEach(({ file, field }) => {
    if (file) {
      const formData = new FormData();
      formData.append('files', file, file.name);
      formData.append('ref', 'api::driving-license-application.driving-license-application');
      formData.append('refId', entryId);
      formData.append('field', field);
      uploadPromises.push(api.post('/api/upload', formData));
    }
  });

  await Promise.all(uploadPromises);

  // Return the response from the initial data creation, which contains the tracking number.
  return response.data;
};

export const submitVisaApplication = async (data: VisaApplicationData) => {
  const { passportCopy, photo, additionalDocuments, ...otherData } = data;

  // Step 1: Create the entry with JSON data first.
  const response = await api.post('/api/visa-applications', { data: otherData });
  const entryId = response.data.data.id;

  // Step 2: Upload the files and link them to the new entry.
  const uploadPromises: Promise<AxiosResponse<any>>[] = [];
  
  if (passportCopy) {
    const formData = new FormData();
    formData.append('files', passportCopy, passportCopy.name);
    formData.append('ref', 'api::visa-application.visa-application');
    formData.append('refId', entryId);
    formData.append('field', 'passportCopy');
    uploadPromises.push(api.post('/api/upload', formData));
  }

  if (photo) {
    const formData = new FormData();
    formData.append('files', photo, photo.name);
    formData.append('ref', 'api::visa-application.visa-application');
    formData.append('refId', entryId);
    formData.append('field', 'photo');
    uploadPromises.push(api.post('/api/upload', formData));
  }

  if (additionalDocuments && additionalDocuments.length > 0) {
    additionalDocuments.forEach(file => {
      const formData = new FormData();
      formData.append('files', file, file.name);
      formData.append('ref', 'api::visa-application.visa-application');
      formData.append('refId', entryId);
      formData.append('field', 'additionalDocuments');
      uploadPromises.push(api.post('/api/upload', formData));
    });
  }

  await Promise.all(uploadPromises);

  // Return the response from the initial data creation.
  return response.data;
};

export const trackApplication = async (trackingNumber: string) => {
  const response = await api.get(`/api/track/${trackingNumber}`);
  return response.data;
};
