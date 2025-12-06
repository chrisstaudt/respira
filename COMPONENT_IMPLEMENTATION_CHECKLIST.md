# Component Implementation Checklist

Step-by-step guide to implementing UI improvements in each component.

---

## Setup (Do First)

### 1. Create Design Tokens

**File: `C:\Users\micro\Documents\dev\respira-web\src\styles\design-tokens.css`**

```css
@theme {
  /* Primary - Blue */
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1d4ed8;

  /* Secondary - Slate */
  --color-secondary: #64748b;
  --color-secondary-light: #94a3b8;

  /* Success - Green */
  --color-success: #16a34a;
  --color-success-bg: #dcfce7;

  /* Warning - Amber */
  --color-warning: #d97706;
  --color-warning-bg: #fef3c7;

  /* Danger - Red */
  --color-danger: #dc2626;
  --color-danger-bg: #fee2e2;

  /* Info - Cyan */
  --color-info: #0891b2;
  --color-info-bg: #cffafe;

  /* Neutral */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-600: #4b5563;
  --color-neutral-900: #111827;
}
```

- [ ] Create file
- [ ] Add all color tokens

### 2. Update App.css

**File: `C:\Users\micro\Documents\dev\respira-web\src\App.css`**

```css
@import "tailwindcss";
@import "./styles/design-tokens.css";

/* Custom animations for shimmer effect */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

- [ ] Import design tokens
- [ ] Verify shimmer animation exists

---

## Component Updates

### App.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\App.tsx`**

#### Changes:
1. Header background gradient
2. Grid gap spacing
3. Error message styling

**Line 90 - Header gradient:**
```tsx
// BEFORE
<header className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 shadow-lg">

// AFTER
<header className="bg-gradient-to-r from-primary to-primary-dark px-8 py-3 shadow-lg">
```

**Line 111-118 - Error messages:**
```tsx
// BEFORE
<div className="bg-red-100 text-red-900 px-6 py-4 rounded-lg border-l-4 border-red-600 mb-6 shadow-md">

// AFTER
<div className="bg-danger-bg text-red-900 px-6 py-4 rounded-lg border-l-4 border-danger mb-6 shadow-md">
  <strong>Error:</strong> {machine.error}
</div>
```

**Line 120-123 - Info message:**
```tsx
// BEFORE
<div className="bg-blue-100 text-blue-900 px-6 py-4 rounded-lg border-l-4 border-blue-600 mb-6 shadow-md">

// AFTER
<div className="bg-info-bg text-cyan-900 px-6 py-4 rounded-lg border-l-4 border-info mb-6 shadow-md">
  Initializing Python environment...
</div>
```

**Line 126 - Grid gap:**
```tsx
// BEFORE
<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

// AFTER
<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
```

- [ ] Update header background
- [ ] Update error styling
- [ ] Update info message styling
- [ ] Increase grid gap
- [ ] Test responsive layout

---

### WorkflowStepper.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\components\WorkflowStepper.tsx`**

#### Changes:
1. Progress line thickness
2. Step circle size
3. Text size and contrast
4. Semantic colors

**Line 64-73 - Progress lines:**
```tsx
// BEFORE
<div className="absolute top-4 left-0 right-0 h-0.5 bg-blue-400/30" ... />
<div className="absolute top-4 left-0 h-0.5 bg-blue-100 ..." ... />

// AFTER
<div className="absolute top-5 left-0 right-0 h-1 bg-blue-900/20" style={{ left: '20px', right: '20px' }} />
<div className="absolute top-5 left-0 h-1 bg-blue-100 transition-all duration-500"
  style={{
    left: '20px',
    width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 20px)`
  }}
/>
```

**Line 85-98 - Step circles:**
```tsx
// BEFORE
<div className={`
  w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2
  ${isComplete ? 'bg-green-500 border-green-500 text-white' : ''}
  ${isCurrent ? 'bg-blue-600 border-blue-600 text-white scale-110' : ''}
  ${isUpcoming ? 'bg-blue-700 border-blue-400/30 text-blue-200' : ''}
`}>

// AFTER
<div className={`
  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
  ${isComplete ? 'bg-success border-success text-white' : ''}
  ${isCurrent ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' : ''}
  ${isUpcoming ? 'bg-blue-700 border-blue-400/30 text-blue-100' : ''}
`}>
  {isComplete ? (
    <CheckCircleIcon className="w-6 h-6" />  {/* was w-5 h-5 */}
  ) : (
    step.id
  )}
</div>
```

**Line 101-105 - Step labels:**
```tsx
// BEFORE
<div className={`text-xs font-semibold ${isCurrent ? 'text-white' : isComplete ? 'text-blue-100' : 'text-blue-300'}`}>

// AFTER
<div className={`text-sm font-bold tracking-wide ${isCurrent ? 'text-white' : isComplete ? 'text-blue-50' : 'text-blue-200'}`}>
  {step.label}
</div>
```

- [ ] Update progress line (h-1, top-5)
- [ ] Increase circle size (w-10 h-10)
- [ ] Use semantic colors (success, primary)
- [ ] Increase text size (text-sm)
- [ ] Improve contrast (blue-100 vs blue-300)
- [ ] Add shadow to current step
- [ ] Enlarge check icon

---

### MachineConnection.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\components\MachineConnection.tsx`**

#### Changes:
1. Button styling (Connect, Disconnect)
2. Status badge border
3. Auto-refresh indicator
4. Error/info boxes
5. Semantic colors

**Line 78-81 - Connect button:**
```tsx
// BEFORE
<button onClick={onConnect} className="px-6 py-3 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale-[0.3] cursor-pointer">

// AFTER
<button onClick={onConnect} className="
  px-6 py-3
  bg-primary text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-primary-light hover:shadow-md hover:scale-[1.02]
  active:bg-primary-dark active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none
  transition-all duration-150 ease-in-out
  cursor-pointer
" aria-label="Connect to Brother embroidery machine via Bluetooth">
  Connect to Machine
</button>
```

**Line 68-73 - Auto-refresh indicator:**
```tsx
// BEFORE
<span className="flex items-center gap-2 text-xs text-gray-500">
  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
  Auto-refreshing
</span>

// AFTER
<span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-xs font-medium text-blue-700 border border-blue-200">
  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
  Auto-refreshing
</span>
```

**Line 116-120 - Status badge:**
```tsx
// BEFORE
<span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${statusBadgeColors[stateVisual.color]}`}>

// AFTER
<span className={`
  inline-flex items-center gap-2
  px-3.5 py-2
  rounded-lg
  font-semibold text-sm
  border border-current/20
  ${statusBadgeColors[stateVisual.color]}
`}>
  <span className="text-base leading-none">{stateVisual.icon}</span>
  <span>{machineStatusName}</span>
</span>
```

**Line 141-144 - Disconnect button:**
```tsx
// BEFORE
<button onClick={handleDisconnectClick} className="w-full px-6 py-3 bg-red-600 text-white rounded font-semibold text-sm hover:bg-red-700 transition-all hover:shadow-md cursor-pointer">

// AFTER
<button onClick={handleDisconnectClick} className="
  w-full px-6 py-3
  bg-danger text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-red-700 hover:shadow-md hover:scale-[1.02]
  active:bg-red-800 active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2
  transition-all duration-150
  cursor-pointer
">
  Disconnect
</button>
```

**Line 88-95 - Informational message:**
```tsx
// BEFORE
<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">

// AFTER
<div className="mb-4 p-4 bg-info-bg border border-cyan-200 rounded-lg">
```

- [ ] Update Connect button (primary colors, states)
- [ ] Update Disconnect button (danger color, states)
- [ ] Add border to status badge
- [ ] Enhance auto-refresh indicator
- [ ] Use semantic colors throughout
- [ ] Add ARIA labels
- [ ] Remove grayscale filters

---

### FileUpload.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\components\FileUpload.tsx`**

#### Changes:
1. Choose File button styling
2. Upload button styling
3. Pattern information grid
4. Progress bar

**Line 106-108 - Choose File label:**
```tsx
// BEFORE
<label htmlFor="file-input" className={`inline-block px-6 py-3 bg-gray-600 text-white rounded font-semibold text-sm transition-all ${!pyodideReady || isLoading || patternUploaded ? 'opacity-50 cursor-not-allowed grayscale-[0.3]' : 'cursor-pointer hover:bg-gray-700 hover:shadow-md'}`}>

// AFTER
<label htmlFor="file-input" className={`
  inline-block px-6 py-3
  ${!pyodideReady || isLoading || patternUploaded ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary-light hover:shadow-md cursor-pointer'}
  rounded-lg font-semibold text-sm
  shadow-sm
  transition-all duration-150
`}>
  {isLoading ? 'Loading...' : !pyodideReady ? 'Initializing...' : patternUploaded ? 'Pattern Locked' : 'Choose PES File'}
</label>
```

**Line 113-133 - Pattern information (replace with grid):**
```tsx
// BEFORE
<div className="bg-gray-50 p-4 rounded-lg space-y-3">
  <div className="flex justify-between">
    <span className="font-medium text-gray-700">File Name:</span>
    <span className="font-semibold text-gray-900">{displayFileName}</span>
  </div>
  {/* ... more rows ... */}
</div>

// AFTER
<div className="grid grid-cols-2 gap-3">
  <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
    <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">File Name</div>
    <div className="font-semibold text-sm text-neutral-900 truncate" title={displayFileName}>
      {displayFileName}
    </div>
  </div>
  <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
    <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Pattern Size</div>
    <div className="font-semibold text-sm text-neutral-900">
      {((pesData.bounds.maxX - pesData.bounds.minX) / 10).toFixed(1)} x{' '}
      {((pesData.bounds.maxY - pesData.bounds.minY) / 10).toFixed(1)} mm
    </div>
  </div>
  <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
    <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Thread Colors</div>
    <div className="font-semibold text-sm text-neutral-900">{pesData.colorCount}</div>
  </div>
  <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
    <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Total Stitches</div>
    <div className="font-semibold text-sm text-neutral-900">{pesData.stitchCount.toLocaleString()}</div>
  </div>
</div>
```

**Line 138-146 - Upload button:**
```tsx
// BEFORE
<button onClick={handleUpload} disabled={!isConnected || uploadProgress > 0} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale-[0.3] cursor-pointer">

// AFTER
<button onClick={handleUpload} disabled={!isConnected || uploadProgress > 0} className="
  mt-4 px-6 py-3
  bg-primary text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-primary-light hover:shadow-md
  active:bg-primary-dark active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none
  transition-all duration-150
  cursor-pointer
">
  {uploadProgress > 0 ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload to Machine'}
</button>
```

**Line 155-161 - Progress bar:**
```tsx
// BEFORE
<div className="h-3 bg-gray-300 rounded-md overflow-hidden my-4 shadow-inner">
  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-700 ..." style={{ width: `${uploadProgress}%` }} />
</div>

// AFTER
<div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden my-4 shadow-inner">
  <div
    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300 ease-out relative overflow-hidden"
    style={{ width: `${uploadProgress}%` }}
    role="progressbar"
    aria-valuenow={uploadProgress}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Upload progress"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
  </div>
</div>
```

- [ ] Update Choose File button
- [ ] Replace pattern info with grid layout
- [ ] Update Upload button
- [ ] Enhance progress bar
- [ ] Use semantic colors
- [ ] Add ARIA attributes
- [ ] Remove grayscale filter

---

### ProgressMonitor.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\components\ProgressMonitor.tsx`**

#### Changes:
1. Grid gap
2. Color block design
3. Button styling
4. Progress bar
5. Semantic colors

**Line 116 - Grid gap:**
```tsx
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// AFTER
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

**Line 143 - Color block container gap:**
```tsx
// BEFORE
<div className="flex flex-col gap-2">

// AFTER
<div className="flex flex-col gap-3">
```

**Line 157-191 - Color blocks (major update):**
```tsx
// BEFORE
<div className={`p-2 rounded bg-gray-100 border-2 border-transparent transition-all ${
  isCompleted ? 'border-green-600 bg-green-50' : isCurrent ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-600/20' : 'opacity-60'
}`}>

// AFTER
<div className={`
  p-3 rounded-lg border-2 transition-all duration-200
  ${isCompleted ? 'border-success bg-success-bg/50 shadow-sm' : ''}
  ${isCurrent ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/20 scale-[1.02]' : ''}
  ${!isCompleted && !isCurrent ? 'border-neutral-200 bg-neutral-50 opacity-70' : ''}
`}>
  <div className="flex items-center gap-3">
    <div
      className="w-6 h-6 rounded-md border-2 border-white shadow-md ring-1 ring-neutral-300 flex-shrink-0"
      style={{ backgroundColor: block.threadHex }}
      aria-label={`Thread color ${block.threadHex}`}
    />
    <span className="font-semibold text-sm flex-1">
      Thread {block.colorIndex + 1}
    </span>
    {isCompleted && <CheckCircleIcon className="w-5 h-5 text-success" aria-label="Completed" />}
    {isCurrent && <ArrowRightIcon className="w-5 h-5 text-primary" aria-label="Current thread" />}
    {!isCompleted && !isCurrent && <CircleStackIcon className="w-5 h-5 text-neutral-400" aria-label="Upcoming" />}
    <span className="text-sm text-neutral-600 font-medium">
      {block.stitchCount.toLocaleString()}
    </span>
  </div>
  {isCurrent && (
    <div className="mt-2.5 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${blockProgress}%` }}
        role="progressbar"
        aria-valuenow={blockProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )}
</div>
```

**Line 207-209 - Sewing progress bar:**
```tsx
// BEFORE
<div className="h-3 bg-gray-300 rounded-md overflow-hidden shadow-inner relative mb-2">
  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-700 ..." />
</div>

// AFTER
<div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden shadow-inner mb-2">
  <div
    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300 ease-out relative overflow-hidden"
    style={{ width: `${progressPercent}%` }}
    role="progressbar"
    aria-valuenow={progressPercent}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Sewing progress"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
  </div>
</div>
```

**Line 256-259 - Resume button:**
```tsx
// BEFORE
<button onClick={onResumeSewing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition-all hover:shadow-md cursor-pointer">

// AFTER
<button onClick={onResumeSewing} className="
  flex items-center gap-2
  px-4 py-2
  bg-primary text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-primary-light hover:shadow-md
  active:bg-primary-dark active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  transition-all duration-150
  cursor-pointer
">
  <PlayIcon className="w-4 h-4" />
  Resume Sewing
</button>
```

**Line 264-267 - Start Sewing button:**
```tsx
// Similar update as Resume button
```

**Line 271-274 - Start Mask Trace button:**
```tsx
// BEFORE
<button onClick={onStartMaskTrace} className="px-4 py-2 bg-gray-600 text-white rounded font-semibold text-sm hover:bg-gray-700 ...">

// AFTER
<button onClick={onStartMaskTrace} className="
  px-4 py-2
  bg-secondary text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-secondary-light hover:shadow-md
  active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
  transition-all duration-150
  cursor-pointer
">
  {isMaskTraceComplete ? 'Trace Again' : 'Start Mask Trace'}
</button>
```

**Line 278-281 - Delete button:**
```tsx
// BEFORE
<button onClick={onDeletePattern} className="px-4 py-2 bg-red-600 text-white rounded font-semibold text-sm hover:bg-red-700 ...">

// AFTER
<button onClick={onDeletePattern} className="
  px-4 py-2
  bg-danger text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-red-700 hover:shadow-md
  active:bg-red-800 active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2
  transition-all duration-150
  ml-auto
  cursor-pointer
">
  Delete Pattern
</button>
```

- [ ] Increase grid gap
- [ ] Update color block design (larger swatches, better states)
- [ ] Add ARIA labels to color blocks
- [ ] Enhance progress bar with shimmer
- [ ] Update all button styles
- [ ] Use semantic colors
- [ ] Remove grayscale filters

---

### PatternCanvas.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\components\PatternCanvas.tsx`**

#### Changes:
1. Overlay styling unification
2. Zoom button sizing
3. Thread legend improvement

**Line 270-281 - Thread Legend:**
```tsx
// BEFORE
<div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10 max-w-[150px]">
  <h4 className="m-0 mb-2 text-[13px] font-semibold text-gray-900 border-b border-gray-300 pb-1.5">Threads</h4>

// AFTER
<div className="absolute top-3 left-3 bg-white/98 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-neutral-200 z-10 max-w-[180px]">
  <h4 className="text-sm font-bold text-neutral-900 mb-3">Threads</h4>
  {pesData.threads.map((thread, index) => (
    <div key={index} className="flex items-center gap-2.5 mb-2 last:mb-0">
      <div
        className="w-6 h-6 rounded-md border-2 border-white shadow-md ring-1 ring-neutral-300 flex-shrink-0"
        style={{ backgroundColor: thread.hex }}
      />
      <span className="text-sm text-neutral-900 font-medium">Thread {index + 1}</span>
    </div>
  ))}
</div>
```

**Line 284-287 - Pattern Dimensions:**
```tsx
// BEFORE
<div className="absolute bottom-[165px] right-5 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-[11] ...">

// AFTER
<div className="absolute bottom-[165px] right-5 bg-white/98 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-neutral-200 z-[11] ...">
```

**Line 290-298 - Pattern Offset:**
```tsx
// BEFORE
<div className="absolute bottom-20 right-5 bg-white/95 backdrop-blur-sm p-2.5 px-3.5 rounded-lg shadow-lg z-[11] ...">

// AFTER
<div className="absolute bottom-20 right-5 bg-white/98 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-neutral-200 z-[11] ...">
```

**Line 301-311 - Zoom Controls:**
```tsx
// BEFORE
<div className="absolute bottom-5 right-5 flex gap-2 items-center bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg z-10">
  <button className="w-8 h-8 p-1 border border-gray-300 bg-white rounded ...">

// AFTER
<div className="absolute bottom-5 right-5 flex items-center gap-1 bg-white/98 backdrop-blur-sm px-2 py-2 rounded-xl shadow-lg border border-neutral-200 z-10">
  <button className="
    w-10 h-10
    flex items-center justify-center
    bg-white border border-neutral-300
    rounded-lg
    text-neutral-700
    hover:bg-primary hover:text-white hover:border-primary
    active:bg-primary-dark active:scale-95
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    transition-all duration-150
    cursor-pointer
  " onClick={handleZoomIn} aria-label="Zoom in on pattern preview" title="Zoom In">
    <PlusIcon className="w-5 h-5" />
  </button>
  <div className="w-px h-6 bg-neutral-200 mx-1"></div>
  <span className="px-3 text-sm font-semibold text-neutral-900 select-none">{Math.round(stageScale * 100)}%</span>
  <div className="w-px h-6 bg-neutral-200 mx-1"></div>
  <button ... aria-label="Zoom out from pattern preview" title="Zoom Out">
    <MinusIcon className="w-5 h-5" />
  </button>
  <button ... aria-label="Reset zoom to fit pattern" title="Reset Zoom">
    <ArrowPathIcon className="w-5 h-5" />
  </button>
</div>
```

- [ ] Update all overlays (rounded-xl, border)
- [ ] Increase zoom button size (w-10 h-10)
- [ ] Add separators between zoom controls
- [ ] Larger thread swatches (w-6 h-6)
- [ ] Add ARIA labels to buttons
- [ ] Use semantic colors
- [ ] Improve contrast

---

### NextStepGuide.tsx

**File: `C:\Users\micro\Documents\dev\respira-web\src\components\NextStepGuide.tsx`**

#### Changes:
1. Icon size
2. Semantic colors
3. Border styling

**Line 31-53 - Informational messages:**
```tsx
// BEFORE
<div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg shadow-md">
  <div className="flex items-start gap-4">
    <InformationCircleIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />

// AFTER
<div className="bg-info-bg border-l-4 border-info p-6 rounded-lg shadow-md">
  <div className="flex items-start gap-4">
    <InformationCircleIcon className="w-10 h-10 text-info flex-shrink-0 mt-1" />
```

**Line 59-87 - Error messages:**
```tsx
// BEFORE
<div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg shadow-md">
  <div className="flex items-start gap-4">
    <ExclamationTriangleIcon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />

// AFTER
<div className="bg-danger-bg border-l-4 border-danger p-6 rounded-lg shadow-md">
  <div className="flex items-start gap-4">
    <ExclamationTriangleIcon className="w-10 h-10 text-danger flex-shrink-0 mt-1" />
```

**Apply similar changes to all state messages (lines 92-299)**

- [ ] Increase icon size (w-10 h-10)
- [ ] Use semantic colors (info, danger, warning, success)
- [ ] Ensure consistent styling across all states
- [ ] Verify border colors match semantic tokens

---

## Testing Checklist

After completing all component updates, test:

### Visual Tests
- [ ] All buttons have consistent rounded-lg corners
- [ ] All buttons show hover state (color change, shadow)
- [ ] All buttons show active state (scale down)
- [ ] Disabled buttons are gray, not grayscale filtered
- [ ] Colors are consistent (no stray blue-600/700)
- [ ] Spacing looks balanced
- [ ] Section headers stand out clearly

### Interaction Tests
- [ ] Tab through interface - all interactive elements show focus ring
- [ ] Click buttons - feel responsive with scale feedback
- [ ] Hover buttons - smooth color transitions
- [ ] Touch on mobile - 44px touch targets work well
- [ ] Zoom controls - easy to tap, clear feedback

### Accessibility Tests
- [ ] Screen reader announces progress bars correctly
- [ ] Button ARIA labels are present and clear
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Focus states visible on all elements
- [ ] Status conveyed by more than color alone

### Responsive Tests
- [ ] Mobile: Single column layout works
- [ ] Tablet: Grid layout switches correctly
- [ ] Desktop: Full two-column layout
- [ ] WorkflowStepper readable on all sizes
- [ ] Color blocks scroll on mobile

### State Tests
- [ ] Not connected: NextStepGuide shows step 1
- [ ] Connected: Components appear correctly
- [ ] Pattern loaded: Preview displays
- [ ] Uploading: Progress bar animates with shimmer
- [ ] Sewing: Color blocks highlight correctly
- [ ] Complete: Success states show green

---

## Estimated Time per Component

| Component | Time | Complexity |
|-----------|------|------------|
| Setup (tokens) | 10 min | Low |
| App.tsx | 10 min | Low |
| WorkflowStepper | 15 min | Medium |
| MachineConnection | 20 min | Medium |
| FileUpload | 25 min | High |
| ProgressMonitor | 35 min | High |
| PatternCanvas | 20 min | Medium |
| NextStepGuide | 15 min | Low |
| **Total** | **~2.5 hours** | |

---

## Quick Win Order

If you have limited time, implement in this order for maximum impact:

1. **Setup + App.tsx** (20 min) - Foundation
2. **MachineConnection buttons** (10 min) - Most visible
3. **ProgressMonitor color blocks** (20 min) - High impact
4. **WorkflowStepper** (15 min) - Always visible when connected
5. **FileUpload pattern grid** (15 min) - Clear improvement
6. **PatternCanvas zoom controls** (10 min) - Frequently used
7. **All other buttons** (15 min) - Consistency
8. **Polish and test** (20 min) - Final touches

**1.5 hour version**: Do steps 1-4
**2 hour version**: Do steps 1-6
**Full version**: All steps

---

## Common Pitfalls to Avoid

1. **Don't mix old and new colors** - Replace all instances at once per component
2. **Don't forget ARIA labels** - Add to all icon buttons
3. **Don't skip focus states** - Critical for accessibility
4. **Don't use grayscale filter** - Use neutral-300 background instead
5. **Don't make text too small** - Minimum 12px (text-xs)
6. **Don't forget active states** - Add scale-[0.98] to buttons
7. **Don't skip testing** - Test all states before moving to next component

---

## Success Criteria

You'll know the update is successful when:

- [ ] No blue-600/700 classes remain (except as fallbacks)
- [ ] No grayscale filters on disabled buttons
- [ ] All buttons have focus:ring-2
- [ ] All progress bars have shimmer effect
- [ ] Color blocks visually distinct (completed/current/upcoming)
- [ ] Touch targets minimum 44px
- [ ] Consistent rounded-lg on all buttons
- [ ] Semantic color tokens used throughout
- [ ] ARIA labels on all icon buttons
- [ ] Interface feels more polished and professional

---

Good luck with the implementation! Refer to `UI_DESIGN_ANALYSIS.md` for detailed rationale and `QUICK_UI_IMPROVEMENTS.md` for condensed code snippets.
