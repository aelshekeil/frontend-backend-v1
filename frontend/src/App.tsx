import { HashRouter as Router } from 'react-router-dom';
import { CartProvider } from './components/common/CartProvider';
import Header from './components/layout/Header';
import RouterComponent from './pages/Router';
import Footer from './components/layout/Footer';
import WhatsAppButton from './pages/WhatsAppButton';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  console.log("App component rendered");
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="pt-16">
            <RouterComponent />
          </main>
          <Footer />
          <WhatsAppButton /> {/* Render the WhatsAppButton here */}
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
