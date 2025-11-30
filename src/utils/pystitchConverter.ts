import { pyodideLoader } from './pyodideLoader';

// PEN format flags
const PEN_FEED_DATA = 0x01; // Y-coordinate low byte, bit 0 (jump)
const PEN_COLOR_END = 0x03; // X-coordinate low byte, bits 0-2
const PEN_DATA_END = 0x05;  // X-coordinate low byte, bits 0-2

// Embroidery command constants (from pyembroidery)
const MOVE = 0x10;
const COLOR_CHANGE = 0x40;
const STOP = 0x80;
const END = 0x100;

export interface PesPatternData {
  stitches: number[][];
  threads: Array<{
    color: number;
    hex: string;
  }>;
  penData: Uint8Array;
  colorCount: number;
  stitchCount: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Reads a PES file using PyStitch and converts it to PEN format
 */
export async function convertPesToPen(file: File): Promise<PesPatternData> {
  // Ensure Pyodide is initialized
  const pyodide = await pyodideLoader.initialize();

  // Read the PES file
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  // Write file to Pyodide virtual filesystem
  const filename = '/tmp/pattern.pes';
  pyodide.FS.writeFile(filename, uint8Array);

  // Read the pattern using PyStitch
  const result = await pyodide.runPythonAsync(`
import pystitch

# Read the PES file
pattern = pystitch.read('${filename}')

# PyStitch groups stitches by color blocks using get_as_stitchblock
# This returns tuples of (thread, stitches_list) for each color block
stitches_with_colors = []
block_index = 0

# Iterate through stitch blocks
# Each block is a tuple containing (thread, stitch_list)
for block in pattern.get_as_stitchblock():
    if isinstance(block, tuple):
        # Extract thread and stitch list from tuple
        thread_obj = None
        stitches_list = None

        for elem in block:
            # Check if this is the thread object (has color or hex_color attributes)
            if hasattr(elem, 'color') or hasattr(elem, 'hex_color'):
                thread_obj = elem
            # Check if this is the stitch list
            elif isinstance(elem, list) and len(elem) > 0 and isinstance(elem[0], list):
                stitches_list = elem

        if stitches_list:
            # Find the index of this thread in the threadlist
            thread_index = block_index
            if thread_obj and hasattr(pattern, 'threadlist'):
                for i, t in enumerate(pattern.threadlist):
                    if t is thread_obj:
                        thread_index = i
                        break

            for stitch in stitches_list:
                # stitch is [x, y, command]
                stitches_with_colors.append([stitch[0], stitch[1], stitch[2], thread_index])

            block_index += 1

# Convert to JSON-serializable format
{
    'stitches': stitches_with_colors,
    'threads': [
        {
            'color': thread.color if hasattr(thread, 'color') else 0,
            'hex': thread.hex_color() if hasattr(thread, 'hex_color') else '#000000'
        }
        for thread in pattern.threadlist
    ],
    'thread_count': len(pattern.threadlist),
    'stitch_count': len(stitches_with_colors),
    'block_count': block_index
}
  `);

  // Convert Python result to JavaScript
  const data = result.toJs({ dict_converter: Object.fromEntries });

  // Clean up virtual file
  try {
    pyodide.FS.unlink(filename);
  } catch (e) {
    // Ignore errors
  }

  // Extract stitches and validate
  const stitches: number[][] = Array.from(data.stitches).map((stitch: any) =>
    Array.from(stitch) as number[]
  );

  if (!stitches || stitches.length === 0) {
    throw new Error('Invalid PES file or no stitches found');
  }

  // Extract thread data
  const threads = data.threads.map((thread: any) => ({
    color: thread.color || 0,
    hex: thread.hex || '#000000',
  }));

  // Track bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Convert to PEN format
  const penStitches: number[] = [];
  let currentColor = stitches[0]?.[3] ?? 0; // Track current color using stitch color index

  for (let i = 0; i < stitches.length; i++) {
    const stitch = stitches[i];
    const x = Math.round(stitch[0]);
    const y = Math.round(stitch[1]);
    const cmd = stitch[2];
    const stitchColor = stitch[3]; // Color index from PyStitch

    // Track bounds for non-jump stitches
    if ((cmd & MOVE) === 0) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    // Encode coordinates with flags in low 3 bits
    // Shift coordinates left by 3 bits to make room for flags
    let xEncoded = (x << 3) & 0xFFFF;
    let yEncoded = (y << 3) & 0xFFFF;

    // Add jump flag if this is a move command
    if ((cmd & MOVE) !== 0) {
      yEncoded |= PEN_FEED_DATA;
    }

    // Check for color change by comparing stitch color index
    // Mark the LAST stitch of the previous color with PEN_COLOR_END
    const nextStitch = stitches[i + 1];
    const nextStitchColor = nextStitch?.[3];

    if (nextStitchColor !== undefined && nextStitchColor !== stitchColor) {
      // This is the last stitch before a color change
      xEncoded = (xEncoded & 0xFFF8) | PEN_COLOR_END;
      currentColor = nextStitchColor;
    }

    // Add stitch as 4 bytes: [X_low, X_high, Y_low, Y_high]
    penStitches.push(
      xEncoded & 0xFF,
      (xEncoded >> 8) & 0xFF,
      yEncoded & 0xFF,
      (yEncoded >> 8) & 0xFF
    );

    // Check for end command
    if ((cmd & END) !== 0) {
      // Mark as data end
      const lastIdx = penStitches.length - 4;
      penStitches[lastIdx] = (penStitches[lastIdx] & 0xF8) | PEN_DATA_END;
      break;
    }
  }

  // Mark the last stitch with DATA_END if not already marked
  if (penStitches.length > 0) {
    const lastIdx = penStitches.length - 4;
    if ((penStitches[lastIdx] & 0x07) !== PEN_DATA_END) {
      penStitches[lastIdx] = (penStitches[lastIdx] & 0xF8) | PEN_DATA_END;
    }
  }

  const penData = new Uint8Array(penStitches);

  return {
    stitches,
    threads,
    penData,
    colorCount: data.thread_count,
    stitchCount: data.stitch_count,
    bounds: {
      minX: minX === Infinity ? 0 : minX,
      maxX: maxX === -Infinity ? 0 : maxX,
      minY: minY === Infinity ? 0 : minY,
      maxY: maxY === -Infinity ? 0 : maxY,
    },
  };
}

/**
 * Get thread color from pattern data
 */
export function getThreadColor(data: PesPatternData, colorIndex: number): string {
  if (!data.threads || colorIndex < 0 || colorIndex >= data.threads.length) {
    // Default colors if not specified or index out of bounds
    const defaultColors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
      '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    ];
    const safeIndex = Math.max(0, colorIndex) % defaultColors.length;
    return defaultColors[safeIndex];
  }

  return data.threads[colorIndex]?.hex || '#000000';
}
