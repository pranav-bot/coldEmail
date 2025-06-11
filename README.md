# PitchSnag 🚀

**AI-Powered Cold Email Generator for Job Seekers, Freelancers, and Startups**

PitchSnag is a sophisticated Next.js application that leverages AI to help professionals craft personalized cold emails and LinkedIn messages. Whether you're seeking internships, full-time roles, freelance gigs, or startup funding, PitchSnag analyzes your profile and generates tailored outreach content that opens doors.

## 🌟 Features

### Core Functionality
- **AI-Powered Email Generation**: Uses Google Gemini AI to create personalized cold emails and LinkedIn messages
- **Multi-Template Support**: Job search, freelance pitching, and startup funding templates
- **Lead Analysis**: Intelligent analysis of potential contacts from CSV/Excel files
- **Profile Building**: Automatic extraction and enhancement of user profiles from resumes/pitch decks
- **Workflow Management**: Step-by-step guided process for creating outreach campaigns

### Professional Templates
- **Job Seekers**: Perfect for landing internships, research roles, or full-time positions
- **Freelancers**: Tailored for client acquisition and project pitching
- **Startup Founders**: Optimized for investor outreach and funding campaigns

### Smart Features
- **Content Analysis**: PDF parsing for resumes, pitch decks, and business plans
- **Lead Qualification**: Automatic lead scoring and relevance analysis
- **Email Editor**: Rich text editor with formatting and attachment support
- **Preview & Edit**: Full editing capabilities before sending
- **Export Options**: Download emails as text files or copy to clipboard

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **TipTap** - Rich text editor for email composition
- **Clerk** - Authentication and user management

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Database ORM with PostgreSQL
- **Aurinko** - Email service integration
- **AI SDK** - Google Gemini AI integration

### AI & Data Processing
- **Google Gemini** - Primary AI model for content generation
- **OpenRouter** - Alternative AI provider
- **PDF Parser** - Resume and document analysis
- **CSV/Excel Parser** - Lead data processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Generative AI API key
- Clerk account for authentication
- Aurinko account for email integration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pitchsnag"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"

# Email Service (Aurinko)
AURINKO_CLIENT_ID="your_aurinko_client_id"
AURINKO_CLIENT_SECRET="your_aurinko_client_secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/pitchsnag.git
cd pitchsnag
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to `http://localhost:3000` in your browser.

## 📋 Usage Guide

### Creating Your First Workflow

1. **Sign Up/Sign In**: Create an account using Clerk authentication
2. **Go to Workflows**: Click "Go to Workflows" from the dashboard
3. **Select Template**: Choose from Job Search, Freelance, or Funding
4. **Upload Files**:
   - **Resume/Pitch Deck**: PDF document containing your profile
   - **Leads File**: CSV/Excel file with contact information
5. **Enter Prompt**: Describe your goals and preferences
6. **Generate Content**: Let AI create personalized emails and LinkedIn messages

### Workflow Steps

1. **Enhanced Intent**: AI analyzes and enhances your initial prompt
2. **Profile Analysis**: Extracts and structures information from your documents
3. **Lead Analysis**: Processes and qualifies leads from your uploaded file
4. **Content Generation**: Creates personalized emails and LinkedIn messages for each lead

### Email Features

- **Rich Text Editing**: Format emails with bold, italic, lists, and more
- **Attachments**: Add files to your emails
- **Preview Mode**: Review content before sending
- **Copy/Download**: Export emails for use in other platforms
- **Send Integration**: Direct sending through connected email accounts

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── mail/              # Email client interface
│   ├── workflows/         # Workflow management
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── workflow-*.tsx    # Workflow-specific components
├── lib/                  # Utility libraries
├── mail-agent/           # AI processing core
│   ├── buildProfile.ts   # Profile analysis
│   ├── leadAnalysis.ts   # Lead processing
│   ├── mailWriter.ts     # Email generation
│   └── intentAgent.ts    # Intent enhancement
├── server/               # tRPC server setup
├── hooks/                # React hooks
└── types/                # TypeScript type definitions
```

### Data Flow

1. **User Input** → Intent Agent (AI enhancement)
2. **Documents** → Content Analyzer (PDF parsing)
3. **Enhanced Intent + Content** → Profile Builder
4. **Leads File** → Lead Analyzer
5. **Profile + Leads** → Email/LinkedIn Writer
6. **Generated Content** → Workflow Editor

## 🔧 Configuration

### AI Models
The application supports multiple AI providers:
- **Google Gemini** (Primary): `gemini-2.0-flash`
- **OpenRouter** (Alternative): Various models available

### Email Integration
- **Aurinko**: Handles email sending and account management
- **OAuth**: Secure email account connection
- **SMTP**: Alternative email sending method

### Database Schema
Key entities:
- **Users**: Clerk-managed user accounts
- **Workflows**: Saved workflow configurations
- **Accounts**: Connected email accounts
- **Emails/Threads**: Email management

## 🎯 Use Cases

### Job Seekers
- Recent graduates seeking entry-level positions
- Experienced professionals changing careers
- Students looking for internships
- Researchers seeking academic positions

### Freelancers
- Consultants acquiring new clients
- Designers pitching creative projects
- Developers seeking contract work
- Writers building client relationships

### Startup Founders
- Seed-stage companies seeking initial funding
- Series A/B companies approaching VCs
- Bootstrapped startups looking for angel investors
- Corporate partnerships and collaborations

## 🔒 Security & Privacy

- **Data Encryption**: All data encrypted in transit and at rest
- **Secure Authentication**: Clerk-powered authentication with MFA support
- **API Security**: Rate limiting and request validation
- **GDPR Compliant**: User data rights and privacy controls

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```dockerfile
# Use the Dockerfile in the root directory
docker build -t pitchsnag .
docker run -p 3000:3000 pitchsnag
```

### Environment Setup
Ensure all environment variables are configured in your deployment platform.

## 📈 Performance

- **Response Times**: < 2s for AI-generated content
- **Scalability**: Supports concurrent users with optimized database queries
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Static assets served via CDN

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📚 API Documentation

### Workflow API
- `POST /api/workflow` - Create new workflow
- `POST /api/workflow/step` - Process workflow step
- `POST /api/workflow/update` - Update workflow content

### tRPC Procedures
- `account.*` - Email account management
- `workflow.*` - Workflow operations
- `email.*` - Email sending and management

## 🐛 Troubleshooting

### Common Issues

**AI Generation Failures**
- Check API key configuration
- Verify rate limits haven't been exceeded
- Ensure proper file formats (PDF for documents, CSV/XLSX for leads)

**Email Integration Issues**
- Verify Aurinko credentials
- Check OAuth callback URLs
- Ensure email permissions are granted

**Database Connection**
- Verify PostgreSQL connection string
- Run `npx prisma db push` to sync schema
- Check database user permissions

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Clerk** for authentication services
- **Aurinko** for email integration
- **Vercel** for deployment platform
- **Radix UI** for accessible components

## 📞 Support

- **Documentation**: [docs.pitchsnag.com](https://docs.pitchsnag.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/pitchsnag/issues)
- **Discord**: [Community Chat](https://discord.gg/pitchsnag)
- **Email**: support@pitchsnag.com

---

**Built with ❤️ for professionals who want to make meaningful connections**

*PitchSnag - Turn cold outreach into warm conversations*
