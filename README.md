# Minik Planım 🌷

Minik Planım, öğrencilerin derslerini, günlük notlarını ve etkinliklerini tek bir yerde düzenleyebilmesi için hazırlanmış basit bir takvim uygulamasıdır. HTML, CSS ve JavaScript kullanılarak geliştirilmiştir.

## Özellikler

- Ay görünümünde takvim ve gün seçimi
- Ders, etkinlik ve kişisel plan ekleme
- Planları tamamlandı olarak işaretleme veya silme
- Seçilen güne birden fazla başlıklı not ekleme, düzenleme ve silme
- Yaklaşan planları görüntüleme
- Hatırlatıcı seçeneği ve tarayıcı bildirimi
- Çalışma düzeni için küçük öneriler veren yerel plan yardımcısı
- Telefon ve bilgisayar ekranlarına uyumlu görünüm
- Plan ve notları tarayıcıda saklama

## Nasıl çalıştırılır?

1. Bu projeyi GitHub'dan indirin veya bilgisayarınıza klonlayın.
2. `index.html` dosyasını bir web tarayıcısında açın.
3. Takvimde bir gün seçip **Yeni plan** düğmesiyle plan ekleyin.

Uygulama ek kurulum veya paket gerektirmez.

## Hatırlatıcılar hakkında

Hatırlatıcılar tarayıcı bildirimi kullanır. Bildirim izni istenir ve bildirimin zamanında çıkması için uygulama sayfasının açık kalması gerekir. Tarayıcı bildirimleri desteklemiyorsa plan yine takvime kaydedilir.

## Plan yardımcısı hakkında

Plan yardımcısı, yazılan konuya göre önceden hazırlanmış çalışma fikirleri sunan basit bir yerel demodur. Bir yapay zekâ servisine veya sunucuya bağlanmaz; API anahtarı gerektirmez.

## Veriler nerede saklanır?

Planlar ve notlar tarayıcının `localStorage` alanında saklanır. Bu nedenle bilgiler yalnızca o tarayıcıda ve cihazda görünür. Tarayıcı verileri silinirse kayıtlar da silinebilir. Uygulama verileri bir sunucuya göndermez.

## Kullanılan teknolojiler

- HTML
- CSS
- JavaScript
- Tarayıcı `localStorage` ve bildirim API'si

## Proje dosyaları

- `index.html` — sayfanın içeriği
- `style.css` — görünüm ve mobil uyum
- `app.js` — takvim, plan, not ve hatırlatıcı işlevleri
- `README.md` — proje açıklaması
