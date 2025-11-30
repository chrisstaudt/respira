import type {
  MachineInfo,
  PatternInfo,
  SewingProgress,
} from "../types/machine";
import { MachineStatus } from "../types/machine";

// BLE Service and Characteristic UUIDs
const SERVICE_UUID = "a76eb9e0-f3ac-4990-84cf-3a94d2426b2b";
const WRITE_CHAR_UUID = "a76eb9e2-f3ac-4990-84cf-3a94d2426b2b";
const READ_CHAR_UUID = "a76eb9e1-f3ac-4990-84cf-3a94d2426b2b";

// Command IDs (big-endian)
const Commands = {
  MACHINE_INFO: 0x0000,
  MACHINE_STATE: 0x0001,
  SERVICE_COUNT: 0x0100,
  PATTERN_UUID_REQUEST: 0x0702,
  MASK_TRACE: 0x0704,
  LAYOUT_SEND: 0x0705,
  EMB_SEWING_INFO_REQUEST: 0x0706,
  PATTERN_SEWING_INFO: 0x0707,
  EMB_SEWING_DATA_DELETE: 0x0708,
  NEEDLE_MODE_INSTRUCTIONS: 0x0709,
  EMB_UUID_SEND: 0x070a,
  RESUME_FLAG_REQUEST: 0x070b,
  RESUME: 0x070c,
  START_SEWING: 0x070e,
  MASK_TRACE_1: 0x0710,
  EMB_ORG_POINT: 0x0800,
  MACHINE_SETTING_INFO: 0x0c02,
  SEND_DATA_INFO: 0x1200,
  SEND_DATA: 0x1201,
  CLEAR_ERROR: 0x1300,
};

export class BrotherPP1Service {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private readCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private commandQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  async connect(): Promise<void> {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
    });

    if (!this.device.gatt) {
      throw new Error("GATT not available");
    }
    console.log("Connecting");
    this.server = await this.device.gatt.connect();
    console.log("Connected");
    const service = await this.server.getPrimaryService(SERVICE_UUID);
    console.log("Got primary service");

    this.writeCharacteristic = await service.getCharacteristic(WRITE_CHAR_UUID);
    this.readCharacteristic = await service.getCharacteristic(READ_CHAR_UUID);

    console.log("Connected to Brother PP1 machine");

    console.log("Send dummy command");
    try {
      await this.getMachineInfo();
      console.log("Dummy command success");
    } catch (e) {
      console.log(e);
    }
  }

  async disconnect(): Promise<void> {
    // Clear any pending commands
    this.commandQueue = [];
    this.isProcessingQueue = false;

    if (this.server) {
      this.server.disconnect();
    }
    this.device = null;
    this.server = null;
    this.writeCharacteristic = null;
    this.readCharacteristic = null;
  }

  isConnected(): boolean {
    return this.server?.connected ?? false;
  }

  /**
   * Process the command queue sequentially
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        try {
          await command();
        } catch (err) {
          console.error("Command queue error:", err);
          // Continue processing queue even if one command fails
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Enqueue a Bluetooth command to be executed sequentially
   */
  private async enqueueCommand<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.commandQueue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });

      // Start processing the queue
      this.processQueue();
    });
  }

  private async sendCommand(
    cmdId: number,
    data: Uint8Array = new Uint8Array(),
  ): Promise<Uint8Array> {
    // Enqueue the command to ensure sequential execution
    return this.enqueueCommand(async () => {
      if (!this.writeCharacteristic || !this.readCharacteristic) {
        throw new Error("Not connected");
      }

      // Build command with big-endian command ID
      const command = new Uint8Array(2 + data.length);
      command[0] = (cmdId >> 8) & 0xff; // High byte
      command[1] = cmdId & 0xff; // Low byte
      command.set(data, 2);

      console.log(
        "Sending command:",
        Array.from(command)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
      );
      console.log("Sending command");
      // Write command and immediately read response
      await this.writeCharacteristic.writeValueWithoutResponse(command);

      console.log("delay");
      // Small delay to ensure response is ready
      await new Promise((resolve) => setTimeout(resolve, 50));
      console.log("reading response");

      const responseData = await this.readCharacteristic.readValue();
      const response = new Uint8Array(responseData.buffer);

      console.log(
        "Received response:",
        Array.from(response)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
      );

      return response;
    });
  }

  async getMachineInfo(): Promise<MachineInfo> {
    const response = await this.sendCommand(Commands.MACHINE_INFO);

    // Skip 2-byte command header
    const data = response.slice(2);

    const decoder = new TextDecoder("ascii");
    const serialNumber = decoder.decode(data.slice(2, 11)).replace(/\0/g, "");
    const modelCode = decoder.decode(data.slice(39, 50)).replace(/\0/g, "");

    // Software version (big-endian int16)
    const swVersion = (data[0] << 8) | data[1];

    // BT version (big-endian int16)
    const btVersion = (data[24] << 8) | data[25];

    // Max dimensions (little-endian int16)
    const maxWidth = data[29] | (data[30] << 8);
    const maxHeight = data[31] | (data[32] << 8);

    // MAC address
    const macAddress = Array.from(data.slice(16, 22))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(":")
      .toUpperCase();

    return {
      serialNumber,
      modelNumber: modelCode,
      softwareVersion: `${(swVersion / 100).toFixed(2)}.${data[35]}`,
      bluetoothVersion: btVersion,
      maxWidth,
      maxHeight,
      macAddress,
    };
  }

  async getMachineState(): Promise<{ status: MachineStatus; error: number }> {
    const response = await this.sendCommand(Commands.MACHINE_STATE);

    return {
      status: response[2] as MachineStatus,
      error: response[4],
    };
  }

  async getPatternInfo(): Promise<PatternInfo> {
    const response = await this.sendCommand(Commands.EMB_SEWING_INFO_REQUEST);
    const data = response.slice(2);

    const readInt16LE = (offset: number) =>
      data[offset] | (data[offset + 1] << 8);
    const readUInt16LE = (offset: number) =>
      data[offset] | (data[offset + 1] << 8);

    return {
      boundLeft: readInt16LE(0),
      boundTop: readInt16LE(2),
      boundRight: readInt16LE(4),
      boundBottom: readInt16LE(6),
      totalTime: readUInt16LE(8),
      totalStitches: readUInt16LE(10),
      speed: readUInt16LE(12),
    };
  }

  async getSewingProgress(): Promise<SewingProgress> {
    const response = await this.sendCommand(Commands.PATTERN_SEWING_INFO);
    const data = response.slice(2);

    const readInt16LE = (offset: number) => {
      const value = data[offset] | (data[offset + 1] << 8);
      // Convert to signed 16-bit integer
      return value > 0x7fff ? value - 0x10000 : value;
    };
    const readUInt16LE = (offset: number) =>
      data[offset] | (data[offset + 1] << 8);

    return {
      currentStitch: readUInt16LE(0),
      currentTime: readInt16LE(2),
      stopTime: readInt16LE(4),
      positionX: readInt16LE(6),
      positionY: readInt16LE(8),
    };
  }

  async deletePattern(): Promise<void> {
    await this.sendCommand(Commands.EMB_SEWING_DATA_DELETE);
  }

  async sendDataInfo(length: number, checksum: number): Promise<void> {
    const payload = new Uint8Array(7);
    payload[0] = 0x03; // Type

    // Length (little-endian uint32)
    payload[1] = length & 0xff;
    payload[2] = (length >> 8) & 0xff;
    payload[3] = (length >> 16) & 0xff;
    payload[4] = (length >> 24) & 0xff;

    // Checksum (little-endian uint16)
    payload[5] = checksum & 0xff;
    payload[6] = (checksum >> 8) & 0xff;

    const response = await this.sendCommand(Commands.SEND_DATA_INFO, payload);

    if (response[2] !== 0x00) {
      throw new Error("Data info rejected");
    }
  }

  async sendDataChunk(offset: number, data: Uint8Array): Promise<boolean> {
    const checksum = data.reduce((sum, byte) => (sum + byte) & 0xff, 0);

    const payload = new Uint8Array(4 + data.length + 1);

    // Offset (little-endian uint32)
    payload[0] = offset & 0xff;
    payload[1] = (offset >> 8) & 0xff;
    payload[2] = (offset >> 16) & 0xff;
    payload[3] = (offset >> 24) & 0xff;

    payload.set(data, 4);
    payload[4 + data.length] = checksum;

    const response = await this.sendCommand(Commands.SEND_DATA, payload);

    // 0x00 = complete, 0x02 = continue
    return response[2] === 0x00;
  }

  async sendUUID(uuid: Uint8Array): Promise<void> {
    const response = await this.sendCommand(Commands.EMB_UUID_SEND, uuid);

    if (response[2] !== 0x00) {
      throw new Error("UUID rejected");
    }
  }

  async sendLayout(
    moveX: number,
    moveY: number,
    sizeX: number,
    sizeY: number,
    rotate: number,
    flip: number,
    frame: number,
  ): Promise<void> {
    const payload = new Uint8Array(12);

    const writeInt16LE = (offset: number, value: number) => {
      payload[offset] = value & 0xff;
      payload[offset + 1] = (value >> 8) & 0xff;
    };

    writeInt16LE(0, moveX);
    writeInt16LE(2, moveY);
    writeInt16LE(4, sizeX);
    writeInt16LE(6, sizeY);
    writeInt16LE(8, rotate);
    payload[10] = flip;
    payload[11] = frame;

    await this.sendCommand(Commands.LAYOUT_SEND, payload);
  }

  async startMaskTrace(): Promise<void> {
    const payload = new Uint8Array([0x01]);
    await this.sendCommand(Commands.MASK_TRACE, payload);
  }

  async startSewing(): Promise<void> {
    await this.sendCommand(Commands.START_SEWING);
  }

  async resumeSewing(): Promise<void> {
    // Resume uses the same START_SEWING command as initial start
    // The machine tracks current position and resumes from there
    await this.sendCommand(Commands.START_SEWING);
  }

  async uploadPattern(
    data: Uint8Array,
    onProgress?: (progress: number) => void,
  ): Promise<Uint8Array> {
    // Calculate checksum
    const checksum = data.reduce((sum, byte) => sum + byte, 0) & 0xffff;

    // Delete existing pattern
    await this.deletePattern();

    // Send data info
    await this.sendDataInfo(data.length, checksum);

    // Send data in chunks (max chunk size ~500 bytes to be safe with BLE MTU)
    const chunkSize = 500;
    let offset = 0;

    while (offset < data.length) {
      const chunk = data.slice(
        offset,
        Math.min(offset + chunkSize, data.length),
      );
      const isComplete = await this.sendDataChunk(offset, chunk);

      offset += chunk.length;

      if (onProgress) {
        onProgress((offset / data.length) * 100);
      }

      if (isComplete) {
        break;
      }

      // Small delay between chunks
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Generate random UUID
    const uuid = crypto.getRandomValues(new Uint8Array(16));
    await this.sendUUID(uuid);

    // Send default layout (no transformation)
    await this.sendLayout(0, 0, 0, 0, 0, 0, 0);

    console.log(
      "Pattern uploaded successfully with UUID:",
      Array.from(uuid)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );

    // Return UUID for caching
    return uuid;
  }

  /**
   * Request the UUID of the pattern currently loaded on the machine
   */
  async getPatternUUID(): Promise<Uint8Array | null> {
    try {
      const response = await this.sendCommand(Commands.PATTERN_UUID_REQUEST);

      // Response format: [cmd_high, cmd_low, uuid_bytes...]
      // UUID starts at index 2 (16 bytes)
      if (response.length < 18) {
        // Not enough data for UUID
        console.log(
          "[BrotherPP1] Response too short for UUID:",
          response.length,
        );
        return null;
      }

      // Extract UUID (16 bytes starting at index 2)
      const uuid = response.slice(2, 18);

      // Check if UUID is all zeros (no pattern loaded)
      const allZeros = uuid.every((byte) => byte === 0);
      if (allZeros) {
        console.log("[BrotherPP1] UUID is all zeros, no pattern loaded");
        return null;
      }

      return uuid;
    } catch (err) {
      console.error("[BrotherPP1] Failed to get pattern UUID:", err);
      return null;
    }
  }
}
