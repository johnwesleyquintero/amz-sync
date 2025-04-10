<div align="center">
  <img src="public/logo.svg" width="100" alt="AmzSync Logo" />

# AmzSync - Formerly My Amazon Analytics

### Next-Gen Amazon Advertising Automation Platform

[![Netlify Status](https://api.netlify.com/api/v1/badges/5e8f7348-e74c-4014-b1be-1aba4dd5043c/deploy-status)](https://app.netlify.com/sites/amzsync/deploys)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fjohnwesleyquintero%2Famzsync)](https://twitter.com/intent/tweet?text=Check%20out%20AmzSync%20-%20Automated%20Amazon%20Advertising%20Platform&url=https%3A%2F%2Fgithub.com%2Fjohnwesleyquintero%2Famzsync)

**Transform Your Amazon Advertising Strategy with Data-Driven Insights**

[▲ Vercel](https://amzsync.vercel.app/) • [✳ Netlify](https://amzsync.netlify.app/) • [📚 Documentation/Roadmap](https://github.com/johnwesleyquintero/amzsync/blob/main/TODO.md) • [🐞 Report Issue](https://github.com/johnwesleyquintero/amzsync/issues)

</div>

---

## 🌟 Key Features

### 📊 Comprehensive Analytics

- Real-time campaign performance tracking
- Advanced search term analysis
- Competitor benchmarking
- Automated performance alerts

### 🔄 Seamless Integrations

- Amazon Seller Central API
- Google Workspace (Sheets, Drive)
- Chrome Extension for quick access
- Webhooks for custom integrations

### 🛠️ Powerful Tools

- AI-powered bid optimization
- Automated rule engine
- Custom report builder
- Multi-account management

## 🏗️ Architecture Overview

```mermaid
graph TD
    A[Chrome Extension] -->|Sync Data| C[Web Dashboard]
    C --> D[Google Sheets]
    A --> E[Amazon Seller Central]
    C --> F[Email/SMS Alerts]
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Amazon Seller Central API credentials

### Installation

```bash
git clone https://github.com/johnwesleyquintero/amzsync.git
cd amzsync
npm install
cp .env.example .env
```

### Configuration

- Update environment variables in `.env`
- Set up Amazon API credentials

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Pro Tip

If you're using [Bun] as your package manager, you can use the following command to run the project:

```bash
bun cq
```

## 📈 Feature Roadmap

> For a detailed breakdown of our development plans, please refer to our Roadmap.

| Quarter | Features                               |
| :------ | :------------------------------------- |
| Q3 2023 | Basic Dashboard                        |
| Q4 2023 | Chrome Extension, Automated Rules      |
| Q1 2024 | AI Optimization, Multi-Account Support |
| Q2 2024 | Mobile App, Advanced Reporting         |

## 🤝 Contributing

We welcome contributions! Please see our [Contribution Guidelines](CONTRIBUTING.md) for details.

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

John Wesley Quintero - [@wescode](https://twitter.com/wescode) - info.wescode@gmail.com

Project Link: https://github.com/johnwesleyquintero/amzsync

---
