
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";

import Hero from "./assets/sections/Hero";
import About from "./assets/sections/About";
import Skills from "./assets/sections/Skills";
import Projects from "./assets/sections/Projects";
import Experience from "./assets/sections/Experience";
import Contact from "./assets/sections/Contact";
import CV from "./assets/pages/CV";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh overflow-x-clip bg-[#0B1120] text-white">

        <Navbar />

        <main className="overflow-x-clip">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <About />
                <Skills />
                <Projects />
                <Experience />
                <Contact />
              </>
            } />
            <Route path="/cv" element={<CV />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;
