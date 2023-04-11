import { Container } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";

// Layout
import Layout from "./layout/Layout";

// pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import NewsArticle from "./pages/NewsArticle";
import './index.css';


const App = () => {
  return (
    <Layout>
      <Container>
        <Routes>
        <Route path="/" element={<Home />} exact />
          <Route path="/about" element={<About />} />
          <Route path="/article/:id" element={<NewsArticle />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Container>
    </Layout>
  );
};

export default App;
