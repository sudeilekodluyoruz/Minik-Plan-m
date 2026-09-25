// Minik Planım - öğrenci takvimim
// Planlar ve notlar bu tarayıcının localStorage alanında tutulur.

const aylar = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const planKayitAdi = 'minik-planim-v3';
const notKayitAdi = 'minik-planim-notlar-v1';

const bugun = new Date();
bugun.setHours(0, 0, 0, 0);

const tarihMetni = (tarih) => {
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const gun = String(tarih.getDate()).padStart(2, '0');
  return `${tarih.getFullYear()}-${ay}-${gun}`;
};

// Uygulama ilk açıldığında örnek olarak görünen iki etkinlik.
const ornekPlanlar = [
  {
    id: 'ai-craft',
    baslik: 'AI Craft buluşması',
    tarih: '2026-09-14',
    saat: '19:00',
    tur: 'event',
    tamamlandi: false,
    hatirlatma: false
  },
  {
    id: 'osint',
    baslik: 'OSINT CTF Yarışması',
    tarih: '2026-09-15',
    saat: '14:00',
    tur: 'event',
    tamamlandi: false,
    hatirlatma: false
  }
];

let planlar = JSON.parse(localStorage.getItem(planKayitAdi) || 'null');
if (!planlar) {
  planlar = ornekPlanlar;
}

let notlar = JSON.parse(localStorage.getItem(notKayitAdi) || '{}');

// Eski sürümde her gün için tek metin vardı. Onu genel başlıklı nota çeviriyoruz.
Object.keys(notlar).forEach((gun) => {
  if (typeof notlar[gun] === 'string') {
    if (notlar[gun].trim()) {
      notlar[gun] = [{
        id: crypto.randomUUID(),
        baslik: 'Genel not',
        metin: notlar[gun]
      }];
    } else {
      notlar[gun] = [];
    }
  }
});

let gorunenAy = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
let secilenGun = tarihMetni(bugun);
let toastZamanlayici;

const sec = (secici) => document.querySelector(secici);
const takvim = sec('#takvim');
const eklemePenceresi = sec('#eklemePenceresi');

function planlariKaydet() {
  localStorage.setItem(planKayitAdi, JSON.stringify(planlar));
}

function okunabilirTarih(tarih) {
  const tarihNesnesi = new Date(`${tarih}T12:00`);
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(tarihNesnesi);
}

// Kullanıcının yazdığı metni HTML olarak çalıştırmadan ekrana koyar.
function guvenliMetin(metin) {
  const eleman = document.createElement('span');
  eleman.textContent = metin;
  return eleman.innerHTML;
}

function mesajGoster(mesaj) {
  const bildirim = sec('#bildirimBilgisi');
  bildirim.textContent = mesaj;
  bildirim.classList.add('gorunur');

  clearTimeout(toastZamanlayici);
  toastZamanlayici = setTimeout(() => {
    bildirim.classList.remove('gorunur');
  }, 3200);
}

// Takvimdeki 42 günü oluşturur. Her ayda altı haftalık yer olur.
function takvimiCiz() {
  sec('#ayYazisi').textContent = `${aylar[gorunenAy.getMonth()]} ${gorunenAy.getFullYear()}`;
  takvim.innerHTML = '';

  const ayinIlkGunu = new Date(gorunenAy.getFullYear(), gorunenAy.getMonth(), 1);
  const takvimBaslangici = new Date(ayinIlkGunu);
  const pazartesiyeKadarGeri = (ayinIlkGunu.getDay() + 6) % 7;
  takvimBaslangici.setDate(1 - pazartesiyeKadarGeri);

  for (let sira = 0; sira < 42; sira += 1) {
    const gun = new Date(takvimBaslangici);
    gun.setDate(takvimBaslangici.getDate() + sira);

    const gunTarihi = tarihMetni(gun);
    const gunPlanlari = planlar.filter((plan) => plan.tarih === gunTarihi);
    const buAyda = gun.getMonth() === gorunenAy.getMonth();
    const gunButonu = document.createElement('button');

    gunButonu.type = 'button';
    gunButonu.className = `gun ${buAyda ? '' : 'diger-ay'} ${gunTarihi === secilenGun ? 'secili-gun' : ''} ${gunTarihi === tarihMetni(bugun) ? 'bugun' : ''}`;
    gunButonu.setAttribute('aria-label', `${okunabilirTarih(gunTarihi)}, ${gunPlanlari.length} plan`);

    const numara = document.createElement('span');
    numara.className = 'gun-numarasi';
    numara.textContent = gun.getDate();
    gunButonu.append(numara);

    gunPlanlari.slice(0, 2).forEach((plan) => {
      const etiket = document.createElement('span');
      etiket.className = `etiket ${plan.tur}`;
      etiket.textContent = `${plan.saat ? `${plan.saat} · ` : ''}${plan.baslik}${plan.hatirlatma ? ' ◷' : ''}`;
      gunButonu.append(etiket);
    });

    if (gunPlanlari.length > 2) {
      const fazlasi = document.createElement('span');
      fazlasi.className = 'etiket fazlasi';
      fazlasi.textContent = `+${gunPlanlari.length - 2} daha`;
      gunButonu.append(fazlasi);
    }

    gunButonu.onclick = () => {
      secilenGun = gunTarihi;
      ekraniGuncelle();
    };

    takvim.append(gunButonu);
  }
}

function gunlukPlaniCiz() {
  sec('#secilenTarih').textContent = `🌼 ${okunabilirTarih(secilenGun)}`;

  const seciliPlanlar = planlar
    .filter((plan) => plan.tarih === secilenGun)
    .sort((birinci, ikinci) => (birinci.saat || '').localeCompare(ikinci.saat || ''));
  const liste = sec('#planListesi');

  liste.innerHTML = '';
  sec('#bosMesaj').hidden = seciliPlanlar.length > 0;
  sec('#planBasligi').textContent = seciliPlanlar.length ? 'Günün planı' : 'Gününü planla';

  const odakPlani = seciliPlanlar.find((plan) => !plan.tamamlandi) || seciliPlanlar[0];
  if (odakPlani) {
    sec('#odakKutusu').innerHTML = `<strong>${odakPlani.tur === 'event' ? '📌' : '🎯'} ${guvenliMetin(odakPlani.baslik)}</strong><span>${odakPlani.saat ? `${odakPlani.saat} için planlandı` : 'Saat eklenmedi'}${odakPlani.hatirlatma ? ' · ◷ hatırlatıcı açık' : ''}${odakPlani.tamamlandi ? ' · tamamlandı' : ''}</span>`;
  } else {
    sec('#odakKutusu').innerHTML = '<strong>🌱 Küçük bir adım seç</strong><span>Bir plan ekleyerek başlayabilirsin.</span>';
  }

  seciliPlanlar.forEach((plan) => {
    const satir = document.createElement('li');
    satir.innerHTML = `<input type="checkbox" aria-label="Tamamlandı" ${plan.tamamlandi ? 'checked' : ''}><span class="plan-yazisi ${plan.tamamlandi ? 'tamamlandi' : ''}">${plan.saat ? `<time>${plan.saat}</time> · ` : ''}${guvenliMetin(plan.baslik)}${plan.hatirlatma ? ' <span class="hatirlatma-ikon" title="Hatırlatıcı açık">◷</span>' : ''}</span><button class="sil" aria-label="Planı sil">×</button>`;

    satir.querySelector('input').onchange = (olay) => {
      plan.tamamlandi = olay.target.checked;
      planlariKaydet();
      ekraniGuncelle();
    };

    satir.querySelector('.sil').onclick = () => {
      planlar = planlar.filter((kayit) => kayit.id !== plan.id);
      planlariKaydet();
      ekraniGuncelle();
    };

    liste.append(satir);
  });

  notlariCiz();
}

function yaklasanlariCiz() {
  const bugununTarihi = tarihMetni(bugun);
  const yaklasanPlanlar = planlar
    .filter((plan) => plan.tarih >= bugununTarihi && !plan.tamamlandi)
    .sort((birinci, ikinci) => `${birinci.tarih}${birinci.saat}`.localeCompare(`${ikinci.tarih}${ikinci.saat}`))
    .slice(0, 4);
  const liste = sec('#yaklasanListe');

  sec('#yaklasanSayisi').textContent = `${yaklasanPlanlar.length} plan`;
  liste.innerHTML = '';

  if (yaklasanPlanlar.length === 0) {
    liste.innerHTML = '<p class="yaklasan-bos">Şimdilik yaklaşan plan yok. Boş vakit de planın bir parçası 🌿</p>';
    return;
  }

  yaklasanPlanlar.forEach((plan) => {
    const tarih = new Date(`${plan.tarih}T12:00`);
    const kart = document.createElement('button');
    kart.type = 'button';
    kart.className = 'yaklasan-satir';
    kart.innerHTML = `<span class="mini-tarih"><b>${tarih.getDate()}</b><small>${aylar[tarih.getMonth()].slice(0, 3)}</small></span><span class="yaklasan-yazi"><b>${guvenliMetin(plan.baslik)}</b><small>${plan.tarih === bugununTarihi ? 'Bugün' : okunabilirTarih(plan.tarih)}${plan.saat ? ` · ${plan.saat}` : ''}</small></span><span class="mini-tur ${plan.tur}">${plan.hatirlatma ? '◷' : '›'}</span>`;

    kart.onclick = () => {
      secilenGun = plan.tarih;
      gorunenAy = new Date(`${plan.tarih}T12:00`);
      gorunenAy.setDate(1);
      ekraniGuncelle();
    };

    liste.append(kart);
  });
}

function ekraniGuncelle() {
  takvimiCiz();
  gunlukPlaniCiz();
  yaklasanlariCiz();

  const bugununPlanlari = planlar.filter((plan) => plan.tarih === tarihMetni(bugun) && !plan.tamamlandi);
  sec('#miniOzet').textContent = bugununPlanlari.length
    ? `Bugün ${bugununPlanlari.length} planın var`
    : 'Bugün kendine iyi bak ✿';
}

function ayiDegistir(miktar) {
  gorunenAy.setMonth(gorunenAy.getMonth() + miktar);
  ekraniGuncelle();
}

sec('#oncekiAy').onclick = () => ayiDegistir(-1);
sec('#sonrakiAy').onclick = () => ayiDegistir(1);

sec('#bugunButonu').onclick = () => {
  gorunenAy = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
  secilenGun = tarihMetni(bugun);
  ekraniGuncelle();
};

sec('#ekleButonu').onclick = () => {
  sec('#tarih').value = secilenGun;
  sec('#hatirlatma').checked = false;
  eklemePenceresi.showModal();
};

sec('#iptalButonu').onclick = () => eklemePenceresi.close();

sec('#planFormu').onsubmit = async (olay) => {
  olay.preventDefault();

  const hatirlatmaAcik = sec('#hatirlatma').checked;
  if (hatirlatmaAcik && 'Notification' in window && Notification.permission === 'default') {
    const izin = await Notification.requestPermission();
    if (izin !== 'granted') {
      mesajGoster('Bildirim izni verilmedi; planın yine de kaydedildi.');
    }
  }

  const yeniPlan = {
    id: crypto.randomUUID(),
    baslik: sec('#baslik').value.trim(),
    tarih: sec('#tarih').value,
    saat: sec('#saat').value,
    tur: sec('#tur').value,
    tamamlandi: false,
    hatirlatma: hatirlatmaAcik
  };

  planlar.push(yeniPlan);
  secilenGun = yeniPlan.tarih;
  gorunenAy = new Date(`${yeniPlan.tarih}T12:00`);
  gorunenAy.setDate(1);

  planlariKaydet();
  olay.target.reset();
  eklemePenceresi.close();
  ekraniGuncelle();

  if (hatirlatmaAcik) {
    const bildirimIzniVar = 'Notification' in window && Notification.permission === 'granted';
    mesajGoster(bildirimIzniVar ? 'Hatırlatıcı eklendi. Bildirim için sayfa açık kalmalı.' : 'Plan kaydedildi.');
  }
};

function notlariCiz() {
  const liste = sec('#notListesi');
  const gununNotlari = Array.isArray(notlar[secilenGun]) ? notlar[secilenGun] : [];

  liste.innerHTML = '';
  sec('#notDurumu').textContent = `${gununNotlari.length} not`;

  gununNotlari.forEach((not) => {
    const kart = document.createElement('article');
    kart.className = 'not-satiri';
    kart.innerHTML = `<div class="not-satiri-ust"><b>${guvenliMetin(not.baslik)}</b><span><button type="button" class="not-duzenle">Düzenle</button><button type="button" class="not-sil">×</button></span></div><p>${guvenliMetin(not.metin).replace(/\n/g, '<br>')}</p>`;

    kart.querySelector('.not-duzenle').onclick = () => {
      const yeniBaslik = prompt('Notun konusu:', not.baslik);
      if (yeniBaslik === null) return;

      const yeniMetin = prompt('Not içeriği:', not.metin);
      if (yeniMetin === null) return;

      if (!yeniBaslik.trim() || !yeniMetin.trim()) {
        mesajGoster('Not başlığı ve içeriği boş kalmasın.');
        return;
      }

      not.baslik = yeniBaslik.trim();
      not.metin = yeniMetin.trim();
      notlariKaydet();
    };

    kart.querySelector('.not-sil').onclick = () => {
      if (!confirm('Bu notu silmek istiyor musun?')) return;

      notlar[secilenGun] = gununNotlari.filter((kayit) => kayit.id !== not.id);
      notlariKaydet();
    };

    liste.append(kart);
  });
}

function notlariKaydet() {
  localStorage.setItem(notKayitAdi, JSON.stringify(notlar));
  notlariCiz();
}

sec('#notFormu').onsubmit = (olay) => {
  olay.preventDefault();

  if (!Array.isArray(notlar[secilenGun])) {
    notlar[secilenGun] = [];
  }

  const yeniNot = {
    id: crypto.randomUUID(),
    baslik: sec('#notBasligi').value.trim(),
    metin: sec('#notMetni').value.trim()
  };

  notlar[secilenGun].unshift(yeniNot);
  olay.target.reset();
  notlariKaydet();
};

// Bu yardımcı hazır AI servisi değildir; basit, çevrimdışı çalışma fikirleri verir.
sec('#aiButonu').onclick = () => {
  const konu = sec('#aiGirdi').value.trim();
  const cevapAlani = sec('#aiCevap');

  if (!konu) {
    mesajGoster('Önce çalışmak istediğin konuyu yaz 🌼');
    sec('#aiGirdi').focus();
    return;
  }

  const planSayisi = planlar.filter((plan) => plan.tarih === secilenGun).length;
  const fikirler = [
    `“${konu}” için 25 dakikalık kısa bir başlangıç yap. Sonra 5 dakika mola verip öğrendiklerini 3 maddeyle özetle.`,
    `Bugün ${konu} konusunu küçük parçalara ayır: önce 10 dakika konu tekrarı, sonra 2 örnek soru çöz ve kısa bir mola ver.`,
    `Kendine yüklenmeden başla: ${konu} için tek bir küçük hedef seç ve bitince planından tamamlandı olarak işaretle.`
  ];

  cevapAlani.textContent = `✦ ${fikirler[planSayisi % fikirler.length]}`;
  cevapAlani.hidden = false;
};

function hatirlatmalariKontrolEt() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const suAn = new Date();
  const bugununHatirlatmalari = planlar.filter((plan) => {
    return plan.hatirlatma
      && !plan.tamamlandi
      && plan.saat
      && plan.tarih === tarihMetni(suAn);
  });

  bugununHatirlatmalari.forEach((plan) => {
    const planSaati = new Date(`${plan.tarih}T${plan.saat}`);
    const hatirlatmaAnahtari = `hatirlatildi-${plan.id}-${plan.tarih}`;
    const zamaniGeldi = suAn >= planSaati && suAn - planSaati < 60000;

    if (zamaniGeldi && !sessionStorage.getItem(hatirlatmaAnahtari)) {
      new Notification('Minik Planım zamanı 🌼', {
        body: `${plan.saat} · ${plan.baslik}`
      });
      sessionStorage.setItem(hatirlatmaAnahtari, '1');
    }
  });
}

function uygulamayiBaslat() {
  ekraniGuncelle();
  hatirlatmalariKontrolEt();
  setInterval(hatirlatmalariKontrolEt, 20000);
}

uygulamayiBaslat();
