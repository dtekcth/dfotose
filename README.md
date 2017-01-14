DFotos hemsida
===============

Detta är Datateknologsektionens fotoförening, DFoto, blivande hemsida.

För att få inloggning(kerberos) att fungera i fixa krb5.conf såhär: http://dtek.se/wiki/Main/Kerberos.
Detta behöver endast göras server-side.

### Requirements
Installera

* node/nodejs
* gulp
* kerberos config

### Build
```bash
$> git clone https://github.com/dtekcth/dfotose
$> cd dfotose
$> npm install
...
$> cp src/config/config.yml{.sample,}
$> vim src/config/config.yml
...
$> gulp
...
```

Besök sidan på http://localhost:4000/ . När du ändrar i koden laddar den om sig själv by default.
