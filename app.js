/* app.js — website-first, GitHub Pages friendly, localStorage-backed */

const App = (() => {
  const KEY = "bstats_v1";

  function uid(prefix="id"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if (!raw) return { players: [], games: [], events: [], currentGameId: null, gameState: {} };
      const data = JSON.parse(raw);
      return {
        players: Array.isArray(data.players) ? data.players : [],
        games: Array.isArray(data.games) ? data.games : [],
        events: Array.isArray(data.events) ? data.events : [],
        currentGameId: data.currentGameId || null,
        gameState: data.gameState || {}
      };
    }catch(e){
      return { players: [], games: [], events: [], currentGameId: null, gameState: {} };
    }
  }

  function save(data){
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // ===== Players =====
  function getPlayers(){ return load().players; }

  function addPlayer({ name }){
    const data = load();
    const p = { id: uid("p"), name: String(name).trim(), createdAt: Date.now() };
    data.players.push(p);
    save(data);
    return p;
  }

  function getPlayer(playerId){
    return load().players.find(p => p.id === playerId) || null;
  }

  // ===== Games =====
  function getGames(){ return load().games; }

  function createGame({ date, opponent, location }){
    const data = load();
    const g = {
      id: uid("g"),
      date: date || "",
      opponent: opponent || "",
      location: location || "",
      lineup: [],
      isFinal: false,
      createdAt: Date.now()
    };
    data.games.push(g);
    save(data);
    return g;
  }

  function getGame(gameId){
    return load().games.find(g => g.id === gameId) || null;
  }

  function setCurrentGameId(gameId){
    const data = load();
    data.currentGameId = gameId;
    save(data);
  }

  function getCurrentGameId(){
    return load().currentGameId;
  }

  function finalizeGame(gameId){
    const data = load();
    const g = data.games.find(x => x.id === gameId);
    if (g) g.isFinal = true;
    save(data);
  }

  // ===== Lineup =====
  function getLineup(gameId){
    const g = getGame(gameId);
    return Array.isArray(g?.lineup) ? g.lineup : [];
  }

  function setLineup(gameId, lineup){
    const data = load();
    const g = data.games.find(x => x.id === gameId);
    if (!g) return;
    g.lineup = Array.isArray(lineup) ? lineup : [];
    save(data);
  }

  function addToLineup(gameId, playerId){
    const lineup = getLineup(gameId);
    lineup.push(playerId);
    setLineup(gameId, lineup);
  }

  function removeFromLineup(gameId, idx){
    const lineup = getLineup(gameId);
    if (idx < 0 || idx >= lineup.length) return;
    lineup.splice(idx, 1);
    setLineup(gameId, lineup);
  }

  function moveLineup(gameId, fromIdx, toIdx){
    const lineup = getLineup(gameId);
    if (fromIdx < 0 || fromIdx >= lineup.length) return;
    if (toIdx < 0 || toIdx >= lineup.length) return;
    const [item] = lineup.splice(fromIdx, 1);
    lineup.splice(toIdx, 0, item);
    setLineup(gameId, lineup);
  }

  // ===== Game state (batter index) =====
  function initGameState(gameId){
    const data = load();
    if (!data.gameState) data.gameState = {};
    if (!data.gameState[gameId]) {
      data.gameState[gameId] = { batterIndex: 0 };
      save(data);
    }
  }

  function getGameState(gameId){
    const data = load();
    return data.gameState?.[gameId] || { batterIndex: 0 };
  }

  function setGameState(gameId, state){
    const data = load();
    if (!data.gameState) data.gameState = {};
    data.gameState[gameId] = { ...(data.gameState[gameId] || {}), ...state };
    save(data);
  }

  function advanceBatter(gameId){
    const lineup = getLineup(gameId);
    if (!lineup.length) return;
    const st = getGameState(gameId);
    const next = ((st.batterIndex || 0) + 1) % lineup.length;
    setGameState(gameId, { batterIndex: next });
  }

  // ===== Events (Plate Appearances) =====
  function getEvents(){ return load().events; }

  function addEvent({ gameId, playerId, result, outType, sac, rbi, runs }){
    const data = load();
    const ev = {
      id: uid("e"),
      gameId,
      playerId,
      ts: Date.now(),
      result,                 // "1B"|"2B"|"3B"|"HR"|"BB"|"K"|"OUT"
      outType: outType || null, // future: "GO","FO","DP", etc
      sac: !!sac,
      rbi: Number(rbi) || 0,
      runs: Number(runs) || 0
    };
    data.events.push(ev);
    save(data);
    return ev;
  }

  function getEvent(eventId){
    return load().events.find(e => e.id === eventId) || null;
  }

  function updateEvent(eventId, patch){
    const data = load();
    const ev = data.events.find(e => e.id === eventId);
    if (!ev) return null;
    Object.assign(ev, patch || {});
    save(data);
    return ev;
  }

  function deleteEvent(eventId){
    const data = load();
    const idx = data.events.findIndex(e => e.id === eventId);
    if (idx >= 0) data.events.splice(idx, 1);
    save(data);
  }

  // ===== Export =====
  function exportAll(){
    return load();
  }

  return {
    // helpers
    escapeHtml,

    // players
    getPlayers, addPlayer, getPlayer,

    // games
    getGames, createGame, getGame, finalizeGame,
    setCurrentGameId, getCurrentGameId,

    // lineup
    getLineup, setLineup, addToLineup, removeFromLineup, moveLineup,

    // state
    initGameState, getGameState, setGameState, advanceBatter,

    // events
    getEvents, addEvent, getEvent, updateEvent, deleteEvent,

    // export
    exportAll
  };
})();
