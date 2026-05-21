async function test() {
  const isDangerArg = process.argv.includes('--danger');
  const payload = {
    co2: isDangerArg ? 1200 : 500,
    nh3: isDangerArg ? 8.5 : 1.5,
    voc: isDangerArg ? 15.0 : 0.5,
    temp: isDangerArg ? 52 : 28,
    hum: 55,
    isUnhealthy: isDangerArg,
    dominant: "CO2"
  };

  try {
    console.log(`🚀 Mengirimkan data sensor (${isDangerArg ? 'BAHAYA/DANGER' : 'AMAN/SAFE'}) ke http://localhost:3000/api/sensor...`);
    const res = await fetch('http://localhost:3000/api/sensor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("📥 Respon dari Server:", data);
  } catch (err) {
    console.error("❌ Gagal menghubungi server:", err.message);
  }
}

test();
