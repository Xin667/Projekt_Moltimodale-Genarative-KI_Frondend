import { Stepper } from './components/Stepper.tsx'
import { AppShell } from './components/Appshell.tsx'
// import { InputPage } from './pages/input.tsx'

import './App.css'

function App() {
  return (
    <>

      <section id="center">

      </section>
      <AppShell
      
        sidebarLeft={

        <Stepper 
          currentStep={1}
          unlockedStep={3}
          onStepClick={() => {}}
        />}
        mainContent={
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Main Content</h1>
          <p>This is the main content area.</p>
        </div>}
        sidebarRight={
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Sidebar Right</h1>
          <p>This is the right sidebar content.</p>
        </div>}
      />


    </>
  )
}

export default App
