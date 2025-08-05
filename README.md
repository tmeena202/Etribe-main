# eTribe - Tribal Community Management System

A comprehensive React-based management system for tribal/community organizations, providing modules for member management, event management, admin controls, notifications, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd etribe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 Documentation

This project includes comprehensive documentation to help developers and stakeholders understand and work with the system:

### Core Documentation
- **[Documentation Workflow](DOCUMENTATION_WORKFLOW.md)** - Complete project overview and documentation structure
- **[API Documentation](API_DOCUMENTATION.md)** - Detailed API endpoints and integration guide
- **[Component Documentation](COMPONENT_DOCUMENTATION.md)** - Comprehensive component library and usage guide
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions for all environments

### Quick Reference
- **Tech Stack**: React 19.1.0, Vite, Tailwind CSS, Axios, React Router DOM
- **Architecture**: Component-based with Context API for state management
- **Styling**: Tailwind CSS with dark/light mode support
- **Notifications**: React Toastify for user feedback
- **Charts**: Recharts for analytics and data visualization

## 🏗️ Project Structure

```
src/
├── api/                    # API configuration and utilities
├── components/            # Reusable UI components
│   ├── Layout/           # Layout components (Sidebar, TopBar, Footer)
│   ├── Sidebar/          # Navigation sidebar
│   ├── StatusCards/      # Dashboard status indicators
│   ├── AnalyticsGraph/   # Charts and analytics
│   ├── ImportantContacts/ # Contact management
│   ├── EventsSection/    # Event-related components
│   ├── PastEventCard/    # Past events display
│   ├── TotalEventCard/   # Event statistics
│   └── UpcomingEvents/   # Upcoming events display
├── context/              # React Context providers
├── pages/                # Main application pages
├── utils/                # Utility functions
└── assets/              # Static assets
```

## 🎯 Core Features

### Member Services
- **Active Members**: View and manage active community members
- **Pending Approval**: Handle new member registrations
- **Membership Expired**: Track expired memberships
- **Payment Details**: Manage membership payments
- **Member Details**: Comprehensive member profiles

### Event Management
- **All Events**: Complete event management system
- **Upcoming Events**: Future event planning and registration
- **Past Events**: Historical event records and analytics
- **Calendar**: Integrated calendar view

### Admin Management
- **Admin Accounts**: User account management
- **User Roles**: Role-based access control
- **Role Management**: Permission system administration

### Notifications
- **Feedbacks**: Collect and manage user feedback
- **Circulars**: Announcement and notification system

### Grievance Management
- **Active Grievances**: Track ongoing issues
- **Pending Grievances**: Handle new submissions
- **Closed Grievances**: Resolution tracking

### Master Settings
- **Group Data**: Organization profile management
- **SMTP Settings**: Email configuration
- **Message Settings**: Communication preferences
- **Additional Fields**: Custom field management
- **Membership Plans**: Plan configuration

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

### Environment Variables
```env
VITE_API_BASE_URL=https://api.etribes.ezcrm.site
VITE_CLIENT_SERVICE=your_client_service
VITE_AUTH_KEY=your_auth_key
VITE_RURL=your_rurl
```

### Code Style
- **ESLint**: Configured for React and modern JavaScript
- **Prettier**: Code formatting (recommended)
- **Conventional Commits**: Git commit message standards

## 🚀 Deployment

### Quick Deploy Options
- **Netlify**: Connect repository and deploy automatically
- **Vercel**: One-click deployment with Vercel CLI
- **GitHub Pages**: Static hosting with GitHub Actions

### Traditional Deployment
- **Nginx**: Production web server configuration
- **Apache**: Alternative web server setup
- **Docker**: Containerized deployment

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔒 Security

### Authentication
- JWT-based authentication
- Protected routes with automatic token validation
- Secure token storage in localStorage
- Auto-logout on token expiration

### Data Protection
- HTTPS encryption for all requests
- Input validation and sanitization
- XSS protection
- CSRF protection

## 📊 Monitoring

### Performance
- Bundle size optimization
- Code splitting for better loading times
- Image optimization
- Caching strategies

### Error Tracking
- Error boundaries for graceful error handling
- Console logging for debugging
- User-friendly error messages

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

## 📞 Support

### Getting Help
- Check the documentation files for detailed guides
- Review the API documentation for integration help
- Examine component documentation for UI development
- Refer to deployment guide for hosting issues

### Common Issues
- **Build Errors**: Clear cache and reinstall dependencies
- **API Issues**: Verify environment variables and network connectivity
- **Styling Problems**: Check Tailwind CSS configuration
- **Routing Issues**: Ensure proper web server configuration

## 📈 Roadmap

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: Enhanced reporting capabilities
- **Mobile App**: React Native version
- **API Documentation**: Swagger/OpenAPI integration

### Technical Improvements
- **TypeScript Migration**: Enhanced type safety
- **Performance Optimization**: Code splitting and lazy loading
- **Accessibility**: WCAG compliance improvements
- **Internationalization**: Multi-language support

## 📄 License

This project is proprietary software. All rights reserved.

---

**eTribe** - Empowering tribal communities through digital management solutions.

For detailed documentation, see the individual documentation files in this repository.
