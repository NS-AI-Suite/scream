# NORTH SHORE VOICE: Transmission Protocol

**Status**: VANGUARD ACTIVE
**Type**: UDP Multicast Firehose (Configurable)
**Direction**: Unidirectional (Driver -> Network)

## CONNECTION DETAILS

- **Default Multicast Address**: `239.255.77.77`
- **Default Port**: `4010`
- **Transport**: UDP (Unicast or Multicast supported)

> **Note**: These values are now **dynamic**. The Driver reads `HKLM\SYSTEM\CurrentControlSet\Services\Scream\Options` for `UnicastIPv4` and `UnicastPort`.

## PACKET STRUCTURE

Each UDP packet is **1157 bytes** total.

- **Header**: 5 bytes
- **Payload**: 1152 bytes (PCM Audio)

### Header Format (5 Bytes)

| Offset | Field                   | Size   | Description                                   |
| :----- | :---------------------- | :----- | :-------------------------------------------- |
| **0**  | **Sample Rate Marker**  | 1 Byte | Encoded sampling frequency index (see below). |
| **1**  | **Bit Depth Marker**    | 1 Byte | Encoded bit depth index (16/24/32).           |
| **2**  | **Channels**            | 1 Byte | Number of channels (1-8).                     |
| **3**  | **Channel Mask (Low)**  | 1 Byte | Low byte of channel mask.                     |
| **4**  | **Channel Mask (High)** | 1 Byte | High byte of channel mask.                    |

### Payload Format (1152 Bytes)

- **Content**: Raw PCM Samples.
- **Interleaving**: Standard Interleaved (L, R, L, R...).
- **Endianness**: Little-Endian (Windows Native).

## IMPLEMENTATION NOTES

- **No Handshake**: This is a "Fire and Forget" protocol. The receiver must just listen.
- **No Retries**: Dropped packets are lost forever (UDP).
- **Latency**: Minimized by small payload size (1152 bytes).

## SYSTEM INTEGRATION

This protocol is the **"Voice"** of the North Shore system.

- **Transmitter**: `src/Driver` (Windows Kernel Driver)
- **Receiver**: `src/NorthShoreClient` (Windows Client) OR `AbëVoice Engine` (Port 8000 Component).
