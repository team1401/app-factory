const { useState } = React;

const MEMORIES_2016 = {
  music: [
    { title: "One Dance", artist: "Drake", vibe: "You had this on repeat at every party" },
    { title: "Closer", artist: "The Chainsmokers ft. Halsey", vibe: "Your summer anthem" },
    { title: "Can't Stop the Feeling", artist: "Justin Timberlake", vibe: "Guilty pleasure that got you moving" },
    { title: "Work", artist: "Rihanna ft. Drake", vibe: "Work work work work work" },
    { title: "Hotline Bling", artist: "Drake", vibe: "You definitely did the dance" },
    { title: "Don't Let Me Down", artist: "The Chainsmokers", vibe: "Pre-game soundtrack" }
  ],
  
  moments: [
    { event: "Mannequin Challenge", description: "You froze mid-action at least once", icon: "🗿" },
    { event: "Pokémon GO Launch", description: "You walked into a pole catching a Pikachu", icon: "📱" },
    { event: "Damn Daniel", description: "Back at it again with the white Vans", icon: "👟" },
    { event: "Harambe", description: "RIP. Never forget.", icon: "🦍" },
    { event: "Bottle Flip Challenge", description: "You landed it exactly once and peaked", icon: "🍾" },
    { event: "Running Man Challenge", description: "Your moves were... enthusiastic", icon: "🏃" }
  ],
  
  apps: [
    { name: "Vine", memory: "You had 47 followers and felt famous" },
    { name: "Dubsmash", memory: "Lip-syncing was your secret talent" },
    { name: "Musical.ly", memory: "Before it became TikTok" },
    { name: "Snapchat", memory: "Dog filter was your entire personality" },
    { name: "Instagram", memory: "You over-used Valencia and Sierra filters" }
  ],
  
  slang: [
    { old: "fr fr", new: "for real for real", context: "Everything was fr fr" },
    { old: "lit", new: "fire/awesome", context: "That party was lit" },
    { old: "on fleek", new: "perfect", context: "Eyebrows on fleek" },
    { old: "bae", new: "babe/sweetie", context: "Hey bae" },
    { old: "savage", new: "ruthless/harsh", context: "That comeback was savage" },
    { old: "slay", new: "kill it", context: "You slayed that outfit" }
  ]
};

function PolaroidCard({ title, content, delay = 0, emoji }) {
  return (
    <div className="polaroid" style={{ animationDelay: `${delay}ms` }}>
      <div className="polaroid-photo">
        {emoji && <div className="polaroid-emoji">{emoji}</div>}
        <div className="polaroid-content">
          <h3>{title}</h3>
          <p>{content}</p>
        </div>
      </div>
      <div className="polaroid-caption">{title}</div>
    </div>
  );
}

function App() {
  const [formData, setFormData] = useState({ age: '', vibe: 'chill' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate "generating" with a delay for effect
    setTimeout(() => {
      const currentAge = parseInt(formData.age);
      const age2016 = currentAge - 10;
      
      // Generate personalized results
      const ageCategory = age2016 < 13 ? 'kid' : age2016 < 18 ? 'teen' : age2016 < 25 ? 'young' : age2016 < 35 ? 'adult' : 'wise';
      
      const whatYouWereDoing = {
        kid: `At ${age2016}, you were probably begging your parents for an iPhone 7 and mastering the bottle flip.`,
        teen: `At ${age2016}, you were peak high school/college energy - Drake on repeat, Snapchat streaks, and living for Friday nights.`,
        young: `At ${age2016}, you were figuring out adulting while still acting like a teenager. Pokémon GO got you outside for the first time in years.`,
        adult: `At ${age2016}, you pretended not to know what a dab was while secretly practicing it at home.`,
        wise: `At ${age2016}, you watched younger people go viral and thought "I could do that." Narrator: you could not.`
      };
      
      // Randomly select memories
      const selectedMusic = MEMORIES_2016.music.slice(0, 3);
      const selectedMoments = MEMORIES_2016.moments.sort(() => Math.random() - 0.5).slice(0, 4);
      const selectedApp = MEMORIES_2016.apps[Math.floor(Math.random() * MEMORIES_2016.apps.length)];
      const selectedSlang = MEMORIES_2016.slang.slice(0, 4);
      
      setResults({
        age2016,
        whatYouWereDoing: whatYouWereDoing[ageCategory],
        music: selectedMusic,
        moments: selectedMoments,
        app: selectedApp,
        slang: selectedSlang
      });
      
      setLoading(false);
    }, 1500);
  };

  const reset = () => {
    setResults(null);
    setFormData({ age: '', vibe: 'chill' });
  };

  return (
    <div className="App">
      <div className="paper-texture"></div>
      
      <header className="header">
        <h1>✨ Back to 2016 ✨</h1>
        <p className="tagline">Your personal time capsule generator</p>
      </header>

      {!results ? (
        <div className="input-section">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="form-group">
              <label htmlFor="age">How old are you now?</label>
              <input
                id="age"
                type="number"
                min="10"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="vibe">What was your 2016 vibe?</label>
              <select
                id="vibe"
                value={formData.vibe}
                onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                disabled={loading}
              >
                <option value="chill">Chill & Vibing</option>
                <option value="party">Party Animal</option>
                <option value="nerd">Internet Nerd</option>
                <option value="athletic">Athletic & Active</option>
                <option value="creative">Creative Soul</option>
              </select>
            </div>

            <button type="submit" className="generate-btn" disabled={loading}>
              {loading ? '⏳ Generating memories...' : '🚀 Take Me Back'}
            </button>
          </form>
          
          <div className="info-box">
            <p>✨ Remember 2016? Before the pandemic, before AI took over, when the internet was still fun?</p>
            <p>Let's recreate what you were probably up to.</p>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <button onClick={reset} className="back-btn">← Try Another Year</button>
          
          <div className="results-intro">
            <h2>Welcome back to 2016! 🎉</h2>
            <p className="age-reveal">You were {results.age2016} years old.</p>
            <p className="what-doing">{results.whatYouWereDoing}</p>
          </div>

          <section className="memory-section">
            <h2>🎵 Your Soundtrack</h2>
            <div className="polaroid-grid">
              {results.music.map((song, i) => (
                <PolaroidCard
                  key={i}
                  title={song.title}
                  content={`${song.artist}\n\n${song.vibe}`}
                  emoji="🎵"
                  delay={i * 150}
                />
              ))}
            </div>
          </section>

          <section className="memory-section">
            <h2>📱 Moments You Lived Through</h2>
            <div className="polaroid-grid">
              {results.moments.map((moment, i) => (
                <PolaroidCard
                  key={i}
                  title={moment.event}
                  content={moment.description}
                  emoji={moment.icon}
                  delay={i * 150}
                />
              ))}
            </div>
          </section>

          <section className="memory-section">
            <h2>📲 Your Favorite App</h2>
            <div className="app-card">
              <h3>{results.app.name}</h3>
              <p>{results.app.memory}</p>
            </div>
          </section>

          <section className="memory-section">
            <h2>💬 Slang Translator</h2>
            <div className="slang-grid">
              {results.slang.map((phrase, i) => (
                <div key={i} className="slang-card">
                  <div className="slang-old">{phrase.old}</div>
                  <div className="slang-arrow">→</div>
                  <div className="slang-new">{phrase.new}</div>
                  <div className="slang-context">"{phrase.context}"</div>
                </div>
              ))}
            </div>
          </section>

          <footer className="results-footer">
            <p>✨ Simpler times, right? ✨</p>
            <p className="small">Built with nostalgia and ~vibes~</p>
          </footer>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
