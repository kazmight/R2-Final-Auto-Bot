## 🤖 R2 Money Final Auto Transaksi Bot
R2 Auto-Bot DeFi adalah sebuah bot otomatis berbasis Node.js yang dirancang untuk berinteraksi dengan berbagai protokol Decentralized Finance (DeFi) di jaringan Sepolia Testnet. Bot ini memungkinkan Anda untuk melakukan swap token, serta menambah dan menghapus likuiditas pada berbagai pasangan token.

## ✨ Fitur
Swap Token: Tukar token R2 dengan USDC atau sebaliknya. 
Manajemen Likuiditas:
Add Liquidity: Tambahkan likuiditas ke berbagai pasangan pool.
Remove Liquidity: Hapus likuiditas dari berbagai pasangan pool.
Interaksi Interaktif: Menggunakan prompt konsol interaktif untuk pilihan transaksi.
Konfigurasi Fleksibel: Atur persentase token yang digunakan, jumlah transaksi berulang, dan penundaan antar transaksi.
Penanganan Toleransi Slippage: Mengimplementasikan logika slippage untuk swap dan penambahan likuiditas guna melindungi dari pergeseran harga yang tidak diinginkan.

## 🚀 Instalasi & Persiapan
Ikuti langkah-langkah di bawah ini untuk menyiapkan dan menjalankan R2 Auto-Bot DeFi.


## 1. Kloning Repositori (Opsional, jika ini repositori Git)
Jika ini adalah proyek Git, kloning repositori ke komputer lokal Anda:
```Bash
git clone https://github.com/kazmight/R2-Final-Auto-Bot.git
```
```Bash
cd R2-Final-Auto-Bot
```

## 2. Instal Dependensi
Setelah berada di direktori proyek, instal semua paket Node.js yang diperlukan:
```Bash
npm install
```

## 3. Konfigurasi Lingkungan (.env)
Buat file baru bernama .env di direktori utama proyek Anda dan isi dengan informasi berikut:

Cuplikan kode
PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"
RPC_URL="YOUR_SEPOLIA_RPC_URL_HERE"
PRIVATE_KEY: Kunci pribadi dompet Ethereum Anda (dimulai dengan 0x). Jaga kerahasiaan kunci ini. Jangan pernah membagikannya!
RPC_URL: URL endpoint RPC untuk jaringan Sepolia Testnet (misalnya, dari Alchemy, Infura, atau penyedia RPC lainnya).

Contoh:
PRIVATE_KEY="0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
RPC_URL="https://sepolia.infura.io/"

## 4.⚙️ Penggunaan
Untuk menjalankan bot, buka Terminal/Command Prompt di direktori proyek Anda dan ketik:
```Bash
node index.js
```
Bot akan memandu Anda melalui prompt interaktif untuk memilih jenis transaksi dan mengonfigurasi parameternya.



## ⚠️ Catatan Penting & Troubleshooting
Jaringan Sepolia Testnet: Bot ini dikonfigurasi untuk Sepolia Testnet. Pastikan Anda memiliki ETH dan token uji coba (R2, USDC, R2USD, sR2USD) yang cukup di dompet Anda di jaringan ini.
Biaya Gas: Transaksi blockchain memerlukan gas (ETH). Pastikan Anda memiliki cukup ETH di dompet Anda untuk membayar biaya gas.
Slippage: Toleransi slippage (diatur ke 0.5% untuk swap, 10% untuk add liquidity Curve) adalah pengaman. Jika harga bergeser terlalu jauh, transaksi akan gagal untuk melindungi Anda dari kerugian. Anda mungkin perlu menyesuaikannya tergantung kondisi pasar dan likuiditas pool.
Urutan Token di Curve Pool: Untuk pool mirip Curve (seperti USDC-R2USD dan R2USD-sR2USD), urutan token saat menambah/menghapus likuiditas sangat penting. Bot ini sudah mengimplementasikan urutan yang benar berdasarkan verifikasi Etherscan:
USDC-R2USD: Mengharapkan [R2USD, USDC]
R2USD-sR2USD: Mengharapkan [sR2USD, R2USD]
Jika Anda berinteraksi dengan pool Curve lain, selalu verifikasi urutan coins(0) dan coins(1) dari kontrak pool.
Log Saldo LP Token Nol: LP token yang saldonya nol (seperti R2-R2USD LP: 0.0) mungkin masih ditampilkan karena konfigurasi forceDisplay. Ini berarti dompet Anda benar-benar tidak memiliki LP token tersebut saat bot membaca saldo dari blockchain.

## 🤝 Kontribusi
Jika Anda ingin berkontribusi pada proyek ini, silakan fork repositori dan kirimkan pull request. Setiap kontribusi sangat dihargai!

## 📜 Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file LICENSE untuk detail lebih lanjut.

