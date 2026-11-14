
import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";

import Hero from "./assets/sections/Hero";
import About from "./assets/sections/About";
import Skills from "./assets/sections/Skills";
import Projects from "./assets/sections/Projects";
import Experience from "./assets/sections/Experience";
import Contact from "./assets/sections/Contact";

function App() {
  return (
    <div className="min-h-svh overflow-x-clip bg-[#0B1120] text-white">

      <Navbar />

      <main className="overflow-x-clip">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      <Footer />

    </div>
  );
}

export default App;
