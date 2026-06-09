import { useState } from "react";
import { Header } from "./components/Header";
import { WorkshopSection } from "./components/WorkshopSection";
import { Gate } from "./components/Gate";

export default function App() {
  const [entered, setEntered] = useState(false);

  if (!entered) return <Gate onEnter={() => setEntered(true)} />;

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      <Header />
      <main className="min-h-0 flex-1">
        <WorkshopSection />
      </main>
    </div>
  );
}
