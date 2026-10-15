import Nav from './components/Nav'
import Backdrop from './components/Backdrop'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import Reel from './sections/Reel'
import Works from './sections/Works'
import Pipeline from './sections/Pipeline'
import Numbers from './sections/Numbers'
import About from './sections/About'

export default function App() {
  return (
    <div className="grain relative min-h-screen bg-ink">
      {/* 히어로 아래 구역들의 배경 — 스크롤에 맞춰 감기는 히어로 영상 */}
      <Backdrop />
      <Nav />
      <main className="relative z-10">
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
