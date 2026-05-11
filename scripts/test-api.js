async function test() {
  const payload = {
    co2: 500,
    nh3: 1.5,
    voc: 0.5,
    temp: 28,
    hum: 55,
    isUnhealthy: false,
    dominant: "CO2"
  };

  try {
    console.log("🚀 Mengirimkan data sensor uji coba ke http://localhost:3000/api/sensor...");
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
