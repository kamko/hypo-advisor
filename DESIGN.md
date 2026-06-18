---
name: Hypo Advisor
description: Priame a zrozumiteľné porovnanie hypotekárnych scenárov pre Slovensko.
---

<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Hypo Advisor

## Overview

**Creative North Star: "Pokojný výpočet"**

Rozhranie má pôsobiť ako dobre pripravený pracovný list: jasné vstupy, zrozumiteľné porovnanie a dostatok priestoru na sústredenie. Vizuálny systém je striedmy a funkčný; pozornosť smeruje k číslam, rozdielom a predpokladom, nie k značke samotnej.

Systém odmieta generickú AI-generovanú fintech estetiku, dekorácie bez informačnej hodnoty a prvky, ktoré by naznačovali garantovaný finančný výsledok. Pohyb slúži iba na potvrdenie zmeny stavu alebo vstupu.

**Key Characteristics:**

- Pokojná informačná hierarchia
- Priame pomenovania bez bankového žargónu
- Kompaktné, známe ovládacie prvky
- Viditeľné predpoklady a vysvetliteľné výsledky

## Colors

Striedme neutrálne povrchy dopĺňa jeden funkčný akcent; konkrétna paleta bude určená pri implementácii.

### Primary

- **Funkčný akcent** ([to be resolved during implementation]): Iba pre primárne akcie, aktuálny výber, fokus a dôležité stavové indikátory.

### Neutral

- **Hlavné pozadie** ([to be resolved during implementation]): Pokojný, nesfarbený základ aplikácie.
- **Pracovná plocha** ([to be resolved during implementation]): Jemne oddelená vrstva pre formuláre a porovnanie.
- **Text a deliace prvky** ([to be resolved during implementation]): Kontrastné neutrály, ktoré spĺňajú WCAG 2.2 AA.

**The One Accent Rule.** Akcent nikdy neslúži ako dekorácia a na jednej obrazovke zostáva vizuálne vzácny.

## Typography

**Display Font:** [single sans-serif family to be chosen at implementation]
**Body Font:** [same sans-serif family to be chosen at implementation]

**Character:** Jeden civilný, dobre čitateľný sans-serif nesie celé produktové rozhranie. Hierarchiu tvorí veľkosť, rez a priestor, nie miešanie písiem.

### Hierarchy

- **Display:** Striedmy nadpis obrazovky bez marketingovej teatrálnosti.
- **Headline:** Nadpisy hlavných pracovných oblastí.
- **Title:** Názvy skupín vstupov a výsledkov.
- **Body:** Základný text s maximálnou dĺžkou 70 znakov na riadok pri súvislom texte.
- **Label:** Jasné pomenovania formulárových polí bez dekoratívneho verzálkového písma.

**The Numbers Are Content Rule.** Finančné hodnoty musia byť čitateľné, zarovnané a vizuálne stabilné; nesmú sa meniť na dekoratívne hero metriky.

## Elevation

Systém je plochý v predvolenom stave. Hĺbku vytvára poradie povrchov, deliace prvky a priestor; tieň je vyhradený iba pre dočasné vrstvy, ak neskôr vzniknú.

**The Flat-by-Default Rule.** Statické pracovné plochy sa nezdvíhajú tieňom.

## Components

Komponenty zatiaľ nie sú definované. Pri implementácii majú používať známe webové affordancie, konzistentné tvary a kompletné stavy pre hover, fokus, aktívny, zakázaný a chybový stav. Prechody majú byť krátke a slúžiť iba ako spätná väzba.

## Do's and Don'ts

### Do:

- **Do** smerovať pozornosť k rozdielu medzi scenármi a k predpokladom výpočtu.
- **Do** používať jeden konzistentný slovník pre formuláre, tlačidlá a výsledky.
- **Do** rozlišovať výsledky textom a tvarom, nikdy iba farbou.
- **Do** rešpektovať ovládanie klávesnicou a systémové obmedzenie pohybu.

### Don't:

- **Don't** vytvárať generickú AI-generovanú fintech šablónu.
- **Don't** používať dekorácie bez informačnej hodnoty ani nadmerné množstvo kariet.
- **Don't** používať marketingové superlatívy, falošnú presnosť alebo vizuály naznačujúce garantovaný finančný výsledok.
- **Don't** pridávať pohyb, ktorý neoznamuje zmenu stavu.
- **Don't** vymýšľať neštandardné formulárové ovládanie iba kvôli osobitosti.
