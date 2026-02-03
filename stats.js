/* stats.js — compute totals from event list */

const Stats = (() => {
  function groupByPlayer(events){
    const map = {};
    (events || []).forEach(e=>{
      if (!map[e.playerId]) map[e.playerId] = [];
      map[e.playerId].push(e);
    });
    return map;
  }

  function fmt3(n){
    // 3-decimal like .333 (but we’ll show 0.333; can change later)
    return Number.isFinite(n) ? n.toFixed(3) : "0.000";
  }

  function compute(events){
    let PA=0, AB=0, H=0, s1B=0, s2B=0, s3B=0, HR=0, TB=0, BB=0, K=0, RBI=0, RUNS=0, SAC=0;

    (events || []).forEach(e=>{
      PA += 1;
      RBI += Number(e.rbi)||0;
      RUNS += Number(e.runs)||0;
      if (e.sac) SAC += 1;

      const r = e.result;
      if (r === "BB") BB += 1;
      if (r === "K") K += 1;

      const isHit = (r === "1B" || r === "2B" || r === "3B" || r === "HR");
      if (isHit){
        H += 1;
        if (r === "1B") s1B += 1;
        if (r === "2B") s2B += 1;
        if (r === "3B") s3B += 1;
        if (r === "HR") HR += 1;
      }

      // AB rules for our v1:
      // - BB is not an AB
      // - SAC is not an AB
      // - everything else counts as AB (hits, K, OUT)
      const isAB = (r !== "BB") && (!e.sac);
      if (isAB) AB += 1;
    });

    TB = s1B + 2*s2B + 3*s3B + 4*HR;

    const AVG = AB ? (H / AB) : 0;
    const OBP = PA ? ((H + BB) / PA) : 0;         // since you don't track HBP
    const SLG = AB ? (TB / AB) : 0;
    const OPS = OBP + SLG;

    return {
      PA, AB, H, s1B, s2B, s3B, HR, TB, BB, K, RBI, RUNS, SAC,
      AVG: fmt3(AVG),
      OBP: fmt3(OBP),
      SLG: fmt3(SLG),
      OPS: fmt3(OPS),
    };
  }

  return { groupByPlayer, compute };
})();
