# Llogaritësi i WBT 🌡️

Një faqe e vetme, plotësisht në shqip, që llogarit **Temperaturën e Bulbit të Lagësht (WBT)**
sipas formulës empirike të **Stull (2011)**. Gjithçka ndodh në anën e klientit — pa server.

## Pse ka rëndësi

WBT-ja tregon sa mund ta ftohë trupi vetveten me djersë. Kur nxehtësia dhe lagështia
janë të dyja të larta, djersa nuk avullon dot. Mbi **35 °C WBT** trupi i njeriut nuk
mbijeton dot për shumë orë, edhe në hije e në qetësi.

## Zhvillimi

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # ndërton dist/ statike
npm run preview  # parashikon build-in
```

## Vendosja (deploy)

`npm run build` prodhon një dosje `dist/` plotësisht statike. Mund ta ngarkosh në
GitHub Pages, Netlify, Vercel ose çdo host statik — pa konfigurim shtesë
(`base: "./"` është vendosur te `vite.config.ts`).

## Stack

- **Vite + TypeScript** (pa framework)
- CSS i pastër, dizajn modern e responsiv (mobile-first)

## Formula

```
Tw = T·atan[0.151977·√(RH + 8.313659)]
   + atan(T + RH)
   − atan(RH − 1.676331)
   + 0.00391838·RH^1.5·atan(0.023101·RH)
   − 4.686035
```

E vlefshme për RH 5–99% dhe temperaturë rreth −20 °C deri 50 °C, në presion afër
nivelit të detit. Burimi: Stull, R. (2011), *Journal of Applied Meteorology and Climatology*.
