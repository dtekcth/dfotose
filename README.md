DFotos hemsida
===============

Detta är Datateknologsektionens fotoförening, DFoto, blivande hemsida.

För att få inloggning(kerberos) att fungera i fixa krb5.conf såhär: http://dtek.se/wiki/Main/Kerberos.
Detta behöver endast göras server-side.

**TODO**:

UI:
- hantera gallerier
    - lägga till
    - ta bort
    - sätta taggar
    - göra publikt / ej publikt
    - visible för endast inloggade
- ladda upp bilder till galleri
- fixa mobx observable react, så att man inte behöver byta tabbar och skit ibland
- fixa något schysst state-storage, hemskt rörigt just nu
- vy för att kolla på en bild
- vy för att kolla på ett galleri
- vy för att kolla på alla gallerier (standard, paginated)
- sök-function bland taggar

BACKEND:
- databas-migrations-script
- gallerier:
    - visible för endast inloggade
    - taggar
- bilder:
    - taggar
