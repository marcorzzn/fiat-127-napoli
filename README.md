# Gran Premio di Napoli · Fiat 127 Napoli 1926 (Uno com escada)

**Una Fiat 127 in livrea SSC Napoli 3° Scudetto 1926 sul circuito cittadino del Lungomare di Napoli — insieme alle tre versioni originali della Fiat Uno Mille EP 1996 con scala sul tetto — da guidare direttamente nel browser in WebGPU puro.**

Ogni edizione è racchiusa in un singolo file `index.html` auto-contenuto (~341 KB – 603 KB). Il codice genera proceduralmente l'auto, il circuito, il paesaggio, il mare, il cielo e l'audio sintetizzato, senza dipendere da asset esterni, engine o librerie 3D.

> **Nota sul fork:** Questo repository è un fork di **Uno com escada**, creato originariamente da [ViktorKav](https://www.youtube.com/@vkav) (materiale originale su [viktorkav.com.br/apoio/uno-com-escada](https://viktorkav.com.br/apoio/uno-com-escada/)). Oltre a conservare intatti i tre circuiti originali (Fable 5.2, Opus 5.5 e GPT-6.2 Astra), questo fork introduce la nuova edizione giocabile **Gran Premio di Napoli · Fiat 127 Napoli 1926** (`/napoli/`).

---

## Novità del Fork: Gran Premio di Napoli (`/napoli/`)

Realizzata sullo stesso motore WebGPU single-HTML della repository (zero librerie 3D esterne), l'edizione **Gran Premio di Napoli** sostituisce la Uno con scala e trasporta la gara sul Lungomare di Napoli:

* **Fiat 127 in livrea SSC Napoli 3° Scudetto 1926:**
  * Carrozzeria *Azzurro Napoli* PBR con cofano e parte superiore dei parafanghi bianchi, Scudetto tricolore numero 3 con bordo dorato, tetto a scacchi azzurro/bianco (rimossi portapacchi e scala) e paraurti bianchi lucidi.
  * Frontale con scritta `1926` tra i fari rettangolari, frecce arancioni sotto i proiettori, targa nera `1926S3·NA` (anteriore e posteriore) e maschera di Pulcinella con pennellata gialla sui parafanghi anteriori.
  * Fiancate speculari con scritta `FORZA NAPOLI`, fascia paracolpi bianca, `UN GIORNO ALL'IMPROVVISO...`, numero `9`, prese d’aria bianche sul montante C, specchietti bianchi, interni chiari e cerchi in acciaio bianchi con coprimozzo azzurro.
  * Dinamica tarata per la Fiat 127 su circuito cittadino (massa ridotta, passo agile e aderenza calibrata per chicane e tornanti).
* **Circuito del Lungomare di Napoli (“Napoli Racing Show Arena”):**
  * Tracciato chiuso in senso antiorario (**~1.275 m**) lungo Via Caracciolo con i due rettilinei paralleli, l’anello semicircolare di Rotonda Diaz sul mare, **7 chicane** con rotoballe e pannelli direzionali bianco-rossi, tornante Castel dell’Ovo e tornante Mergellina.
  * Scenario costiero del Golfo di Napoli generato via shader e mesh procedurali: mare animato con schiuma costiera, scogliere calcaree bianche frangiflutti, sabbia vulcanica scura di Mappatella Beach, Castel dell’Ovo sull’isolotto di Megaride, profilo bicuspide del Vesuvio e Monte Somma, palazzi napoletani su Riviera di Chiaia e alberatura confinata a Villa Comunale e colline.
  * Arredo di pista e luce mediterranea tardo-pomeridiana: barriere New Jersey in cemento, blocchi bianco-rossi e tricolore, portale di partenza/arrivo bianco-rosso, secondo arco su Via Caracciolo, maxischermo LED tralicciato fronte mare, Tribuna Principale A/B con tifosi in azzurro, gazebi dell’Event Village, balaustra con lampioni d’epoca e **7 telecamere TV panoramiche**.
* **Interfaccia italiana & Hub aggiornato:**
  * Menu e cruscotto HUD in italiano (`GIRO` / `ULTIMO` / `MIGLIORE`, *Inizia gara*, *Guida autonoma (Demo)* con pilota automatico live e cambio telecamera automatico, *Benchmark 60 s*, pose fisse `1–6` per ispezionare livrea e tracciato, supporto tastiera e gamepad).
  * Pagina principale (`/`) e GitHub Pages focalizzate sul Gran Premio di Napoli con panoramica completa, riferimenti visivi, guida ai comandi, simulatore integrato e attribuzione al progetto base.
  * Selettore qualità grafica **Bassa / Media / Alta** (tasto `Q` o interfaccia) con autorilevamento per GPU integrate (AMD Radeon R5, Intel HD/UHD) e scaling risoluzione per evitare cali di frame e timeout GPU.

---

## Giocare

### Sul tuo computer (in locale)

1. Clona la repository oppure scarica uno dei file auto-contenuti:
   * [`napoli/index.html`](napoli/index.html) *(Gran Premio di Napoli · Fiat 127)*
   * [`fable/index.html`](fable/index.html) *(Uno com escada · Fable 5.2)*
   * [`opus/index.html`](opus/index.html) *(Uno com escada · Opus 5.5)*
   * [`astra/index.html`](astra/index.html) *(Uno com escada · GPT-6.2 Astra)*
2. Apri il file nel browser (**Chrome**, **Edge** o **Safari 18+**) su un computer con accelerazione hardware GPU attiva (per avviare l'hub `/` completo, avvia un server locale come `python3 -m http.server`).
3. Attendi il caricamento del circuito. Su **Napoli**, **Fable** e **Opus**, premi **Inizia gara** / **Começar**. Su **Astra**, accelera direttamente con `W`.

Non c'è nulla da installare e ogni circuito funziona anche offline. È necessario un browser con supporto **WebGPU** attivo. Il target prestazionale del progetto originale era un MacBook Pro M4 Max a 2560×1440; su hardware più modesto il framerate può ridursi.

### Demo online delle tre versioni originali (ViktorKav)

* [Versione Fable 5.2](https://viktorkav.com.br/apoio/uno-com-escada/fable/)
* [Versione Opus 5.5](https://viktorkav.com.br/apoio/uno-com-escada/opus/)
* [Versione GPT-6.2 Astra](https://viktorkav.com.br/apoio/uno-com-escada/astra/)

---

## Le quattro edizioni a confronto

![La Uno blu con la scala sul tetto in curva, ripresa dalla telecamera TV](.github/screenshots/fable-tv.jpg)

Le tre edizioni originali sono nate da un esperimento del canale [ViktorKav](https://www.youtube.com/@vkav) su come strutturare un prompt per l'IA, affidando lo stesso identico brief a tre modelli diversi (Claude Fable 5.2, Claude Opus 5.5 e GPT-6.2 Astra), a cui si aggiunge ora l'edizione **Gran Premio di Napoli**:

| | Gran Premio di Napoli (Fork) | Fable 5.2 (Originale) | Opus 5.5 (Originale) | GPT-6.2 Astra (Originale) |
|---|---|---|---|---|
| **Auto** | Fiat 127 Napoli 1926 | Fiat Uno Mille EP 1996 + scala | Fiat Uno Mille EP 1996 + scala | Fiat Uno Mille EP 1996 + scala |
| **Circuito** | Lungomare di Napoli (~1.275 m) | Serra da Mata | Circuito da Serra | Serra do Lume |
| **Lingua UI** | Italiano | Portoghese | Portoghese | Portoghese |
| **Dimensione bundle** | ~551 KB | 603 KB | 341 KB | 467 KB |
| **Sforzo AI (originale)** | Derivato dal motore base | Alto | Alto | Ultra |
| **Tempo di lavoro AI** | — | 7 h 12 min | 5 h | 6 h 49 min |
| **Round critico visivo** | — | 8 | 11 | 19 |
| **Difetti gravi finali** | 0 (6/6 test superati) | 4 | 5 | 0 |
| **Costo API (originale)** | — | US$ 347,64 | US$ 87,81 | US$ 371,02 |

| Fable 5.2 | Opus 5.5 | GPT-6.2 Astra |
|---|---|---|
| ![Rettilineo di partenza nella versione Fable](.github/screenshots/fable-largada.jpg) | ![Portale di partenza nella versione Opus](.github/screenshots/opus-largada.jpg) | ![Uno blu davanti ai box di Serra do Lume](.github/screenshots/astra-largada.jpg) |
| ![Curva nella versione Fable](.github/screenshots/fable-curva.jpg) | ![Curva nella versione Opus](.github/screenshots/opus-curva.jpg) | ![Uno in curva a Serra do Lume](.github/screenshots/astra-curva.jpg) |

Nel progetto originale, ogni modello aveva il proprio critico visivo (un sub-agente indipendente che vedeva solo gli screenshot del gioco e le immagini di riferimento, mai il codice). Opus si è fermato al round 11 segnalando che il lavoro non era ancora concluso; Fable è stato interrotto al round 8; Astra è stato concluso al round 19 con zero difetti gravi e tre medi ([vedi il processo e le misurazioni di Astra](astra/PROCESSO.md)).

---

## Comandi

### Napoli, Fable e Opus

La lista completa dei comandi è consultabile anche nella schermata iniziale di ciascun gioco.

| Azione | Tastiera | Gamepad |
|---|---|---|
| Accelerare | `W` o `↑` | Grilletto destro (`RT` / `R2`) |
| Frenare e retromarcia | `S` o `↓` | Grilletto sinistro (`LT` / `L2`) |
| Sterzare | `A` `D` o `←` `→` | Stick analogico sinistro |
| Freno a mano | `Spazio` | `A` / `Croce` |
| Cambiare telecamera | `C` | `Y` / `Triangolo` |
| Guardare indietro | Tieni premuto `V` | Tieni premuto `RB` / `R1` |
| Riposizionare l'auto in pista | `R` | `X` / `Quadrato` |
| Mettere in pausa e aprire il menu | `Esc` | `Start` / `Options` |

| Strumento | Tasto |
|---|---|
| Attiva / disattiva audio | `M` |
| Statistiche di prestazioni (FPS / GPU) | `H` |
| Qualità grafica (Bassa / Media / Alta) | `Q` |
| Benchmark: giro automatico di 60 s con media e picco finale | `B` |
| Guida autonoma (Demo) / giro automatico | `F` |
| Pose fisse di telecamera (ispezione livrea e tracciato) | `1` – `6` |

Il cambio è automatico e il giro viene conteggiato al passaggio sulla linea del traguardo. L'audio sintetizzato si attiva dopo il primo clic.

### GPT-6.2 Astra

Il gioco si avvia direttamente in pista. Usa `W` per accelerare, `S` per frenare e fare retromarcia, `A` e `D` per sterzare e `Spazio` per il freno a mano. `C` alterna tra tre telecamere, `R` riposiziona l'auto e `H` mostra i comandi.

---

## Come è stato costruito

La cartella [`pedidos`](pedidos) conserva i prompt originali ricevuti dall'IA senza tagli:

| File | Contenuto |
|---|---|
| [`01-circuito.txt`](pedidos/01-circuito.txt) | Il prompt principale del gioco: priorità, vincoli, macchina target, scena, tre verifiche (critico visivo, prestazioni e comandi) e criteri di completamento. |
| [`02-som-e-menu.txt`](pedidos/02-som-e-menu.txt) | Il secondo prompt: supporto gamepad, cruscotto, schermata iniziale, menu, benchmark e audio sintetizzato. |
| [`03-ajustes.txt`](pedidos/03-ajustes.txt) | Tre rifiniture finali su testi e volumi audio. |

Il formato del prompt originale prende ispirazione da [Abyssal Garden](https://github.com/Noniv/abyssal-garden) di Noniv: un mondo sottomarino 3D in 97 KB realizzato interamente in WebGPU procedurale.

---

## Modificare il codice e ricompilare

Il codice sorgente leggibile di ciascuna versione si trova nella rispettiva cartella `source`. Per rigenerare i singoli file `index.html` auto-contenuti è sufficiente **Node.js 18+** (o **Python 3** per Astra), senza pacchetti esterni:

```bash
node napoli/source/build.mjs
node fable/source/build.mjs
node opus/source/build.mjs
```
