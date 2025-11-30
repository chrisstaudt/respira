# Brother Embroidery Machine Web Controller

A modern web application for controlling Brother embroidery machines via WebBluetooth.

## Features

- **WebBluetooth Connection**: Connect directly to Brother PP1 embroidery machines from your browser
- **Pattern Upload**: Load and upload PEN format embroidery files
- **Pattern Visualization**: Preview embroidery patterns on an interactive canvas with color information
- **Real-time Monitoring**: Monitor sewing progress, position, and status in real-time
- **Machine Control**: Start mask trace, start sewing, and manage patterns

## Requirements

- Modern browser with WebBluetooth support (Chrome, Edge, Opera)
- HTTPS connection (required for WebBluetooth API)
- Brother PP1 compatible embroidery machine with BLE

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Note**: WebBluetooth requires HTTPS. For local development, you can use:
- `localhost` (works with HTTP)
- A reverse proxy with SSL
- Vite's HTTPS mode: `npm run dev -- --https`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Connect to Machine**
   - Click "Connect to Machine"
   - Select your Brother embroidery machine from the browser's Bluetooth device picker
   - Machine information and status will be displayed

2. **Load Pattern**
   - Click "Choose PEN File" and select a `.pen` embroidery file
   - Pattern details and preview will be shown on the canvas
   - Different colors are displayed in the preview

3. **Upload to Machine**
   - Click "Upload to Machine" to transfer the pattern
   - Upload progress will be shown
   - Pattern information will be retrieved from the machine

4. **Start Mask Trace** (optional)
   - Click "Start Mask Trace" to trace the pattern outline
   - Confirm on the machine when prompted

5. **Start Sewing**
   - Click "Start Sewing" to begin the embroidery process
   - Real-time progress, position, and status will be displayed
   - Follow machine prompts for color changes

6. **Monitor Progress**
   - View current stitch count and completion percentage
   - See real-time needle position
   - Track elapsed time

## Project Structure

```
web/
├── src/
│   ├── components/       # React components
│   │   ├── MachineConnection.tsx
│   │   ├── FileUpload.tsx
│   │   ├── PatternCanvas.tsx
│   │   └── ProgressMonitor.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useBrotherMachine.ts
│   ├── services/        # BLE communication
│   │   └── BrotherPP1Service.ts
│   ├── types/           # TypeScript types
│   │   └── machine.ts
│   ├── utils/           # Utility functions
│   │   └── penParser.ts
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **WebBluetooth API**: BLE communication
- **HTML5 Canvas**: Pattern visualization

## Protocol

The application implements the Brother PP1 BLE protocol:
- Service UUID: `a76eb9e0-f3ac-4990-84cf-3a94d2426b2b`
- Write Characteristic: `a76eb9e2-f3ac-4990-84cf-3a94d2426b2b`
- Read Characteristic: `a76eb9e1-f3ac-4990-84cf-3a94d2426b2b`

See `../emulator/PROTOCOL.md` for detailed protocol documentation.

## PEN Format

The application supports PEN format embroidery files:
- Binary format with 4-byte stitch records
- Coordinates in 0.1mm units
- Supports multiple colors and color changes
- Includes jump stitches and flags

## Browser Compatibility

WebBluetooth is supported in:
- Chrome 56+
- Edge 79+
- Opera 43+

**Not supported in:**
- Firefox (no WebBluetooth support)
- Safari (no WebBluetooth support)

## License

MIT
