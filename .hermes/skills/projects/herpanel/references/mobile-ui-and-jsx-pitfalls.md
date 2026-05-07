# Mobile UI & JSX Pitfalls — HerPanel

## Mobile Actions Modal Pattern

Untuk menambahkan menu aksi mobile di komponen React HerPanel:

### State & Functions
```javascript
const [showMobileActions, setShowMobileActions] = useState(false);
const [mobileActionDomain, setMobileActionDomain] = useState(null);

const openMobileActions = (domain) => {
    setMobileActionDomain(domain);
    setShowMobileActions(true);
};

const closeMobileActions = () => {
    setShowMobileActions(false);
    setMobileActionDomain(null);
};
```

### Modal JSX (letakkan sebelum `</AuthenticatedLayout>`)
```jsx
{showMobileActions && mobileActionDomain && (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:hidden" onClick={closeMobileActions}>
        <div className="bg-hpBg2 border border-hpBorder rounded-t-xl w-full max-w-lg p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-white font-medium">{mobileActionDomain.domain_name}</span>
                <button onClick={closeMobileActions} className="text-hpText3 hover:text-white transition-colors text-lg">×</button>
            </div>
            <button onClick={() => { openDnsModal(mobileActionDomain); closeMobileActions(); }} className="w-full px-4 py-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-[12px] text-blue-400 hover:bg-blue-500/10 transition-all text-left">
                🌐 DNS Records ({mobileActionDomain.dns_records?.length || 0})
            </button>
            <Link href={route('domains.subdomains.index', mobileActionDomain.id)} onClick={closeMobileActions} className="block w-full px-4 py-3 rounded-md bg-purple-500/5 border border-purple-500/20 text-[12px] text-purple-400 hover:bg-purple-500/10 transition-all text-left">
                📁 Subdomains ({mobileActionDomain.subdomains_count || 0})
            </Link>
            <button onClick={() => { handleDelete(mobileActionDomain); closeMobileActions(); }} className="w-full px-4 py-3 rounded-md bg-red-500/5 border border-red-500/20 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors text-left">
                🗑️ Delete Domain
            </button>
        </div>
    </div>
)}
```

### Trigger di Desktop Table
```jsx
onClick={() => isMobile ? openMobileActions(domain) : null}
```

---

## Large JSX File Corruption

### Risiko
Saat edit file JSX besar (seperti `Domains/Index.jsx`) dengan `execute_code`:
- File bisa korup (hilang closing tag seperti `</AuthenticatedLayout>`)
- Duplicate function declarations
- Build error: "Identifier already declared"

### Fix
```bash
cd /var/www/herpanel
git restore resources/js/Pages/Domains/Index.jsx
# Lalu apply perubahan lagi dengan hati-hati
```

### Pencegahan
- Untuk fitur baru, prefer buat file terpisah (seperti `Subdomains.jsx`) daripada modifikasi file monolitik
- Jika harus edit file besar, gunakan `git restore` sebagai fallback
- Test build (`npm run build`) setelah setiap perubahan signifikan

---

## User Communication Preference
- User mengharapkan diberi tahu saat task selesai: **"Kabarin kalau sudah selesai"** atau **"Sudah kah?"**
- Konsolidasi update dalam satu pesan, jangan spam multiple messages
