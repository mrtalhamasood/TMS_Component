import PodGenerator from "./components/pod/PodGenerator";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>TMS POD Generator</h1>
        <p className="app-subtitle">Generate, sign, and share proof of delivery documents.</p>
      </header>
      <main className="app-main">
        <PodGenerator />
      </main>
    </div>
  );
}

export default App;
