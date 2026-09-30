import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { FormPage } from "./pages/FormPage";
import { Results } from "./pages/Results";

export default function App() {
  // basename permite hospedar em subcaminho (ex.: GitHub Pages /pnv-avaliacoes/).
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form/:slug" element={<FormPage />} />
        <Route path="/resultados" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
