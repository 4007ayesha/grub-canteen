import Navbar from './Navbar';
import Container from './Container';
import './PageLayout.css';

function PageLayout({ children }) {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <Container>
          {children}
        </Container>
      </main>
    </div>
  );
}

export default PageLayout;