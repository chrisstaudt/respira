import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useBluetoothDeviceListener } from "./useBluetoothDeviceListener";
import type { BluetoothDevice } from "../../types/electron";

describe("useBluetoothDeviceListener", () => {
  beforeEach(() => {
    // Reset window.electronAPI before each test
    delete (window as { electronAPI?: unknown }).electronAPI;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return empty state when Electron API is not available", () => {
    const { result } = renderHook(() => useBluetoothDeviceListener());

    expect(result.current.devices).toEqual([]);
    expect(result.current.isScanning).toBe(false);
    expect(result.current.isSupported).toBe(false);
  });

  it("should return isSupported=true when Electron API is available", () => {
    // Mock Electron API
    (
      window as unknown as {
        electronAPI: { onBluetoothDeviceList: () => void };
      }
    ).electronAPI = {
      onBluetoothDeviceList: vi.fn(),
    };

    const { result } = renderHook(() => useBluetoothDeviceListener());

    expect(result.current.isSupported).toBe(true);
  });

  it("should register IPC listener when Electron API is available", () => {
    const mockListener = vi.fn();
    (
      window as unknown as {
        electronAPI: { onBluetoothDeviceList: typeof mockListener };
      }
    ).electronAPI = {
      onBluetoothDeviceList: mockListener,
    };

    renderHook(() => useBluetoothDeviceListener());

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should update devices when listener receives data", async () => {
    let deviceListCallback: ((devices: BluetoothDevice[]) => void) | null =
      null;

    const mockListener = vi.fn(
      (callback: (devices: BluetoothDevice[]) => void) => {
        deviceListCallback = callback;
      },
    );

    (
      window as unknown as {
        electronAPI: { onBluetoothDeviceList: typeof mockListener };
      }
    ).electronAPI = {
      onBluetoothDeviceList: mockListener,
    };

    const { result } = renderHook(() => useBluetoothDeviceListener());

    expect(result.current.devices).toEqual([]);

    // Simulate device list update
    const mockDevices: BluetoothDevice[] = [
      { deviceId: "device1", deviceName: "Device 1" },
      { deviceId: "device2", deviceName: "Device 2" },
    ];

    // Trigger the callback
    act(() => {
      deviceListCallback!(mockDevices);
    });

    await waitFor(() => {
      expect(result.current.devices).toEqual(mockDevices);
    });
  });

  it("should set isScanning=true when empty device list received", async () => {
    let deviceListCallback: ((devices: BluetoothDevice[]) => void) | null =
      null;

    const mockListener = vi.fn(
      (callback: (devices: BluetoothDevice[]) => void) => {
        deviceListCallback = callback;
      },
    );

    (
      window as unknown as {
        electronAPI: { onBluetoothDeviceList: typeof mockListener };
      }
    ).electronAPI = {
      onBluetoothDeviceList: mockListener,
    };

    const { result } = renderHook(() => useBluetoothDeviceListener());

    // Simulate empty device list (scanning in progress)
    act(() => {
      deviceListCallback!([]);
    });

    await waitFor(() => {
      expect(result.current.isScanning).toBe(true);
    });
    expect(result.current.devices).toEqual([]);
  });

  it("should set isScanning=false when devices are received", async () => {
    let deviceListCallback: ((devices: BluetoothDevice[]) => void) | null =
      null;

    const mockListener = vi.fn(
      (callback: (devices: BluetoothDevice[]) => void) => {
        deviceListCallback = callback;
      },
    );

    (
      window as unknown as {
        electronAPI: { onBluetoothDeviceList: typeof mockListener };
      }
    ).electronAPI = {
      onBluetoothDeviceList: mockListener,
    };

    const { result } = renderHook(() => useBluetoothDeviceListener());

    // First update: empty list (scanning)
    act(() => {
      deviceListCallback!([]);
    });
    await waitFor(() => {
      expect(result.current.isScanning).toBe(true);
    });

    // Second update: devices found (stop scanning indicator)
    const mockDevices: BluetoothDevice[] = [
      { deviceId: "device1", deviceName: "Device 1" },
    ];
    act(() => {
      deviceListCallback!(mockDevices);
    });

    await waitFor(() => {
      expect(result.current.isScanning).toBe(false);
    });
    expect(result.current.devices).toEqual(mockDevices);
  });

  it("should call optional callback when devices change", async () => {
    let deviceListCallback: ((devices: BluetoothDevice[]) => void) | null =
      null;

    const mockListener = vi.fn(
      (callback: (devices: BluetoothDevice[]) => void) => {
        deviceListCallback = callback;
      },
    );

    (
      window as unknown as {
        electronAPI: { onBluetoothDeviceList: typeof mockListener };
      }
    ).electronAPI = {
      onBluetoothDeviceList: mockListener,
    };

    const onDevicesChanged = vi.fn();
    renderHook(() => useBluetoothDeviceListener(onDevicesChanged));

    const mockDevices: BluetoothDevice[] = [
      { deviceId: "device1", deviceName: "Device 1" },
    ];

    act(() => {
      deviceListCallback!(mockDevices);
    });

    await waitFor(() => {
      expect(onDevicesChanged).toHaveBeenCalledWith(mockDevices);
    });
  });
});
