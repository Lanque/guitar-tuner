# Guitar Tuner

[![CI](https://github.com/Lanque/guitar-tuner/actions/workflows/ci.yml/badge.svg)](https://github.com/Lanque/guitar-tuner/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-43.1-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.55-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

A fast, high-precision guitar tuner built as a cross-platform desktop application (Windows portable `.exe`) and modern web application. Powered by real-time Web Audio API signal processing and the **YIN Pitch Detection algorithm** for reliable pitch analysis across quiet audio inputs and diverse guitar tunings.

---

## Features

- **YIN Pitch Detection Engine**: Real-time time-domain autocorrelation pitch extraction with parabolic interpolation and RMS noise floor suppression.
- **Auto & Manual Target String Locking**: Automatically detects the closest string in real time or locks onto a target string.
- **Preset & Custom Tunings**: Out-of-the-box support for Standard E, Drop D, DADGAD, Open D, Half Step Down, plus an interactive **Custom Tuning Editor**.
- **Audio Input Selection**: Select dedicated audio interfaces (Focusrite, Behringer, etc.) or internal microphones dynamically.
- **Visual Cents Gauge**: High-responsiveness needle gauge displaying exact cents offset ($\pm 50$ cents) with instant visual feedback (Flat / Perfect / Sharp).
- **Zero-Install Portable Executable**: Standalone Windows desktop app packaged with `electron-builder` into a single `.exe` file.

---

## Technology Stack

| Category | Technology & Libraries |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vanilla CSS design system |
| **Audio Processing** | Web Audio API (`AudioContext`, `AnalyserNode`), YIN Algorithm |
| **Desktop Wrapper** | Electron 43, `electron-builder` (Portable target) |
| **Build & Dev Tooling** | Vite 7, ESBuild, Concurrently, Wait-On |
| **Testing & Quality** | Vitest 3, `@testing-library/react`, Playwright (E2E), `@axe-core/playwright` |
| **Linting & Formatting** | ESLint 9 (Flat Config), Prettier, TypeScript Strict Mode |
| **CI Automation** | GitHub Actions CI |

---

## Technical Architecture & Signal Processing

### 1. YIN Pitch Detection (`src/audio/yinPitchDetector.ts`)
The pitch detection algorithm extracts fundamental frequencies ($f_0$) from digital audio streams:
1. **RMS Thresholding**: Filters out background noise ($RMS < 0.002$).
2. **Difference Function**: Computes squared difference function across tau lags:
   $$d_t(\tau) = \sum_{j=1}^{W} (x_j - x_{j+\tau})^2$$
3. **Cumulative Mean Normalization**: Minimizes octave errors by normalizing:
   $$d'_t(\tau) = \frac{d_t(\tau)}{\frac{1}{\tau} \sum_{j=1}^{\tau} d_t(j)}$$
4. **Parabolic Interpolation**: Refines tau estimates to fractional sample resolution for sub-Hz accuracy:
   $$f_{\text{detected}} = \frac{\text{sampleRate}}{\tau_{\text{interpolated}}}$$

### 2. Cents Deviation Calculation (`src/domain/tuner.ts`)
Calculates pitch offset in logarithmic cents scale:
$$\text{cents} = 1200 \times \log_2\left(\frac{f_{\text{detected}}}{f_{\text{target}}}\right)$$
- Pitch status:
  - $|\text{cents}| \le 2$: **Perfect** 🟢
  - $\text{cents} < -2$: **Flat** 🔵
  - $\text{cents} > +2$: **Sharp** 🔴

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### Installation
```bash
git clone https://github.com/Lanque/guitar-tuner.git
cd guitar-tuner
npm install
```

### Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite web development server |
| `npm run desktop:dev` | Launches Electron desktop app in live-reload mode |
| `npm run build` | Builds web app production bundle |
| `npm run desktop:build` | Packages standalone Windows portable executable (`.exe`) |
| `npm run typecheck` | Validates TypeScript strict typing without emitting code |
| `npm run lint` | Runs ESLint 9 rules check |
| `npm run format:check` | Checks code formatting with Prettier |
| `npm run test` | Runs Vitest unit tests in watch mode |
| `npm run test:run` | Runs Vitest unit tests with v8 code coverage |
| `npm run test:e2e` | Runs Playwright E2E browser tests |

---

## Repository Structure

```
guitar-tuner/
├── .github/workflows/   # GitHub Actions CI configuration
├── electron/            # Main process entry point for desktop app
├── scripts/             # Build scripts for portable desktop packaging
├── src/
│   ├── audio/           # YIN pitch detection algorithm & audio math
│   ├── components/      # React components (Gauge, AudioPicker, StringStrip, etc.)
│   ├── domain/          # Tuning formulas, scale frequencies, cents calculation
│   ├── hooks/           # Web Audio API lifecycle hook (useGuitarTuner)
│   ├── App.tsx          # Main tuner view
│   └── styles.css       # Core styling & UI theme
├── vite.config.ts       # Vite bundler configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies & scripts
```

---

## Building the Desktop App

To build a standalone, zero-installation `.exe` file for Windows:

```powershell
npm run desktop:build
```

The output portable binary will be generated in `release/Guitar-Tuner-0.1.0.exe`.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
