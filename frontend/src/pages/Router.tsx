import { FC, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import components
const Hero = lazy(() => import('./Hero'));
const Services = lazy(() => import('./Services'));
const TravelPackages = lazy(() => import('./TravelPackages'));
const ApplicationTracking = lazy(() => import('./ApplicationTracking'));
const Shop = lazy(() => import('./Shop'));
const AuthGuard = lazy(() => import('./AuthGuard'));
const Profile = lazy(() => import('./Profile'));

// New components we'll create
const EnhancedESIMShop = lazy(() => import('./EnhancedESIMShop'));
const TravelAccessories = lazy(() => import('./Travelaccessories'));
const EnhancedTravelPackages = lazy(() => import('./EnhancedTravelPackages'));
const VisaServices = lazy(() => import('./VisaServices'));
const BusinessIncorporation = lazy(() => import('./BusinessIncorporation'));
const Checkout = lazy(() => import('./Checkout'));
const VisaApplicationForm = lazy(() => import('./VisaApplicationForm'));
const InternationalDrivingLicense = lazy(() => import('./InternationalDrivingLicense'));

const Home: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Hero />
        <Services />
        <TravelPackages />
      </Suspense>
      <section id="contact" className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="section-title">{t('common.contact_us')}</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              {t('contact_section.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{t('contact_section.email_title')}</h3>
                <p className="text-gray-600">info@tarimtours.com</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{t('contact_section.phone_title')}</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{t('contact_section.office_hours_title')}</h3>
                <p className="text-gray-600">{t('contact_section.office_hours_time')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const RouterComponent: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/travel-packages" element={<TravelPackages />} />
        <Route path="/visa-application" element={<VisaApplicationForm />} />
        <Route path="/application-tracking" element={<ApplicationTracking />} />
        <Route path="/tracking" element={<ApplicationTracking />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/esim" element={<EnhancedESIMShop />} />
        <Route path="/accessories" element={<TravelAccessories />} />
        <Route path="/enhanced-travel-packages" element={<EnhancedTravelPackages />} />
        <Route path="/enhanced-esim" element={<EnhancedESIMShop />} />
        <Route path="/visa-services" element={<VisaServices />} />
        <Route path="/international-driving-license" element={<InternationalDrivingLicense />} />
        <Route path="/business-incorporation" element={<BusinessIncorporation />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Suspense>
  );
};

export default RouterComponent;
