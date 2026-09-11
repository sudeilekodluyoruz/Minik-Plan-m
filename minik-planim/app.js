// Minik Planım - uygulama davranışları
const aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const kayitAdi = 'minik-planim-v2';
const bugun = new Date();
bugun.setHours(0, 0, 0, 0);

// Tarihi 2026-09-15 gibi kolay kullanılabilir bir metne çevirir.
function tarihMetni(tarih) {
  return `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}-${String(tarih.getDate()).padStart(2, '0')}`;
}

const ornekPlanlar = [
  { id:'ai-craft', baslik:'AI Craft buluşması', tarih:'2026-09-14', saat:'19:00', tur:'event', tamamlandi:false },
  { id:'osint', baslik:'OSINT CTF Yarışması', tarih:'2026-09-15', saat:'14:00', tur:'event', tamamlandi:false }
];
let planlar = JSON.parse(localStorage.getItem(kayitAdi)) || ornekPlanlar;
let gorunenAy = new Date(2026, 8, 1);
let secilenGun = '2026-09-15';
const takvim = document.querySelector('#takvim');
const pencere = document.querySelector('#eklemePenceresi');

function planlariKaydet() { localStorage.setItem(kayitAdi, JSON.stringify(planlar)); }
function okunabilirTarih(tarih) { return new Intl.DateTimeFormat('tr-TR', { weekday:'long', day:'numeric', month:'long' }).format(new Date(`${tarih}T12:00`)); }

// Takvimdeki 42 kutuyu oluşturur. Böylece her ay düzenli görünür.
function takvimiCiz() {
  document.querySelector('#ayYazisi').textContent = `${aylar[gorunenAy.getMonth()]} ${gorunenAy.getFullYear()}`;
  takvim.innerHTML = '';
  const ayinIlkGunu = new Date(gorunenAy.getFullYear(), gorunenAy.getMonth(), 1);
  const baslangic = new Date(ayinIlkGunu);
  baslangic.setDate(1 - ((ayinIlkGunu.getDay() + 6) % 7));

  for (let kutuSayisi = 0; kutuSayisi < 42; kutuSayisi++) {
    const gun = new Date(baslangic);
    gun.setDate(baslangic.getDate() + kutuSayisi);
    const gunTarihi = tarihMetni(gun);
    const oGununkuler = planlar.filter(plan => plan.tarih === gunTarihi);
    const buAydaMi = gun.getMonth() === gorunenAy.getMonth();
    const gunButonu = document.createElement('button');
    gunButonu.className = `gun ${buAydaMi ? '' : 'diger-ay'} ${gunTarihi === secilenGun ? 'secili-gun' : ''} ${gunTarihi === tarihMetni(bugun) ? 'bugun' : ''}`;
    gunButonu.innerHTML = `<span class="gun-numarasi">${gun.getDate()}</span>`;
    oGununkuler.slice(0, 2).forEach(plan => {
      gunButonu.innerHTML += `<span class="etiket ${plan.tur}">${plan.saat ? `${plan.saat} · ` : ''}${plan.baslik}</span>`;
    });
    if (oGununkuler.length > 2) gunButonu.innerHTML += `<span class="etiket fazlasi">+${oGununkuler.length - 2} daha</span>`;
    gunButonu.onclick = () => { secilenGun = gunTarihi; ekraniGuncelle(); };
    takvim.append(gunButonu);
  }
}

function gunlukPlaniCiz() {
  document.querySelector('#secilenTarih').textContent = `🌼 ${okunabilirTarih(secilenGun)}`;
  const seciliPlanlar = planlar.filter(plan => plan.tarih === secilenGun);
  const liste = document.querySelector('#planListesi');
  const bosMesaj = document.querySelector('#bosMesaj');
  liste.innerHTML = '';
  bosMesaj.hidden = seciliPlanlar.length > 0;
  document.querySelector('#planBasligi').textContent = seciliPlanlar.length ? 'Günün planı' : 'Bugün için boş';
  const anaPlan = seciliPlanlar.find(plan => !plan.tamamlandi) || seciliPlanlar[0];
  document.querySelector('#odakKutusu').innerHTML = anaPlan
    ? `<strong>${anaPlan.tur === 'event' ? '📌' : '🎯'} ${anaPlan.baslik}</strong><span>${anaPlan.saat ? `${anaPlan.saat} için planlandı` : 'Saat eklenmedi'}${anaPlan.tamamlandi ? ' · tamamlandı' : ''}</span>`
    : '<strong>🌱 Küçük bir adım seç</strong><span>Planına görev veya etkinlik ekleyerek başlayabilirsin.</span>';

  seciliPlanlar.forEach(plan => {
    const satir = document.createElement('li');
    satir.innerHTML = `<input type="checkbox" aria-label="Tamamlandı" ${plan.tamamlandi ? 'checked' : ''}><span class="plan-yazisi ${plan.tamamlandi ? 'tamamlandi' : ''}">${plan.saat ? `${plan.saat} · ` : ''}${plan.baslik}</span><button class="sil" aria-label="Sil">×</button>`;
    satir.querySelector('input').onchange = e => { plan.tamamlandi = e.target.checked; planlariKaydet(); ekraniGuncelle(); };
    satir.querySelector('.sil').onclick = () => { planlar = planlar.filter(kayit => kayit.id !== plan.id); planlariKaydet(); ekraniGuncelle(); };
    liste.append(satir);
  });
}

function ekraniGuncelle() { takvimiCiz(); gunlukPlaniCiz(); }
document.querySelector('#oncekiAy').onclick = () => { gorunenAy.setMonth(gorunenAy.getMonth() - 1); ekraniGuncelle(); };
document.querySelector('#sonrakiAy').onclick = () => { gorunenAy.setMonth(gorunenAy.getMonth() + 1); ekraniGuncelle(); };
document.querySelector('#bugunButonu').onclick = () => { gorunenAy = new Date(bugun.getFullYear(), bugun.getMonth(), 1); secilenGun = tarihMetni(bugun); ekraniGuncelle(); };
document.querySelector('#ekleButonu').onclick = () => { document.querySelector('#tarih').value = secilenGun; pencere.showModal(); };
document.querySelector('#iptalButonu').onclick = () => pencere.close();

document.querySelector('#planFormu').onsubmit = e => {
  e.preventDefault();
  const yeniPlan = { id:crypto.randomUUID(), baslik:document.querySelector('#baslik').value.trim(), tarih:document.querySelector('#tarih').value, saat:document.querySelector('#saat').value, tur:document.querySelector('#tur').value, tamamlandi:false };
  planlar.push(yeniPlan); secilenGun = yeniPlan.tarih; gorunenAy = new Date(`${secilenGun}T12:00`); gorunenAy.setDate(1);
  planlariKaydet(); e.target.reset(); pencere.close(); ekraniGuncelle();
};
ekraniGuncelle();
