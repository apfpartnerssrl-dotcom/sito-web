# APF Partners S.R.L. — Sito Web + CMS

## 🚀 Deploy Stasera (5 minuti)

### Opzione A — Railway (CONSIGLIATO, gratis)
1. Vai su **railway.app** → New Project → Deploy from GitHub
2. Carica la cartella su GitHub (anche privato)
3. Railway detecta Node.js automaticamente
4. Aggiungi le variabili d'ambiente (vedi sotto)
5. Punta il dominio `apfpartners.it` nelle impostazioni

### Opzione B — Render (gratis)
1. Vai su **render.com** → New Web Service
2. Connetti GitHub, seleziona la repo
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Aggiungi le variabili d'ambiente

### Opzione C — VPS (Hetzner, DigitalOcean ecc.)
```bash
# Sul server:
git clone https://github.com/TUO/apf-partners.git
cd apf-partners
cp .env.example .env
nano .env  # Modifica password e JWT secret
npm install
npm start

# Con PM2 (per tenerlo sempre attivo):
npm install -g pm2
pm2 start server.js --name apf-partners
pm2 startup && pm2 save
```

---

## ⚙️ Variabili d'Ambiente

Crea un file `.env` (copia da `.env.example`):

```
ADMIN_PASSWORD=la_tua_password_sicura
JWT_SECRET=una_stringa_casuale_lunga_almeno_32_chars
PORT=3000
```

**Cambia SEMPRE la password di default prima del deploy!**

---

## 🌐 DNS — Puntare il dominio

Nel pannello del tuo registrar (Aruba, GoDaddy, Namecheap ecc.):

```
Type: A
Name: @
Value: IP_DEL_TUO_SERVER

Type: A  
Name: www
Value: IP_DEL_TUO_SERVER
```

Per Railway/Render: usa il CNAME che ti danno loro.

---

## 🔐 Admin Panel

URL: `https://apfpartners.it/admin`
Password: quella che hai impostato in `.env`

### Cosa puoi modificare dall'admin:
- ✅ Tutti i testi del sito (hero, about, contatti)
- ✅ Dati aziendali (P.IVA, CF, fondazione)
- ✅ Ticker bar
- ✅ Servizi (nome, descrizione, dettaglio, punti elenco)
- ✅ Settori (nome, descrizione, immagine)
- ✅ Blog (pubblica, elimina articoli)
- ✅ Carriere (aggiungi/elimina posizioni)
- ✅ Contatti (email, telefono, indirizzo, Google Maps)
- ✅ Partner & Brand (loghi strip orizzontale)
- ✅ Upload immagini

---

## 📝 Struttura File

```
apf-partners/
├── server.js          # Backend Express
├── content.json       # Database contenuti (modificato dall'admin)
├── package.json
├── .env               # Credenziali (NON caricare su GitHub!)
├── .env.example       # Template credenziali
└── public/
    ├── index.html     # Sito principale
    ├── uploads/       # Immagini caricate
    └── admin/
        └── index.html # Pannello CMS
```

---

## 🤖 Blog AI — Automazione (prossimo step)

Per pubblicare 1 post ogni 3 giorni in automatico, usa questo cron job:

```bash
# Installa node-cron o usa un servizio esterno come:
# - Make.com (Integromat)
# - n8n
# - GitHub Actions con schedule

# Chiamata API per pubblicare un post generato da Claude:
curl -X POST https://apfpartners.it/api/admin/blog \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"...","category":"AI Marketing","excerpt":"...","read_time":"5 min"}'
```

---

## 📧 Email sotto il dominio

Su **Zoho Mail** (gratis fino a 5 account) o **Google Workspace**:
- `info@apfpartners.it`
- `sales@apfpartners.it`  
- `careers@apfpartners.it`
- `admin@apfpartners.it`

---

*APF Partners S.R.L. · P.IVA 11073611219 · apfpartners.it*
