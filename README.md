# HealthLens AI 🔬

> AI-powered medical report analysis platform that transforms complex medical data into clear, actionable health insights.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Problem

Medical reports are confusing. Patients receive complex lab results filled with medical jargon, leaving them anxious and uncertain about their health. Many people can't afford frequent doctor visits just to understand their reports.

## 💡 Solution

HealthLens AI democratizes healthcare understanding using advanced AI to:
- 📸 **Smart Upload** - Accept medical reports in any format (PDF, images, scanned documents)
- 🧠 **AI Analysis** - Extract and analyze medical data using Google Gemini AI
- 📊 **Visual Insights** - Present complex data in easy-to-understand charts and graphs
- 🔮 **Health Prediction** - Analyze patterns across multiple reports to predict health risks
- 💬 **AI Chat** - Answer questions about your reports in plain language
- 📈 **Trend Tracking** - Monitor health metrics over time

## ✨ Key Features

### 🎯 AI Health Risk Predictor (Winning Feature)
Our standout innovation analyzes patterns across multiple reports to predict:
- Cardiovascular health risks
- Diabetes risk assessment
- Anemia detection
- Overall health score with actionable recommendations

### 🔐 Context-Aware AI
Unlike other tools, HealthLens AI remembers your medical history and provides personalized insights based on your complete health profile.

### 🎨 Modern UI/UX
- Beautiful, responsive design
- Dark mode support
- Smooth animations
- Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **AI/ML**: Google Gemini 2.5 Flash
- **OCR**: Tesseract.js (image text extraction)
- **PDF**: Native browser PDF.js
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/healthlens-ai.git
cd healthlens-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Getting API Keys

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key (free tier available)
3. Copy the key to your `.env.local`

### Clerk Authentication
1. Sign up at [Clerk.com](https://clerk.com)
2. Create a new application
3. Copy the API keys from the dashboard

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Copy configuration from Project Settings

## 📁 Project Structure

```
healthlens-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── chat/             # AI chat interface
│   ├── landing/          # Landing page
│   └── sign-in/          # Authentication pages
├── components/            # React components
│   ├── AnalysisResult.tsx
│   ├── HealthInsights.tsx
│   ├── MedicalHistory.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── ai.ts             # AI integration
│   ├── firebase.ts       # Firebase config
│   ├── ocr.ts            # OCR processing
│   └── pdf.ts            # PDF handling
└── public/               # Static assets
```

## 🎨 Features in Detail

### Medical Report Analysis
- Upload reports as images (JPG, PNG) or PDF
- Automatic text extraction using OCR
- AI-powered analysis of medical values
- Identification of abnormal results

### Health Risk Prediction
- Cardiovascular health assessment
- Diabetes risk calculation
- Anemia detection
- Personalized health recommendations

### Report History
- Store unlimited reports
- View past analyses
- Track health trends over time
- Compare results across dates

### AI Health Chat
- Ask questions about your reports
- Get explanations in simple language
- Receive personalized health advice

## 🔒 Security & Privacy

- End-to-end encryption for data transmission
- Secure authentication with Clerk
- HIPAA-compliant data handling practices
- No data sharing with third parties

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
npm install -g vercel
vercel
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

HealthLens AI is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ for the hackathon

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- Clerk for seamless authentication
- Firebase for reliable database
- Next.js team for an amazing framework

---

**⭐ If you find this project useful, please consider giving it a star!**
