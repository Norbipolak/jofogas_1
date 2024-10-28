/*
    a .env file szerint már tudunk csatlakozni az adatbázishoz 
    DB_HOST=127.0.0.1
    DB_USER=root 
    DB_PASS=
    DB_NAME=jofogas_clone ... 

    És ide az első dolog, hogy be kell importálni a pool-t amit csináltunk!! Conn.ts-en 
    ->
    import pool from "./backend/frameworks/Conn.js";
    és nem felejtjük el odaírni, hogy .js utána!!! 
*/
import { PoolConnection, Query } from "mysql2";
import pool from "./frameworks/Conn.js";

async function getSomething():Promise<void> {
    /*
        Ha a limit szerint még van szabad connection, akkor abból kiveszük egyet
        és felhasználjuk!! 
        Ha nincsen, akkor addig várunk a beállításunk szerint, ameddig nem lesz 
        Ez volt a -> waitForConnections: true 
            Tehát nem dobja el a kérést, hanem addig vár, ameddig nem lesz szabad 
    */
    const conn:any = await pool.promise().getConnection();

    const response:Query = await conn.query("SELECT * FROM users");
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

    Ilyenkor visszakapunk a console.log(response)-ra 
    Egy tömböt, amiben van még két tömb 
    Az elsőben vannak az adatok, amiket lekérdeztünk, a másodikban meg, hogy milyen mezők vannak a lekérdezésben és hogy milyen típusak
    [
        [
            {
                userID: 1, 
                isAdmin: 1,
                email: 'admin@admin.hu',
                pass: 'ce57...',
                firstName: 'Admin',
                lastName: 'Aladár', 
                created: null,
                updated: null
            }
        ],
        [
            'userID' BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            'isAdmin' TINYINT(1),
            'email' VARCHAR(255) NOT NULL UNIQUE KEY,
            'pass' VARCHAR(128) NOT NULL
            'created' DATETIME(19) ....
        ]
    ]

    És akkor így meg van a connection 

    Egy olyan osztályt, ami a HTTP kéréseket kezeli egy olyan osztályt -> HTTP.ts
*/

/***********************************************************************************************************************************************/
import http from "./frameworks/HTTP.js";
import { Request, Response } from "express";

http.get("/something", (req:Request, res:Response)=> {
    res.status(200).json("{importantData:123");
});
//ezzel már el is készítettünk egy endpointot

/*
    Tehát van egy http osztály, amiből csináltunk egy példányt és azt ide behívjuk majd ennek a van egy olyan metódusa, hogy get 
    ami vár 2 dolgot 
    1. endpoint -> "/something"
    2. callback a request meg a response-val 

    res.status(200).json("{importantData:123");

    Ami fontos, hogy ezt tudjuk tesztelni a Thunder Client-vel
    Ott ki kell választani, hogy ez egy Get-es kérés lesz (az az alapbeállítás) és be tudjuk írni, hogy 
    http://localhost:3001/something 
    Van egy olyan a query mellett, hogy Headers (ott be kell írni, hogy Content-type application/json)
    és ezek után meg SEND

        public async get(path:string, cb:(req: Request, res: Response) => void) {
            this.app.get(path,cb);
        }

    Az a baj, hogy be sem állítottuk a port-ot, ezért a HTTP.ts-en be kell állítani, hogy melyik port-on listen-eljen majd 
    ->
    import express, { Request, Response } from "express";
    import dotenv from "dotenv";   ***

    dotenv.config();  ***

    class HTTP {
        private app:express.Application;

        constructor() {
            this.app = express();
            console.log(process.env_SERVER_PORT);
            this.app.listen(process.env.SERVER_PORT);  *****
        }

    ***
    De ez még mindig nem lesz jó, mert itt a process.env.SERVER_PORT az undefined lesz 
    mert itt a HTTP-n is importálni kell a dotenv-et és azt kell mondani, hogy dotenv.config(); 

    és akkor így már okés és látjuk az kiírva a localhost:3001/something-on azt amit res.json-oltunk 
    ->
    "{importantData:123}"
*/