import { useTranslation } from 'react-i18next';

export default function App() {
  const { t } = useTranslation();
  return (
    <>
      <header>
        <h1>{t('welcome')}</h1>
        <p>这是一个示例站点，您可以自行修改内容。</p>
      </header>
      <main>
        <section>
          <h2>关于我</h2>
          <p>这里可以放置个人介绍或业务描述。</p>
        </section>
        <section>
          <h2>最新动态</h2>
          <ul>
            <li>项目已于 2026-06-11 创建。</li>
            <li>欢迎提交反馈或建议。</li>
          </ul>
        </section>
      </main>
      <footer>
        <p>&copy; 2026 我的独立网站</p>
      </footer>
    </>
  );
}