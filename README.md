# AoA-Visualizer-3D-DigitalTwin

Provides an immersive visualization and real-time tracking interface for the **u-blox XPLR-AOA-3 Explorer Kit**. This project combines a backend positioning engine with a high-performance 3D visualization dashboard built using **Three.js** to create a Digital Twin of your indoor space.

## 🚀 Key Features

- **Real-time 3D Tracking**: Live visualization of tags moving through your indoor space via WebSockets.
- **u-blox AoA-3 Kit Integration**: Designed to work seamlessly with ANT-B10 antenna boards and C209 tags.
- **Flexible Anchor Support**: Compatible with both **real u-blox anchors** and **fake anchors** (software emulated) for testing without hardware.
- **3D Model Support**: Upload custom GLB/GLTF models of your floor plan for a realistic Digital Twin experience.
- **Interactive Controls**: Full mouse-based camera controls (rotate, pan, zoom) and visibility toggles.
- **Object Identification**: Mark and classify objects within your 3D scene-graph for semantic mapping.

---

## 🛠 Prerequisites & Installation

### 1. Download u-blox Evaluation Software & Assets

This repository contains the 3D Viewer and Digital Twin interface. The core positioning engine, anchor emulation tools, and demo floor plans are proprietary to **u-blox** and must be obtained from their official portal:

1.  Visit the [u-blox XPLR-AOA-3 Kit Page](https://www.u-blox.com/en/product/xplr-aoa-3-kit?legacy=Current#Documentation-&-resources).
2.  Under **Documentation & Resources**, download the **XPLR-AOA-3 evaluation software**.
3.  **Place Binaries**: Copy `fakeanchor.exe` and `server.exe` into the root directory of this project.
4.  **Place Floor Plans**: Copy the images from the software package's `floor_plans` folder into the `floor_plans/` directory of this repo.

### 2. Hardware/Emulation Setup

If you have 4 pre-programmed antenna boards, connect them and skip to step 3. Otherwise:

1.  **Loopback COM-ports**: Install 4 loop-backed COM-ports named COM91 ... COM94 using com0com.
2.  **Run Emulation**: Open a command prompt and run:
    `ash
./fakeanchor.exe UART
`
    _This will emulate 4 anchors at coordinates (0,0,0), (1,0,0), (0,1,0), and (1,1,0)._

### 2. Start the Engine

Open a second command prompt and enter:
`ash
./server.exe
`
Wait for the INFO:config:Configuration loaded message.

### 3. Access the Interface

- **2D Dashboard**: Open your browser at http://localhost:5000
- **3D Viewer**: Navigate to http://localhost:5000/3d-viewer.html or open public/3d-viewer.html directly.

---

## 📐 3D Viewer Details

Built with **Three.js**, the 3D viewer provides:

- **🟦 Blue Sprites**: Anchors positioned at configured X, Y, Z coordinates.
- **🔴 Red Sprites**: Tags with real-time pulsing animations.
- **🟫 Textured Plane**: Your uploaded floor plan mapped into 3D space.
- **🟩 Custom Models**: Support for GLB (recommended) and GLTF formats (up to 50MB).

### Scene-Graph & Semantic Mapping

The viewer includes an **Object Identification** feature that allows you to click on objects in your 3D model, classify them (e.g., Desk, Chair, Equipment), and export the resulting scene-graph as a JSON file for further use.

---

## 🔧 Technical Details

- **Backend**: Python-based positioning engine (packaged as server.exe).
- **Frontend**: HTML5, CSS3, JavaScript (ES6).
- **Graphics**: [Three.js](https://threejs.org/) for WebGL-based 3D rendering.
- **Communication**: WebSockets for low-latency tag updates and REST API for configurations.
- **Coordinate System**:
  - **X**: Width (m)
  - **Y**: Height/Vertical (m)
  - **Z**: Length/Depth (m)

---

## 📦 Compatibility

- **u-blox XPLR-AOA-3 Kit**: ANT-B10 antenna boards, EVB-ANT-1 development boards, C209 tags.
- **Positioning Engine**: Compatible with u-blox direction-finding algorithms and u-locateEmbed (formerly u-connectLocate) firmware.

---

## 📝 License & Credits

Developed as part of the u-blox AoA Indoor Positioning ecosystem.
Uses **Three.js** and **OrbitControls** for 3D visualization.

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. It is free for personal, educational, and research use. Commercial use is strictly prohibited without prior authorization.

---

_Created by [MCTass](https://github.com/MCTass/)_
