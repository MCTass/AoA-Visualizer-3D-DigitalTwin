// 3D Floor Plan Viewer JavaScript
// Global variables
let scene, camera, renderer, controls;
let anchors = [],
  tags = [];
let floorPlanSize = { x: 10, y: 10 };
let anchorMeshes = [],
  tagMeshes = [],
  floorMesh,
  customAxes;
let axesOrigin = new THREE.Vector3(0, 0, 0); // User-defined origin
let isSettingOrigin = false;
let originMarker; // Visual marker for the origin
let showAnchors = true,
  showTags = true,
  showFloor = true;
let wsConnection = null;
let lastFrameTime = null; // For animation timing

// 3D Model variables
let loadedModel = null;
let modelFile = null;
let gltfLoader = null;

// Initialize 3D scene
async function init() {
  console.log("Starting 3D viewer initialization...");
  try {
    updateStatus("Setting up 3D environment...");

    // Check if Three.js loaded
    if (typeof THREE === "undefined") {
      throw new Error("Three.js library not loaded");
    } // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(5, 8, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Expose globals for scene graph manager
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    window.updateStatus = updateStatus;
    const container = document.getElementById("viewer-container");
    console.log("Looking for viewer-container element:", container);
    if (!container) {
      throw new Error("Viewer container element not found");
    }
    console.log("Appending renderer to container...");
    container.appendChild(renderer.domElement); // Controls
    if (typeof THREE.OrbitControls !== "undefined") {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 1;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI / 2;
    } else {
      console.warn("OrbitControls not available");
    }

    // Initialize GLTF Loader
    if (typeof THREE.GLTFLoader !== "undefined") {
      gltfLoader = new THREE.GLTFLoader();
    } else {
      console.warn("GLTFLoader not available");
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight); // Grid helper for reference
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Coordinate system axes - will be custom-built and positioned later
    customAxes = new THREE.Group();
    scene.add(customAxes);

    // Create the origin marker (a small sphere)
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.8,
    });
    originMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    originMarker.visible = false; // Only visible when setting origin
    scene.add(originMarker);

    // Add mouse down listener for setting the origin
    renderer.domElement.addEventListener(
      "mousedown",
      onDocumentMouseDown,
      false
    );

    updateStatus("Loading configuration...");

    // Add test objects first to ensure anchors array is populated
    addTestObjects(); // Load initial data, ensuring it completes before proceeding
    await loadFloorPlanConfig();
    await loadAnchorsAndTags(); // This will try API first, fallback to test objects    // Load default 3D model AFTER floor plan config is loaded
    await loadDefaultModel();

    // Set the initial origin based on the loaded model/floor
    resetOrigin();

    // Draw initial tag(s) from the test data, if any
    createTags(); // Auto-populate anchor configuration
    refreshAnchorConfig();

    // Start animation loop
    animate();

    // Setup WebSocket for real-time updates
    setupWebSocket(); // Handle window resize
    window.addEventListener("resize", onWindowResize, false);

    console.log("3D viewer initialization completed successfully");
    updateStatus("3D viewer initialized successfully");
  } catch (error) {
    console.error("Error initializing 3D scene:", error);
    updateStatus("Error: " + error.message);

    // Fallback: show error message
    const container = document.getElementById("container");
    if (container) {
      container.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(255,0,0,0.8); padding: 20px; border-radius: 10px; color: white;">
          <h3>3D Viewer Error</h3>
          <p>${error.message}</p>
          <p>Please check browser console for details.</p>
        </div>
      `;
    }
  }
}

// Add test objects so you can see the 3D environment working
function addTestObjects() {
  // Create test anchor data for configuration testing.
  // These will be drawn by createAnchors() later in the init sequence.
  anchors = [
    {
      com: "TestAnchor1",
      mac: "AA:BB:CC:DD:EE:01",
      config: {
        x: 3,
        y: 0,
        z: 1.5,
        azimuthAngle: 0,
        tiltAngle: 0,
        angleMin: -45,
        angleMax: 45,
      },
    },
    {
      com: "TestAnchor2",
      mac: "AA:BB:CC:DD:EE:02",
      config: {
        x: 0,
        y: 3,
        z: 1.5,
        azimuthAngle: 90,
        tiltAngle: 0,
        angleMin: -45,
        angleMax: 45,
      },
    },
    {
      com: "TestAnchor3",
      mac: "AA:BB:CC:DD:EE:03",
      config: {
        x: -3,
        y: 0,
        z: 1.5,
        azimuthAngle: 180,
        tiltAngle: 0,
        angleMin: -45,
        angleMax: 45,
      },
    },
    {
      com: "TestAnchor4",
      mac: "AA:BB:CC:DD:EE:04",
      config: {
        x: 0,
        y: -3,
        z: 1.5,
        azimuthAngle: 270,
        tiltAngle: 0,
        angleMin: -45,
        angleMax: 45,
      },
    },
  ];

  // Add a test tag to the global array. It will be drawn by createTags().
  tags.push({ id: "TestTag1", x: 1, y: 1, z: 0.2 });

  // The floor and objects will be drawn later in the init sequence.
  updateStatus("Loaded test object data.");
}

// Create anchor sprite using the anchor image
function createAnchorSprite(x, y, z, label) {
  const textureLoader = new THREE.TextureLoader();
  const anchorTexture = textureLoader.load(
    "static/media/Anchor-img.png",
    function (texture) {
      // Image loaded successfully
    },
    undefined,
    function (error) {
      console.error("Error loading anchor image:", error);
    }
  );

  const spriteMaterial = new THREE.SpriteMaterial({
    map: anchorTexture,
    transparent: true,
    alphaTest: 0.1,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.5, 0.5, 1); // Scaled down for better proportion
  sprite.visible = showAnchors;
  sprite.userData = { type: "anchor", label: label };

  scene.add(sprite);
  anchorMeshes.push(sprite);

  // Add text label below the anchor
  createAnchorLabel(sprite, label, x, y - 0.5, z);
}

// Create tag sprite using the tag image
function createTagSprite(x, y, z, label) {
  const textureLoader = new THREE.TextureLoader();
  const tagTexture = textureLoader.load(
    "static/media/C209-tag.png",
    undefined,
    undefined,
    function (error) {
      console.error("Error loading tag image:", error);
    }
  );

  const spriteMaterial = new THREE.SpriteMaterial({
    map: tagTexture,
    transparent: true,
    alphaTest: 0.1,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.5, 0.5, 1); // Scaled down for better proportion
  sprite.visible = showTags;
  sprite.userData = {
    type: "tag",
    label: label,
    originalScale: 0.5,
    time: Math.random() * Math.PI * 2,
  };

  scene.add(sprite);
  tagMeshes.push(sprite);
}

// Load default 3D model (Room_Traditional.glb)
async function loadDefaultModel() {
  console.log(
    `DEBUG: loadDefaultModel() called - floorPlanSize is: x=${floorPlanSize.x}, y=${floorPlanSize.y}`
  );
  if (!gltfLoader) {
    console.warn("GLTFLoader not available for default model");
    return;
  }

  updateStatus("Loading default 3D model...");

  return new Promise((resolve, reject) => {
    // Load the default Room_Traditional.glb model
    gltfLoader.load(
      "./Room_Traditional.glb",
      function (gltf) {
        // Success callback
        try {
          loadedModel = gltf.scene; // Calculate model bounds
          const modelBox = new THREE.Box3().setFromObject(loadedModel);
          const size = modelBox.getSize(new THREE.Vector3());
          const center = modelBox.getCenter(new THREE.Vector3()); // Scale model to fit the configured room dimensions from config3D.json
          // SWAP: Use Y-length for 3D X-axis and X-width for 3D Z-axis (same as upload function)
          const targetWidth = floorPlanSize.x; // Use actual loaded dimensions
          const targetLength = floorPlanSize.y; // Use actual loaded dimensions
          console.log(
            `DEBUG: floorPlanSize values: x=${floorPlanSize.x}, y=${floorPlanSize.y}`
          );
          console.log(
            `Scaling default model to: ${targetWidth}m x ${targetLength}m (from config3D.json)`
          );
          const scaleX = targetLength / size.x; // Use Y-length for X-axis (same as upload)
          const scaleZ = targetWidth / size.z; // Use X-width for Z-axis (same as upload)
          const scale = Math.min(scaleX, scaleZ); // Use uniform scaling

          loadedModel.scale.setScalar(scale);

          // CRITICAL FIX: Reset position before calculating the bounding box to ensure
          // we get a reliable offset calculation, regardless of the model's internal pivot.
          loadedModel.position.set(0, 0, 0);
          loadedModel.updateMatrixWorld(true); // Ensure matrices are up-to-date

          modelBox.setFromObject(loadedModel); // Recalculate the box after scaling
          loadedModel.position.sub(modelBox.min);

          // Enable shadows for the model
          loadedModel.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }); // Add to scene
          scene.add(loadedModel); // Hide the 2D floor plan when a 3D model is loaded to avoid conflicts
          if (floorMesh) {
            floorMesh.visible = false;
            showFloor = false;
          } // Update axes position based on the new 3D model bounds
          updateAxesPosition(); // Update scene graph manager with the loaded model
          if (typeof sceneGraphManager !== "undefined") {
            sceneGraphManager.updateLoadedModel(loadedModel);
            sceneGraphManager.updatePlanDimensions(targetWidth, targetLength);
          }

          updateStatus(
            `Default 3D model loaded successfully (${targetWidth}m x ${targetLength}m)`
          );
          updateInfo(); // Update the info panel
          resolve(); // Success
        } catch (error) {
          console.error("Error processing default model:", error);
          updateStatus("Error processing default 3D model");
          reject(error);
        }
      },
      function (progress) {
        // Progress callback
        const percent = Math.round((progress.loaded / progress.total) * 100);
        updateStatus(`Loading default 3D model... ${percent}%`);
      },
      function (error) {
        // Error callback - this is expected if the file doesn't exist
        updateStatus("No default 3D model found - you can upload your own");
        resolve(); // Not an error, just no default model available
      }
    );
  });
}

// Load floor plan configuration
async function loadFloorPlanConfig() {
  try {
    updateStatus("Loading room dimensions from config3D.json...");
    const response = await fetch("./config3D.json");
    if (!response.ok) {
      throw new Error("config3D.json not available");
    }
    const data = await response.json();

    const sizeX = data["3D_plan_size_x"] || 10;
    const sizeY = data["3D_plan_size_y"] || 10;
    const sizeZ = data["3D_plan_size_z"] || 2.5;

    // Validate reasonable floor plan dimensions (should be in meters)
    if (sizeX > 100 || sizeY > 100 || sizeX < 1 || sizeY < 1) {
      console.warn(
        `Invalid floor plan size from config3D.json: ${sizeX}x${sizeY}, using defaults`
      );
      floorPlanSize = { x: 10, y: 10 };
      updateStatus(
        "Using default floor plan size (config3D.json returned invalid dimensions)"
      );
    } else {
      floorPlanSize.x = sizeX;
      floorPlanSize.y = sizeY;
      console.log(
        `DEBUG: Successfully loaded config3D.json - floorPlanSize now: x=${floorPlanSize.x}, y=${floorPlanSize.y}`
      );
      updateStatus(
        `Loaded room dimensions from config3D.json: ${floorPlanSize.x}x${floorPlanSize.y}x${sizeZ}m`
      );
    } // Create floor plane with texture
    createFloorPlan();

    // Update axes position to corner based on loaded room dimensions
    updateAxesPosition();
  } catch (error) {
    console.error("Error loading config3D.json:", error);
    updateStatus("Falling back to old API endpoint...");

    // Fallback to the old API endpoint if config3D.json is not available
    try {
      const response = await fetch("/api/floorplan_size");
      if (!response.ok) {
        throw new Error("API not available");
      }
      const data = await response.json();

      const sizeX = data.floor_plan_size_x || 10;
      const sizeY = data.floor_plan_size_y || 10;

      // Validate reasonable floor plan dimensions (should be in meters, not pixels)
      if (sizeX > 100 || sizeY > 100 || sizeX < 1 || sizeY < 1) {
        console.warn(
          `Invalid floor plan size from API: ${sizeX}x${sizeY}, using defaults`
        );
        floorPlanSize = { x: 10, y: 10 };
        updateStatus(
          "Using default floor plan size (API returned invalid dimensions)"
        );
      } else {
        floorPlanSize.x = sizeX;
        floorPlanSize.y = sizeY;
        updateStatus(
          "Floor plan size from API: " +
            floorPlanSize.x +
            "x" +
            floorPlanSize.y +
            "m"
        );
      } // Create floor plane with texture
      createFloorPlan();

      // Update axes position to corner based on loaded room dimensions
      updateAxesPosition();
    } catch (apiError) {
      console.error("Error loading from API:", apiError);
      updateStatus(
        "Using default floor plan size (no config sources available)"
      ); // Use default values and create a simple floor
      floorPlanSize = { x: 10, y: 10 };
      createFloorPlan();

      // Update axes position to corner based on default room dimensions
      updateAxesPosition();
    }
  }
}

// Load anchors and tags
async function loadAnchorsAndTags() {
  try {
    updateStatus("Trying to load anchor configuration...");
    const response = await fetch("/api/configure");
    if (!response.ok) {
      throw new Error("API not available");
    }
    const data = await response.json();

    // Only update anchors if API provides valid data
    if (data.anchors && data.anchors.length > 0) {
      anchors = data.anchors;
      updateStatus("Loaded " + anchors.length + " anchors from API");
      updateInfo();
      // Auto-refresh the anchor configuration section
      refreshAnchorConfig();
    } else {
      updateStatus("API returned no anchors - using test anchors");
    }
  } catch (error) {
    console.error("Error loading anchors:", error);
    updateStatus("Using test anchors (API not available)");
  } finally {
    // Always draw whatever anchors we ended up with (either from API or test data).
    createAnchors();
  }
}

// Create floor plan mesh with texture
function createFloorPlan() {
  // Remove existing floor if any
  if (floorMesh) {
    scene.remove(floorMesh);
  }

  // Load floor plan texture
  const textureLoader = new THREE.TextureLoader();
  const floorTexture = textureLoader.load(
    "/map?param=" + Math.floor(Math.random() * 1000),
    function (texture) {
      if (loadedModel) {
        updateStatus("Floor plan texture loaded (hidden - 3D model active)");
      } else {
        updateStatus("Floor plan texture loaded");
      }
    },
    undefined,
    function (error) {
      console.error("Error loading floor plan texture:", error);
      updateStatus("Error loading floor plan image");
    }
  );

  // Create floor geometry, swapping dimensions to match coordinate swap
  const floorGeometry = new THREE.PlaneGeometry(
    floorPlanSize.y,
    floorPlanSize.x
  );
  const floorMaterial = new THREE.MeshLambertMaterial({
    map: floorTexture,
    transparent: true,
    opacity: 0.8,
  });
  floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal

  // Reposition floor so its corner is at (0,0,0) for consistent coordinates
  floorMesh.position.set(floorPlanSize.y / 2, 0, floorPlanSize.x / 2);

  floorMesh.receiveShadow = true;
  // Hide 2D floor plan if a 3D model is loaded, otherwise show it
  if (loadedModel) {
    floorMesh.visible = false;
    showFloor = false;
  } else {
    floorMesh.visible = showFloor;
  }

  scene.add(floorMesh);
}

// Update coordinate axes position to corner based on 3D model or room dimensions
// FIXES IMPLEMENTED:
// 1. Axes positioned based on 3D model bounds when available (not 2D floor plan)
// 2. 2D floor plan automatically hidden when 3D model is loaded
// 3. Coordinate origin moved to model corner instead of center
function updateAxesPosition() {
  // Clear previous axes
  if (customAxes) {
    customAxes.clear();
  }
  if (!loadedModel && !floorPlanSize) return;

  let sceneMin = new THREE.Vector3(0, 0, 0);
  let sceneMax = new THREE.Vector3(floorPlanSize.y, 2.5, floorPlanSize.x);

  if (loadedModel) {
    const modelBox = new THREE.Box3().setFromObject(loadedModel);
    sceneMin.copy(modelBox.min);
    sceneMax.copy(modelBox.max);
  }

  // Use axesOrigin directly (no offset needed)
  const origin = axesOrigin;
  let lengthX, lengthY, lengthZ;

  if (loadedModel) {
    // For a loaded model, axis lengths should match the user-defined dimensions
    const uiWidth =
      parseFloat(document.getElementById("width-input").value) || 0; // Data X
    const uiLength =
      parseFloat(document.getElementById("length-input").value) || 0; // Data Y

    const modelBox = new THREE.Box3().setFromObject(loadedModel);
    const modelSize = modelBox.getSize(new THREE.Vector3());

    lengthX = uiLength; // 3D X-axis (blue) uses the Y-length from UI
    lengthZ = uiWidth; // 3D Z-axis (red) uses the X-width from UI
    lengthY = modelSize.y; // Height axis uses the model's actual scaled height
  } else {
    // For the 2D floor plan, the lengths frame the entire plan
    lengthX = origin.x - sceneMin.x;
    lengthY = sceneMax.y - sceneMin.y; // Y axis should represent full height
    lengthZ = origin.z - sceneMin.z;
  }

  const headLength = 0.2;
  const headWidth = 0.1;

  // Create inward-pointing axes using ArrowHelper
  const xAxis = new THREE.ArrowHelper(
    new THREE.Vector3(-1, 0, 0),
    origin,
    lengthX,
    0x0000ff, // blue (Represents data Y)
    headLength,
    headWidth
  );
  const yAxis = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    origin,
    lengthY,
    0x00ff00, // green (Represents data Z / height)
    headLength,
    headWidth
  );
  const zAxis = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    origin,
    lengthZ,
    0xff0000, // red (Represents data X)
    headLength,
    headWidth
  );

  customAxes.add(xAxis, yAxis, zAxis);
}

// Create anchor meshes
function createAnchors() {
  // Clear existing anchor meshes
  anchorMeshes.forEach((mesh) => scene.remove(mesh));
  anchorMeshes = [];

  anchors.forEach((anchor, index) => {
    if (anchor.config) {
      // Read coordinates from config - these are relative to the new origin
      const x_from_ui = parseFloat(anchor.config.x) || 0;
      const y_from_ui = parseFloat(anchor.config.y) || 0;
      const z_from_ui = parseFloat(anchor.config.z) || 1.5;

      // Transform relative to the new axesOrigin
      const world_x = axesOrigin.x - y_from_ui; // 3D X-axis (blue) corresponds to UI Y-axis
      const world_z = axesOrigin.z - x_from_ui; // 3D Z-axis (red) corresponds to UI X-axis
      const world_y = axesOrigin.y + z_from_ui; // Height is relative to origin's height

      // Create anchor sprite using the anchor image
      createAnchorSprite(
        world_x,
        world_y,
        world_z,
        anchor.com || anchor.mac || "A" + index
      );
    } else {
      console.log(`Anchor ${index} has no config:`, anchor);
    }
  });

  updateStatus("Created " + anchors.length + " anchor visualizations");
}

// Create a simple label for anchors using canvas texture
function createAnchorLabel(parentMesh, text, x, y, z) {
  // Create canvas for text
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 128;
  canvas.height = 64;

  // Draw text on canvas
  context.fillStyle = "rgba(0, 0, 0, 0.8)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.font = "bold 16px Arial";
  context.textAlign = "center";
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 5);

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Create sprite for label
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.5, 0.25, 1);
  sprite.visible = showAnchors;

  scene.add(sprite);
  anchorMeshes.push(sprite); // Add to anchors array for visibility toggle
}

// Create tag meshes (for real-time tracking data)
function createTags() {
  // Clear existing tag meshes
  tagMeshes.forEach((mesh) => scene.remove(mesh));
  tagMeshes = [];

  tags.forEach((tag, index) => {
    // Read coordinates from tag data - assuming they are relative to the new origin
    const x_from_data = parseFloat(tag.x) || 0;
    const y_from_data = parseFloat(tag.y) || 0;
    const z_from_data = parseFloat(tag.z) || 0.2;

    // Transform relative to the new axesOrigin
    const world_x = axesOrigin.x - y_from_data; // 3D X-axis (blue) corresponds to data Y-axis
    const world_z = axesOrigin.z - x_from_data; // 3D Z-axis (red) corresponds to data X-axis
    const world_y = axesOrigin.y + z_from_data; // Height is relative to origin's height

    // Create tag sprite using the tag image
    createTagSprite(world_x, world_y, world_z, tag.id || "Tag" + index);
  });
}

// Setup WebSocket connection for real-time updates
function setupWebSocket() {
  try {
    const wsUrl = "ws://localhost:5000/ws/angles";
    wsConnection = new WebSocket(wsUrl);

    wsConnection.onopen = function () {
      updateStatus("Connected to real-time data stream");
    };

    wsConnection.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);
        updateTagPositions(data);
      } catch (error) {
        // Handle binary data if needed
        // Received binary data
      }
    };

    wsConnection.onclose = function () {
      updateStatus("Real-time connection closed");
      // Attempt to reconnect after 5 seconds
      setTimeout(setupWebSocket, 5000);
    };

    wsConnection.onerror = function (error) {
      console.error("WebSocket error:", error);
      updateStatus("Real-time connection error");
    };
  } catch (error) {
    console.error("Failed to setup WebSocket:", error);
    updateStatus("Failed to connect to real-time data");
  }
}

// Update tag positions from real-time data
function updateTagPositions(data) {
  if (data && data.beacons) {
    // Update tags array with new data
    tags = data.beacons.map((beacon) => ({
      id: beacon.id || "Unknown",
      x: beacon.x || 0,
      y: beacon.y || 0,
      z: beacon.z || 0.2,
    }));

    createTags();
    updateInfo();
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Calculate delta time for animations
  const now = Date.now();
  const delta = (now - (lastFrameTime || now)) / 1000; // Convert to seconds
  lastFrameTime = now;

  // Update controls if available
  if (controls && controls.update) {
    controls.update();
  }

  // Animate tags (pulsing effect)
  tagMeshes.forEach((tagMesh) => {
    if (tagMesh.userData && tagMesh.userData.type === "tag") {
      tagMesh.userData.time += 0.05;
      const scale =
        tagMesh.userData.originalScale *
        (1 + 0.2 * Math.sin(tagMesh.userData.time));
      tagMesh.scale.set(scale, scale, 1);
    }
  });

  // Delegate animation to scene graph manager if available
  if (typeof sceneGraphManager !== "undefined" && sceneGraphManager.animate) {
    sceneGraphManager.animate(delta);
  }

  // Render if renderer exists
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Toggle functions
function toggleAnchors() {
  showAnchors = !showAnchors;
  anchorMeshes.forEach((mesh) => (mesh.visible = showAnchors));
  updateStatus("Anchors " + (showAnchors ? "shown" : "hidden"));
}

function toggleTags() {
  showTags = !showTags;
  tagMeshes.forEach((mesh) => (mesh.visible = showTags));
  updateStatus("Tags " + (showTags ? "shown" : "hidden"));
}

function toggleFloor() {
  showFloor = !showFloor;
  if (floorMesh) {
    // Only show 2D floor plan if no 3D model is loaded
    if (loadedModel && showFloor) {
      updateStatus(
        "2D floor plan hidden - 3D model is active. Clear the 3D model to use 2D floor plan."
      );
      showFloor = false; // Keep it hidden
    } else {
      floorMesh.visible = showFloor;
      updateStatus("Floor plan " + (showFloor ? "shown" : "hidden"));
    }
  } else {
    updateStatus("No floor plan available");
  }
}

function resetCamera() {
  camera.position.set(5, 8, 5);
  camera.lookAt(0, 0, 0);
  controls.reset();
  updateStatus("Camera view reset");
}

// Update status text
function updateStatus(message) {
  document.getElementById("status-text").textContent = message;
}

// Update info panel
function updateInfo() {
  document.getElementById("anchor-count").textContent =
    "Anchors: " + anchors.length;
  document.getElementById("tag-count").textContent = "Tags: " + tags.length;

  // Show 3D model status and 2D floor plan visibility
  if (loadedModel) {
    document.getElementById("model-status").textContent =
      "3D Model: Loaded (2D floor plan hidden)";
  } else {
    const floorStatus = floorMesh && floorMesh.visible ? "visible" : "hidden";
    document.getElementById(
      "model-status"
    ).textContent = `3D Model: None (2D floor plan ${floorStatus})`;
  }
}

// 3D Model Upload Functions
// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  const fileButton = document.getElementById("file-button");
  const fileButtonText = document.getElementById("file-button-text");
  const uploadButton = document.getElementById("upload-button");

  if (file) {
    // Check file type
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".glb") || fileName.endsWith(".gltf")) {
      // Check file size (limit to 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert("File is too large. Please select a file smaller than 50MB.");
        event.target.value = "";
        resetFileInput();
        return;
      }

      modelFile = file;
      const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Convert to MB
      fileButtonText.textContent = `${file.name} (${fileSize} MB)`;
      fileButton.classList.add("has-file");
      uploadButton.disabled = false;
      updateStatus(`Selected: ${file.name} (${fileSize} MB)`);
    } else {
      alert("Please select a valid 3D model file (.glb or .gltf)");
      event.target.value = "";
      resetFileInput();
    }
  } else {
    resetFileInput();
  }
}

// Reset file input
function resetFileInput() {
  const fileButton = document.getElementById("file-button");
  const fileButtonText = document.getElementById("file-button-text");
  const uploadButton = document.getElementById("upload-button");

  modelFile = null;
  fileButtonText.textContent = "Choose 3D Model File";
  fileButton.classList.remove("has-file");
  uploadButton.disabled = true;
}

// Upload and load 3D model
function uploadModel() {
  if (!modelFile || !gltfLoader) {
    alert("No file selected or GLTF loader not available");
    return;
  }

  updateStatus("Loading 3D model...");
  // Get dimensions from inputs (use config3D.json defaults)
  const width =
    parseFloat(document.getElementById("width-input").value) || 7.48;
  const length =
    parseFloat(document.getElementById("length-input").value) || 4.81;

  // Create file URL
  const fileURL = URL.createObjectURL(modelFile);

  // Load the model
  gltfLoader.load(
    fileURL,
    function (gltf) {
      // Success callback
      try {
        // Remove existing model if any
        if (loadedModel) {
          scene.remove(loadedModel);
        }

        loadedModel = gltf.scene;

        // Store filename in model userData for scene management
        loadedModel.userData = loadedModel.userData || {};
        loadedModel.userData.filename = modelFile.name;

        // Calculate model bounds
        const uploadedModelBox = new THREE.Box3().setFromObject(loadedModel);
        const size = uploadedModelBox.getSize(new THREE.Vector3());
        const center = uploadedModelBox.getCenter(new THREE.Vector3()); // Scale model to fit specified dimensions
        // SWAP: Use Y-length for 3D X-axis and X-width for 3D Z-axis
        const scaleX = length / size.x;
        const scaleZ = width / size.z;
        const scale = Math.min(scaleX, scaleZ); // Use uniform scaling

        loadedModel.scale.setScalar(scale);

        // CRITICAL FIX: Reset position before calculating the bounding box to ensure
        // we get a reliable offset calculation, regardless of the model's internal pivot.
        loadedModel.position.set(0, 0, 0);
        loadedModel.updateMatrixWorld(true); // Ensure matrices are up-to-date

        uploadedModelBox.setFromObject(loadedModel); // Recalculate the box after scaling/moving
        loadedModel.position.sub(uploadedModelBox.min);

        // Enable shadows for the model
        loadedModel.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }); // Add to scene
        scene.add(loadedModel); // Hide the 2D floor plan when a 3D model is loaded to avoid conflicts
        if (floorMesh) {
          floorMesh.visible = false;
          showFloor = false;
        } // Update axes position based on the new 3D model bounds
        updateAxesPosition(); // Update scene graph manager with new model
        window.loadedModel = loadedModel;
        if (typeof sceneGraphManager !== "undefined") {
          sceneGraphManager.updateLoadedModel(loadedModel);
          sceneGraphManager.updatePlanDimensions(width, length);
        }

        // Validate coordinate system alignment
        setTimeout(() => validateCoordinateSystem(), 100);

        updateStatus(
          `3D model loaded successfully (X:${width}m, Y:${length}m)`
        );
        updateInfo(); // Update the info panel

        // Clean up the blob URL
        URL.revokeObjectURL(fileURL);
      } catch (error) {
        console.error("Error processing loaded model:", error);
        updateStatus("Error processing 3D model");
        URL.revokeObjectURL(fileURL);
      }
    },
    function (progress) {
      // Progress callback
      const percent = Math.round((progress.loaded / progress.total) * 100);
      updateStatus(`Loading 3D model... ${percent}%`);
    },
    function (error) {
      // Error callback
      console.error("Error loading 3D model:", error);
      updateStatus("Failed to load 3D model");
      URL.revokeObjectURL(fileURL);

      // Show user-friendly error message
      let errorMessage = "Failed to load 3D model. ";
      if (error.message) {
        errorMessage += error.message;

        // Check for common GLTF buffer loading issues
        if (
          error.message.includes("Failed to load buffer") ||
          error.message.includes(".bin")
        ) {
          errorMessage +=
            "\n\nThis usually happens when using GLTF format with external files. " +
            "Please export your model as GLB format instead, which packages everything " +
            "into a single file that works better in web browsers.";
        }
      } else {
        errorMessage +=
          "Please check that the file is a valid GLB or GLTF model.";
      }
      alert(errorMessage);
    }
  );
}

//Clear loaded model
function clearModel() {
  if (loadedModel) {
    scene.remove(loadedModel);
    loadedModel = null;
    window.loadedModel = null;

    // Show the 2D floor plan again when 3D model is cleared
    if (floorMesh) {
      floorMesh.visible = true;
      showFloor = true;
    }

    // Update axes position based on floor plan since no 3D model is loaded
    updateAxesPosition();

    updateStatus("3D model removed");
    updateInfo(); // Update the info panel
  }

  // Reset file input
  document.getElementById("model-file").value = "";
  resetFileInput();
}

// Toggle upload section visibility
function toggleUploadSection() {
  const uploadContent = document.getElementById("upload-content");
  const uploadArrow = document.getElementById("upload-arrow");
  const toggleBtn = document.getElementById("upload-toggle-btn");

  if (uploadContent.classList.contains("collapsed")) {
    // Show the upload section
    uploadContent.classList.remove("collapsed");
    uploadArrow.classList.remove("collapsed");
    uploadArrow.textContent = "▼"; // Down arrow
    toggleBtn.title = "Collapse upload section";
  } else {
    // Hide the upload section
    uploadContent.classList.add("collapsed");
    uploadArrow.classList.add("collapsed");
    uploadArrow.textContent = "▶"; // Right arrow
    toggleBtn.title = "Expand upload section";
  }
}

// Anchor Configuration Functions
function toggleConfigSection() {
  const configContent = document.getElementById("config-content");
  const configArrow = document.getElementById("config-arrow");
  const toggleBtn = document.getElementById("config-toggle-btn");

  if (configContent.classList.contains("collapsed")) {
    // Show the config section
    configContent.classList.remove("collapsed");
    configArrow.classList.remove("collapsed");
    configArrow.textContent = "▼"; // Down arrow
    toggleBtn.title = "Collapse anchor configuration section";
  } else {
    // Hide the config section
    configContent.classList.add("collapsed");
    configArrow.classList.add("collapsed");
    configArrow.textContent = "▶"; // Right arrow
    toggleBtn.title = "Expand anchor configuration section";
  }
}

function refreshAnchorConfig() {
  updateStatus("Refreshing anchor configuration...");

  // Clear existing configuration inputs
  const anchorConfigList = document.getElementById("anchor-config-list");
  anchorConfigList.innerHTML = "";

  if (anchors.length === 0) {
    anchorConfigList.innerHTML = `
      <p style="color: #888; text-align: center; margin: 20px 0;">
        No anchors available. Load anchors first using the API.
      </p>
    `;
    updateStatus("No anchors to configure");
    return;
  }

  // Create configuration inputs for each anchor
  anchors.forEach((anchor, index) => {
    const anchorDiv = document.createElement("div");
    anchorDiv.className = "anchor-config-item";

    const label = anchor.com || anchor.mac || `Anchor ${index + 1}`;
    const config = anchor.config || { x: 0, y: 0, z: 1.5 };

    anchorDiv.innerHTML = `
      <div class="anchor-header">
        <h5>${label}</h5>
        <span class="anchor-mac">${anchor.mac || "Unknown MAC"}</span>
      </div>
      <div class="anchor-coords">
        <div class="coord-input">
          <label for="anchor-${index}-x">X (m)</label>
          <input 
            type="number" 
            id="anchor-${index}-x" 
            value="${parseFloat(config.x) || 0}" 
            step="0.1" 
            min="-50" 
            max="50"
            onchange="updateAnchorPosition(${index}, 'x', this.value)"
          />
        </div>
        <div class="coord-input">
          <label for="anchor-${index}-y">Y (m)</label>
          <input 
            type="number" 
            id="anchor-${index}-y" 
            value="${parseFloat(config.y) || 0}" 
            step="0.1" 
            min="-50" 
            max="50"
            onchange="updateAnchorPosition(${index}, 'y', this.value)"
          />
        </div>
        <div class="coord-input">
          <label for="anchor-${index}-z">Z (m)</label>
          <input 
            type="number" 
            id="anchor-${index}-z" 
            value="${parseFloat(config.z) || 1.5}" 
            step="0.1" 
            min="0" 
            max="10"
            onchange="updateAnchorPosition(${index}, 'z', this.value)"
          />
        </div>
      </div>
      <div class="anchor-actions">
        <button class="apply-btn" onclick="applyAnchorPosition(${index})">
          Apply Position
        </button>
        <button class="reset-btn" onclick="resetSingleAnchor(${index})">
          Reset
        </button>
      </div>
    `;

    anchorConfigList.appendChild(anchorDiv);
  });

  updateStatus(`Configuration loaded for ${anchors.length} anchors`);
}

function updateAnchorPosition(anchorIndex, coordinate, value) {
  if (anchorIndex < 0 || anchorIndex >= anchors.length) {
    console.error("Invalid anchor index:", anchorIndex);
    return;
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    console.error("Invalid coordinate value:", value);
    return;
  }

  // Update the anchor's configuration
  if (!anchors[anchorIndex].config) {
    anchors[anchorIndex].config = { x: 0, y: 0, z: 1.5 };
  }
  anchors[anchorIndex].config[coordinate] = numValue;
}

function applyAnchorPosition(anchorIndex) {
  if (anchorIndex < 0 || anchorIndex >= anchors.length) {
    console.error("Invalid anchor index:", anchorIndex);
    return;
  }

  const anchor = anchors[anchorIndex];
  const label = anchor.com || anchor.mac || `Anchor ${anchorIndex + 1}`;

  // Read current values from input fields
  const xInput = document.getElementById(`anchor-${anchorIndex}-x`);
  const yInput = document.getElementById(`anchor-${anchorIndex}-y`);
  const zInput = document.getElementById(`anchor-${anchorIndex}-z`);

  if (!xInput || !yInput || !zInput) {
    console.error("Could not find input fields for anchor", anchorIndex);
    return;
  }

  const newX = parseFloat(xInput.value);
  const newY = parseFloat(yInput.value);
  const newZ = parseFloat(zInput.value);
  if (isNaN(newX) || isNaN(newY) || isNaN(newZ)) {
    updateStatus(`Error: Invalid coordinates for ${label}`);
    return;
  }

  // Update the anchor's configuration with new values
  if (!anchor.config) {
    anchor.config = { x: 0, y: 0, z: 1.5 };
  }

  anchor.config.x = newX;
  anchor.config.y = newY;
  anchor.config.z = newZ;

  // Update the 3D visualization
  createAnchors();

  updateStatus(`Applied position for ${label}: (${newX}, ${newY}, ${newZ})`);
}

function resetSingleAnchor(anchorIndex) {
  if (anchorIndex < 0 || anchorIndex >= anchors.length) {
    console.error("Invalid anchor index:", anchorIndex);
    return;
  }

  const anchor = anchors[anchorIndex];
  const label = anchor.com || anchor.mac || `Anchor ${anchorIndex + 1}`;

  // Reset to default position
  anchor.config = {
    x: 0,
    y: 0,
    z: 1.5,
    azimuthAngle: anchor.config?.azimuthAngle || 0,
    tiltAngle: anchor.config?.tiltAngle || 0,
    angleMin: anchor.config?.angleMin || -45,
    angleMax: anchor.config?.angleMax || 45,
  };

  // Update the input fields
  document.getElementById(`anchor-${anchorIndex}-x`).value = 0;
  document.getElementById(`anchor-${anchorIndex}-y`).value = 0;
  document.getElementById(`anchor-${anchorIndex}-z`).value = 1.5;
  // Update the 3D visualization
  createAnchors();

  updateStatus(`Reset position for ${label}`);
}

function resetAnchorPositions() {
  if (anchors.length === 0) {
    updateStatus("No anchors to reset");
    return;
  }

  // Reset all anchors to default positions
  anchors.forEach((anchor, index) => {
    anchor.config = {
      x: 0,
      y: 0,
      z: 1.5,
      azimuthAngle: anchor.config?.azimuthAngle || 0,
      tiltAngle: anchor.config?.tiltAngle || 0,
      angleMin: anchor.config?.angleMin || -45,
      angleMax: anchor.config?.angleMax || 45,
    };
  });

  // Refresh the configuration UI  refreshAnchorConfig();

  // Update the 3D visualization
  createAnchors();

  updateStatus(`Reset all ${anchors.length} anchors to default positions`);
}

// Debug function to validate coordinate system alignment
function validateCoordinateSystem() {
  // Coordinate system validation (console output removed for cleaner logs)
  if (loadedModel) {
    const modelBox = new THREE.Box3().setFromObject(loadedModel);
    const size = modelBox.getSize(new THREE.Vector3());
    // Model bounds and positioning validated
  }
}

// Origin Point Control Functions
function enterSetOriginMode() {
  isSettingOrigin = true;
  originMarker.visible = true;
  controls.enabled = false; // Disable camera controls
  document.getElementById("container").style.cursor = "crosshair";
  document.getElementById("origin-status-text").textContent =
    "Click on the floor to set the new origin...";
}

function resetOrigin() {
  // Find the default far corner and set it as origin
  let defaultOrigin = new THREE.Vector3(5, 0, 5); // Fallback
  if (loadedModel) {
    const box = new THREE.Box3().setFromObject(loadedModel);
    defaultOrigin.set(box.max.x, 0, box.max.z);
  } else if (floorPlanSize) {
    defaultOrigin.set(floorPlanSize.y, 0, floorPlanSize.x);
  }
  axesOrigin.copy(defaultOrigin);
  originMarker.position.copy(axesOrigin);

  // Update the input fields
  updateOriginInputFields();

  // Update everything
  updateAxesPosition();
  createAnchors();
  createTags();
  document.getElementById(
    "origin-status-text"
  ).textContent = `Origin reset to default far corner.`;
}

function onDocumentMouseDown(event) {
  // Skip if object identification mode is active
  if (
    typeof sceneGraphManager !== "undefined" &&
    sceneGraphManager.isIdentificationModeActive()
  ) {
    return;
  }

  if (!isSettingOrigin) return;

  event.preventDefault();

  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Intersect with a conceptual floor plane at y=0
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersectionPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(floorPlane, intersectionPoint);

  if (intersectionPoint) {
    axesOrigin.copy(intersectionPoint);
    originMarker.position.copy(axesOrigin);

    // Update the input fields with the clicked position
    updateOriginInputFields();

    // Update visuals
    updateAxesPosition();
    createAnchors();
    createTags();
    document.getElementById(
      "origin-status-text"
    ).textContent = `Origin set to: (${axesOrigin.x.toFixed(
      2
    )}, ${axesOrigin.y.toFixed(2)}, ${axesOrigin.z.toFixed(
      2
    )}) - Use input fields to fine-tune`;
  }

  // Exit setting mode
  isSettingOrigin = false;
  originMarker.visible = false;
  controls.enabled = true;
  document.getElementById("container").style.cursor = "default";
}

// Origin Control Functions
let originOffset = { x: 0, y: 0, z: 0 };

function updateOriginInputFields() {
  // Update input fields to reflect the current axesOrigin position
  const xInput = document.getElementById("origin-x-input");
  const yInput = document.getElementById("origin-y-input");
  const zInput = document.getElementById("origin-z-input");

  if (xInput) xInput.value = axesOrigin.x.toFixed(2);
  if (yInput) yInput.value = axesOrigin.y.toFixed(2);
  if (zInput) zInput.value = axesOrigin.z.toFixed(2);
}

function previewOriginChange() {
  // Show live preview in status text as user types
  const xInput = document.getElementById("origin-x-input");
  const yInput = document.getElementById("origin-y-input");
  const zInput = document.getElementById("origin-z-input");
  const statusText = document.getElementById("origin-status-text");

  if (xInput && yInput && zInput && statusText) {
    const x = parseFloat(xInput.value) || 0;
    const y = parseFloat(yInput.value) || 0;
    const z = parseFloat(zInput.value) || 0;

    statusText.textContent = `Preview: (${x.toFixed(2)}, ${y.toFixed(
      2
    )}, ${z.toFixed(2)}) - Click Apply to confirm`;
  }
}

function toggleOriginSection() {
  const originContent = document.getElementById("origin-content");
  const originArrow = document.getElementById("origin-arrow");
  const toggleBtn = document.getElementById("origin-toggle-btn");

  if (originContent.classList.contains("collapsed")) {
    // Show the origin section
    originContent.classList.remove("collapsed");
    originArrow.classList.remove("collapsed");
    originArrow.textContent = "▼"; // Down arrow
    toggleBtn.title = "Collapse origin control section";
  } else {
    // Hide the origin section
    originContent.classList.add("collapsed");
    originArrow.classList.add("collapsed");
    originArrow.textContent = "▶"; // Right arrow
    toggleBtn.title = "Expand origin control section";
  }
}

function applyOriginPosition() {
  const xInput = document.getElementById("origin-x-input");
  const yInput = document.getElementById("origin-y-input");
  const zInput = document.getElementById("origin-z-input");
  const statusText = document.getElementById("origin-status-text");

  if (!xInput || !yInput || !zInput) {
    updateStatus("Error: Origin input fields not found");
    return;
  }

  const newX = parseFloat(xInput.value) || 0;
  const newY = parseFloat(yInput.value) || 0;
  const newZ = parseFloat(zInput.value) || 0;

  // Update the axesOrigin directly
  axesOrigin.set(newX, newY, newZ);
  originMarker.position.copy(axesOrigin);

  // Update coordinate axes position
  updateAxesPosition();

  // Update status
  updateStatus(
    `Origin position updated to (${newX.toFixed(2)}, ${newY.toFixed(
      2
    )}, ${newZ.toFixed(2)})`
  );
  if (statusText) {
    statusText.textContent = `Current origin: (${newX.toFixed(
      2
    )}, ${newY.toFixed(2)}, ${newZ.toFixed(2)})`;
  }

  // Recreate anchors and tags to reflect the new origin
  createAnchors();
  createTags();
}

function resetOriginPosition() {
  const xInput = document.getElementById("origin-x-input");
  const yInput = document.getElementById("origin-y-input");
  const zInput = document.getElementById("origin-z-input");
  const statusText = document.getElementById("origin-status-text");

  // Reset to default origin position
  let defaultOrigin = new THREE.Vector3(5, 0, 5); // Fallback
  if (loadedModel) {
    const box = new THREE.Box3().setFromObject(loadedModel);
    defaultOrigin.set(box.max.x, 0, box.max.z);
  } else if (floorPlanSize) {
    defaultOrigin.set(floorPlanSize.y, 0, floorPlanSize.x);
  }

  // Update axesOrigin
  axesOrigin.copy(defaultOrigin);
  originMarker.position.copy(axesOrigin);

  // Update input fields
  if (xInput) xInput.value = axesOrigin.x.toFixed(2);
  if (yInput) yInput.value = axesOrigin.y.toFixed(2);
  if (zInput) zInput.value = axesOrigin.z.toFixed(2);

  // Update axes position
  updateAxesPosition();

  // Update status
  updateStatus(
    `Origin reset to default far corner: (${axesOrigin.x.toFixed(
      2
    )}, ${axesOrigin.y.toFixed(2)}, ${axesOrigin.z.toFixed(2)})`
  );
  if (statusText) {
    statusText.textContent = `Origin reset to default position: (${axesOrigin.x.toFixed(
      2
    )}, ${axesOrigin.y.toFixed(2)}, ${axesOrigin.z.toFixed(2)})`;
  }

  // Recreate anchors and tags to reflect the reset origin
  createAnchors();
  createTags();
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, starting initialization...");
  console.log("THREE.js available:", typeof THREE);
  console.log("THREE.WebGLRenderer available:", typeof THREE.WebGLRenderer);
  console.log("THREE.OrbitControls available:", typeof THREE.OrbitControls);
  init();

  // Refresh data periodically (fallback if WebSocket fails)
  setInterval(() => {
    loadAnchorsAndTags();
  }, 10000); // Every 10 seconds
});
