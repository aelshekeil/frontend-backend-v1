# Tarim Tours Frontend

A modern, responsive React frontend for tarimtours.com built with TypeScript, Tailwind CSS, and designed to work seamlessly with Strapi CMS as the backend.

## Features

- **Modern React with TypeScript**: Type-safe development with excellent developer experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Strapi Integration**: Ready-to-use API service layer for Strapi CMS
- **Authentication**: User login/registration with JWT tokens
- **Form Handling**: Advanced form components with file uploads
- **Application Tracking**: Real-time application status tracking
- **Travel Services**: Complete travel and business service platform

## Services Included

1. **Visa Services**: E-Visa and Transit Visa applications with document uploads
2. **International Driving License**: Worldwide driving permit applications
3. **Business Incorporation**: Company registration in multiple countries
4. **Travel Packages**: Curated travel experiences with booking system
5. **eSIM Sales**: Global connectivity solutions
6. **Application Tracking**: Real-time status tracking for all services

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **Custom hooks** for API interactions
- **Strapi API integration** ready

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation with auth
│   ├── Hero.tsx        # Landing section
│   ├── Services.tsx    # Services overview
│   ├── TravelPackages.tsx  # Travel packages display
│   ├── VisaApplicationForm.tsx  # Visa application form
│   ├── ApplicationTracking.tsx  # Status tracking
│   ├── AuthModal.tsx   # Login/register modal
│   └── Footer.tsx      # Site footer
├── hooks/              # Custom React hooks
│   └── useAPI.ts       # API interaction hooks
├── lib/                # Utilities and services
│   ├── api.ts          # Strapi API service
│   ├── types.ts        # TypeScript interfaces
│   └── utils.ts        # Helper functions
├── App.tsx             # Main application
├── App.css             # Custom styles
└── main.tsx            # Application entry point
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-strapi-backend.com
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_URL` with your Strapi backend URL

3. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   # or
   pnpm run build
   ```

## Strapi Backend Requirements

This frontend expects the following Strapi content types:

### Content Types

1. **Travel Package** (`travel-package`)
   - title (Text)
   - description (Rich Text)
   - destination (Text)
   - price (Number)
   - duration (Text)
   - rating (Number)
   - featured (Boolean)
   - cover_image (Media)

2. **Visa Application** (`visa-application`)
   - fullName (Text)
   - email (Email)
   - phone (Text)
   - country (Text)
   - visaType (Text)
   - passportNumber (Text)
   - travelDate (Date)
   - tracking_id (Text)
   - status (Enumeration: pending, processing, approved, rejected)
   - documents (Media - Multiple)

3. **Driving License Application** (`driving-license-application`)
   - Similar structure to visa applications

4. **Business Incorporation** (`business-incorporation`)
   - Similar structure with business-specific fields

### API Endpoints

The frontend expects these Strapi API endpoints:

- `GET /api/travel-packages` - Fetch travel packages
- `POST /api/visa-applications` - Submit visa application
- `POST /api/driving-license-applications` - Submit driving license application
- `POST /api/business-incorporations` - Submit business incorporation
- `GET /api/{type}-applications?filters[tracking_id][$eq]={id}` - Track applications
- `POST /api/auth/local` - User login
- `POST /api/auth/local/register` - User registration
- `POST /api/upload` - File uploads

## Deployment

### Frontend Deployment (Coolify)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy in Coolify**:
   - Create new service
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set environment variables
   - Deploy

### Environment Variables for Production

```env
VITE_API_URL=https://api.tarimtours.com
```

## API Integration

The frontend uses a centralized API service (`src/lib/api.ts`) that handles:

- Authentication with JWT tokens
- Content fetching from Strapi
- Form submissions with file uploads
- Application tracking
- Error handling

### Example Usage

```typescript
import strapiAPI from '../lib/api';

// Fetch travel packages
const packages = await strapiAPI.getTravelPackages(true); // featured only

// Submit visa application
const result = await strapiAPI.submitVisaApplication(formData, files);

// Track application
const status = await strapiAPI.trackApplication(trackingId, 'visa');
```

## Customization

### Styling

- Modify `src/App.css` for custom styles
- Update Tailwind classes in components
- Colors and spacing defined in CSS custom properties

### Adding New Services

1. Create new form component in `src/components/`
2. Add API method in `src/lib/api.ts`
3. Update types in `src/lib/types.ts`
4. Add to main App component

### Branding

- Update logo and colors in `src/components/Header.tsx`
- Modify hero section in `src/components/Hero.tsx`
- Update contact information in `src/components/Footer.tsx`

## Support

For technical support or customization requests, please contact the development team.

## License

This project is proprietary software developed for Tarim Tours.

