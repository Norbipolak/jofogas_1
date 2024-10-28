import pool from "./frameworks/Conn.js";
async function getSomething() {
    /*
        Ha a limit szerint még van szabad connection, akkor abból kiveszük egyet
        és felhasználjuk!!
        Ha nincsen, akkor addig várunk a beállításunk szerint, ameddig nem lesz
        Ez volt a -> waitForConnections: true
            Tehát nem dobja el a kérést, hanem addig vár, ameddig nem lesz szabad
    */
    const conn = await pool.promise().getConnection();
    const response = await conn.query("SELECT * FROM users");
    console.log(response);
}
/*
    const conn = await pool.getConnection()
    Ez így nem lesz jó, hanem így kell majd
    ->
    const conn = await pool.promise().getConnection();

    Mert ha csak annyi van, hogy pool.getConnection(), akkor kellene egy callback -> pool.promise().getConnection(()=> {});
        de ezt mi nem akarjuk

    const conn = await pool.promise().getConnection();
    Ezzel szerzünk egy connection-t ha tudunk, ha nem tudunk akkor addig vár ez a folyamat, főleg, hogy ez egy async folyamat
        tehát tud is várni, amig nincsen szabad connection!!

    És akkor ebből tudunk már a megszokott módon egy lekérdezést csinálni!!
    const response = await conn.query("SELECT * FROM users");
    console.log(response);
    és ha van valami a users táblában, akkor azt lekérdezzük!!
    De nincsen még ezért beszurnk valamilyen adatokat a mySQL felületen a pass-ra meg SHA512-es kódolást lesz
    https://emn178.github.io/online-tools/sha512.html
    És akkor ez automatikusan ha beírunk valamit pl.asdf, akkor egy ilyet kapunk majd vissza (amit majd berakunk a pass-hoz) ->
    401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1
*/
getSomething();
/*
    Meg kell hívni a függvényt, hogy majd lássuk, hogy mi van a console.log(response)-ban
    és még fontos, hogy nem tudjuk végrehajtani az index-et
    ->
    Mert ez egy ts (TypeScript) file és azokat le kell fordítani js file-ra!!!

    Két dolog fontos a fordításnál
    1. --watch
    2. --target ES2022 (EcmaScript szabvány szerint fogja nekünk lefordítani)

    Ezt kell majd beírni a terminálba
    ->
    tsc index.ts --watch --target ES2022
    és akkor most ezt lefordítja és keletkezik egy ilyen file-unk, hogy index.js!!!
    Igazából csak a típusokat szedi ki, de itt nem is határoztunk meg típusokat a .ts-ben tehát teljesen ugyanaz a kettő

    --watch
    Ha azt mondjuk erre a file-ra, hogy watch, akkor az összes file, amire ez hivatkozik ez az index az automatikusan lefordul
    Tehát mivel itt be volt hívva valami a Conn.ts-ről (import pool from "./frameworks/Conn.js";)
    Ezért a Conn.ts-ből is képzödőtt egy Conn.js file!!

    De hogy ne legyen teljesen ugyanaz a ts meg a js file, ezért ennek a getSomething function-nak, ami nem ad vissza semmit
    ez lehet a visszatérési értéke -> :Promise<void>

    a response meg egy query-ot fog visszaadni
    ->
    const response:Query = await conn.query("SELECT * FROM users");

    a conn-nál nem akarta elfogadni, hogy az egy PoolConnection-t ad majd vissza (alá volt húzva), ezért ki kell egészíteni egy any-vel
    ->
    const conn:PoolConnection|any = await pool.promise().getConnection(); vagy csak simán azt mondjuk rá, hogy any!
    De attól még, hogy alá volt húzva az, hogy PoolConnection, attól még lefutna, tehát müködne a kód, mert a fordításban nem érdekli a js-t,
        hogy az micsoda
*/
/*
    Ha már meg van a fordítás és le akarjuk futatni az index file-t
    ->
    nodemon index
*/ 
