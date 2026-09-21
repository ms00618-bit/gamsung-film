import Nav from './components/Nav'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import Reel from './sections/Reel'
import Works from './sections/Works'
import Pipeline from './sections/Pipeline'
import Numbers from './sections/Numbers'
import About from './sections/About'

export default function App() {
  return (
    <div className="grain min-h-screen bg-ink">
      <Nav />
      <main>
        <Hero />
        <Reel />
        <Works />
        <Pipeline />
        <Numbers />
        <About />
      </main>
      <Footer />
    </div>
  )
}
