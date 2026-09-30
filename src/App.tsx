import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Flow } from "./pages/Flow";
import { ThankYou } from "./pages/ThankYou";
import { Admin } from "./pages/Admin";
import { SessionProvider } from "./lib/session";

export default function App() {
  // basename permite hospedar em subcaminho (ex.: GitHub Pages /pnv-avaliacoes/).
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/avaliar" element={<Flow />} />
          <Route path="/obrigado" element={<ThankYou />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
