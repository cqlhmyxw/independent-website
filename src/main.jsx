import { createRoot } from 'react-dom/client';
import App from './App';
import SEO from './components/SEO';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';

const root = createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <SEO
      title="我的独立网站"
      description="这是一个用于出售电子内容的独立站点，支持全球访问。"
      url="https://cqlhmyxw.github.io/independent-website/"
      image="https://cqlhmyxw.github.io/independent-website/og.png"
    />
    <App />
  </HelmetProvider>
);