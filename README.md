# Reverse Birth Chart

**[Live Demo](https://reverse-birth-chart-five.vercel.app/)**

Find a birth date that produces specific zodiac sign placements.

Most astrology tools go from birthday to chart. This one goes the other way: you pick the signs you want, and it finds dates that match.

## Who is this for?

- **Fiction writers** who want astrologically consistent birthdays for their characters
- **RPG / TRPG players** building characters with specific personality archetypes
- **Astrology enthusiasts** curious about when particular planetary combinations occur

## Features

- **10-planet search** — Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- **Priority system** — Mark placements as "Required" or "Preferred" to get flexible results
- **Personality Guide** — Not sure which signs to pick? Answer questions about your character and let the wizard suggest placements
- **LLM prompt generator** — Have a written character description? Generate a prompt that asks an LLM to infer the signs for you
- **Runs entirely in the browser** — No server, no data collection. Swiss Ephemeris compiled to WebAssembly handles all the math.

## How it works

1. Choose zodiac signs for the planets you care about (Sun and Moon are required)
2. Set a year range (up to 10 years at a time)
3. Hit Search — the tool scans every 6 hours across the range and returns matching dates, ranked by how many placements match

## Credits

- Astronomical calculations by [Swiss Ephemeris](https://www.astro.com/swisseph/) via [sweph-wasm](https://github.com/ptprashanttripathi/sweph-wasm)
- Based on the Japanese original: [astro-tool](https://astro-tool-nine.vercel.app/reverse.html)

## License

AGPL-3.0 — see [LICENSE](LICENSE) for details. The AGPL license is inherited from sweph-wasm (Swiss Ephemeris).
