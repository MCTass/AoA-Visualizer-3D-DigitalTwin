// 3D Scene Graph Manager for Object Identification
// This module handles the identification and management of objects in 3D models

class SceneGraphManager {
  constructor() {
    this.identifiedObjects = [];
    this.objectMarkers = [];
    this.objectRelationships = []; // New: Store relationships between objects
    this.isIdentifyingObjects = false;
    this.currentObjectType = "chair";
    this.currentSceneId = null; // Track current scene/session

    // Layered Architecture View properties
    this.layeredViewEnabled = false;
    this.buildingRootNode = null;
    this.relationshipLines = [];
    this.layerGroups = new Map(); // Store objects by their hierarchy layer

    // 3D plan dimensions in meters (for centering the building root node)
    this.planDimensions = {
      x: 7.48,
      y: 4.81,
    }; // Relationship types and their descriptions
    this.relationshipTypes = {
      on_top_of: { label: "On top of", inverse: "supports" },
      inside: { label: "Inside", inverse: "contains" },
      attached_to: { label: "Attached to", inverse: "has_attached" },
      next_to: { label: "Next to", inverse: "adjacent_to" },
      connects_to: { label: "Connects to", inverse: "connected_by" },
      part_of: { label: "Part of", inverse: "has_part" },
      powers: { label: "Powers", inverse: "powered_by" },
      controls: { label: "Controls", inverse: "controlled_by" },
    };

    // Colors for different relationship types
    this.relationshipColors = {
      on_top_of: 0xff6b35, // Orange Red
      inside: 0x9b59b6, // Purple
      attached_to: 0xe74c3c, // Red
      next_to: 0x3498db, // Blue
      connects_to: 0x2ecc71, // Green
      part_of: 0xf39c12, // Orange
      powers: 0xe67e22, // Dark Orange
      controls: 0x1abc9c, // Turquoise
    }; // Available object types for classification (organized by category)
    this.objectTypes = [
      // Furniture
      "chair",
      "table",
      "desk",
      "bed",
      "sofa",
      "cabinet",
      "shelf",
      "bookshelf",

      // Electronics
      "computer",
      "monitor",
      "keyboard",
      "mouse",
      "tv",
      "phone",
      "lamp",

      // Architecture
      "door",
      "window",
      "wall",
      "floor",
      "ceiling",

      // Decorative/Other
      "plant",
      "other",
    ]; // Colors for different object types (organized by category)
    this.typeColors = {
      // Furniture
      chair: 0x4682b4, // SteelBlue
      table: 0x8b4513, // SaddleBrown
      desk: 0x8b4513, // SaddleBrown
      bed: 0x800080, // Purple
      sofa: 0x228b22, // ForestGreen
      cabinet: 0x8b4513, // SaddleBrown
      shelf: 0x8b4513, // SaddleBrown
      bookshelf: 0x654321, // DarkBrown

      // Electronics
      computer: 0x696969, // DimGray
      monitor: 0x000000, // Black
      keyboard: 0x708090, // SlateGray
      mouse: 0x808080, // Gray
      tv: 0x2f4f4f, // DarkSlateGray
      phone: 0xb22222, // FireBrick
      lamp: 0xffd700, // Gold

      // Architecture
      door: 0x8b4513, // SaddleBrown
      window: 0xadd8e6, // LightBlue
      wall: 0xf5f5dc, // Beige
      floor: 0x8b4513, // SaddleBrown
      ceiling: 0xffffff, // White

      // Decorative/Other
      plant: 0x32cd32, // LimeGreen
      other: 0xc71585, // MediumVioletRed
    };

    // References to external dependencies (will be set during initialization)
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.loadedModel = null;
    this.updateStatus = null;
  }

  // Initialize the scene graph manager
  init(dependencies) {
    const { scene, camera, renderer, loadedModel, updateStatus } = dependencies;

    if (!scene || !camera || !renderer) {
      console.warn("Required dependencies not provided, retrying...");
      return false;
    }

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.loadedModel = loadedModel;
    this.updateStatus = updateStatus;
    // Generate or load scene ID
    this.currentSceneId = this.generateSceneId();

    // Load existing objects and relationships from localStorage
    this.loadFromStorage();

    // Update session display
    this.updateCurrentSceneDisplay();

    // Setup event listeners with existing UI
    this.setupEventListeners();

    // Populate the existing HTML dropdown with object types
    this.populateObjectTypeDropdown();

    console.log("Scene Graph Manager initialized successfully");
    return true;
  }

  // Populate the existing HTML dropdown with object types
  populateObjectTypeDropdown() {
    const dropdown = document.getElementById("object-type-select");
    if (dropdown) {
      // Clear any existing options
      dropdown.innerHTML = "";

      // Add options from the objectTypes array
      this.objectTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        dropdown.appendChild(option);
      });

      // Set the default selected value
      dropdown.value = this.currentObjectType;

      console.log(
        `Populated dropdown with ${this.objectTypes.length} object types`
      );
    } else {
      console.warn("Object type dropdown not found in HTML");
    }
  }
  // Get the next sequential number for a specific object type
  // This ensures each object type has its own numbering sequence
  // e.g., chair_1, chair_2, table_1, chair_3, table_2
  getNextObjectNumber(objectType) {
    const objectsOfType = this.identifiedObjects.filter(
      (obj) => obj.type === objectType
    );
    return objectsOfType.length + 1;
  }

  // Generate a unique scene ID based on the loaded model or current session
  generateSceneId() {
    // Use model name if available, otherwise use timestamp
    if (
      this.loadedModel &&
      this.loadedModel.userData &&
      this.loadedModel.userData.filename
    ) {
      return `scene_${this.loadedModel.userData.filename.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}`;
    }

    // Check if there's a saved scene ID for this session
    const savedSceneId = localStorage.getItem("current_scene_id");
    if (savedSceneId) {
      return savedSceneId;
    }

    // Generate new scene ID
    const newSceneId = `scene_${Date.now()}`;
    localStorage.setItem("current_scene_id", newSceneId);
    return newSceneId;
  }

  // Save objects and relationships to localStorage
  saveToStorage() {
    try {
      const storageKey = `scene_graph_${this.currentSceneId}`;
      const data = {
        version: "2.0",
        sceneId: this.currentSceneId,
        timestamp: new Date().toISOString(),
        objects: this.identifiedObjects.map((obj) => ({
          id: obj.id,
          type: obj.type,
          name: obj.name || obj.type,
          position: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
          },
          normal: obj.normal
            ? {
                x: obj.normal.x,
                y: obj.normal.y,
                z: obj.normal.z,
              }
            : null,
          meshName: obj.meshName,
          timestamp: obj.timestamp,
          metadata: obj.metadata || {},
        })),
        relationships: this.objectRelationships.map((rel) => ({
          id: rel.id,
          sourceObjectId: rel.sourceObjectId,
          targetObjectId: rel.targetObjectId,
          relationshipType: rel.relationshipType,
          description: rel.description,
          timestamp: rel.timestamp,
          metadata: rel.metadata || {},
        })),
      };

      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Scene data saved to storage with key: ${storageKey}`);

      if (this.updateStatus) {
        this.updateStatus(
          `Scene saved to local storage (${this.identifiedObjects.length} objects, ${this.objectRelationships.length} relationships)`
        );
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
      if (this.updateStatus) {
        this.updateStatus("Error saving scene data to storage");
      }
    }
  }

  // Load objects and relationships from localStorage
  loadFromStorage() {
    try {
      const storageKey = `scene_graph_${this.currentSceneId}`;
      const savedData = localStorage.getItem(storageKey);

      if (!savedData) {
        console.log("No saved scene data found");
        return;
      }

      const data = JSON.parse(savedData);
      console.log(
        `Loading scene data from storage: ${
          data.objects?.length || 0
        } objects, ${data.relationships?.length || 0} relationships`
      );

      // Load objects
      if (data.objects && Array.isArray(data.objects)) {
        this.identifiedObjects = data.objects.map((obj) => ({
          id: obj.id,
          type: obj.type,
          name: obj.name || obj.type,
          position: new THREE.Vector3(
            obj.position.x,
            obj.position.y,
            obj.position.z
          ),
          normal: obj.normal
            ? new THREE.Vector3(obj.normal.x, obj.normal.y, obj.normal.z)
            : new THREE.Vector3(0, 1, 0),
          meshName: obj.meshName,
          timestamp: obj.timestamp,
          metadata: obj.metadata || {},
        }));

        // Recreate visual markers for loaded objects
        this.identifiedObjects.forEach((obj) => this.createObjectMarker(obj));
      }

      // Load relationships
      if (data.relationships && Array.isArray(data.relationships)) {
        this.objectRelationships = data.relationships.map((rel) => ({
          id: rel.id,
          sourceObjectId: rel.sourceObjectId,
          targetObjectId: rel.targetObjectId,
          relationshipType: rel.relationshipType,
          description: rel.description,
          timestamp: rel.timestamp,
          metadata: rel.metadata || {},
        }));
      }

      // Update UI
      this.updateIdentifiedObjectsList();
      this.updateObjectCount();

      if (this.updateStatus) {
        this.updateStatus(
          `Loaded ${this.identifiedObjects.length} objects and ${this.objectRelationships.length} relationships from storage`
        );
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
      if (this.updateStatus) {
        this.updateStatus("Error loading scene data from storage");
      }
    }
  }

  // Clear storage for current scene
  clearStorage() {
    try {
      const storageKey = `scene_graph_${this.currentSceneId}`;
      localStorage.removeItem(storageKey);
      console.log(`Storage cleared for scene: ${this.currentSceneId}`);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // Add a relationship between two objects
  addObjectRelationship(
    sourceObjectId,
    targetObjectId,
    relationshipType,
    description = ""
  ) {
    // Check if objects exist
    const sourceObject = this.identifiedObjects.find(
      (obj) => obj.id === sourceObjectId
    );
    const targetObject = this.identifiedObjects.find(
      (obj) => obj.id === targetObjectId
    );

    if (!sourceObject || !targetObject) {
      console.error(
        "Cannot create relationship: one or both objects not found"
      );
      return null;
    }

    // Check if relationship already exists
    const existingRel = this.objectRelationships.find(
      (rel) =>
        rel.sourceObjectId === sourceObjectId &&
        rel.targetObjectId === targetObjectId &&
        rel.relationshipType === relationshipType
    );

    if (existingRel) {
      console.warn("Relationship already exists");
      return existingRel;
    }

    const relationship = {
      id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceObjectId,
      targetObjectId,
      relationshipType,
      description:
        description ||
        `${sourceObject.name || sourceObject.type} ${
          this.relationshipTypes[relationshipType]?.label || relationshipType
        } ${targetObject.name || targetObject.type}`,
      timestamp: new Date().toISOString(),
      metadata: {},
    };
    this.objectRelationships.push(relationship);

    // Auto-save
    this.saveToStorage();

    // Update UI
    this.updateIdentifiedObjectsList();

    // Update layered view if enabled
    this.updateLayeredView();

    if (this.updateStatus) {
      this.updateStatus(`Added relationship: ${relationship.description}`);
    }

    console.log("Relationship added:", relationship);
    return relationship;
  }

  // Remove a relationship
  removeObjectRelationship(relationshipId) {
    const index = this.objectRelationships.findIndex(
      (rel) => rel.id === relationshipId
    );
    if (index !== -1) {
      const relationship = this.objectRelationships[index];
      this.objectRelationships.splice(index, 1);

      // Auto-save
      this.saveToStorage(); // Update UI
      this.updateIdentifiedObjectsList();

      // Update layered view if enabled
      this.updateLayeredView();

      if (this.updateStatus) {
        this.updateStatus(`Removed relationship: ${relationship.description}`);
      }

      console.log("Relationship removed:", relationship);
    }
  }

  // Get relationships for a specific object
  getObjectRelationships(objectId) {
    return this.objectRelationships.filter(
      (rel) =>
        rel.sourceObjectId === objectId || rel.targetObjectId === objectId
    );
  }
  // Update the loaded model reference when a new model is loaded
  updateLoadedModel(loadedModel) {
    this.loadedModel = loadedModel;

    // Update scene ID based on new model
    if (loadedModel && loadedModel.userData && loadedModel.userData.filename) {
      const newSceneId = `scene_${loadedModel.userData.filename.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}`;
      if (newSceneId !== this.currentSceneId) {
        // Save current scene before switching
        this.saveToStorage();

        // Switch to model-specific scene
        this.currentSceneId = newSceneId;
        localStorage.setItem("current_scene_id", newSceneId);

        // Clear current objects and load scene data
        this.clearAllObjects();
        this.loadFromStorage();

        // Update UI
        this.updateCurrentSceneDisplay();

        if (this.updateStatus) {
          this.updateStatus(`Switched to model scene: ${newSceneId}`);
        }
      }
    }

    this.testModelIntersection();
  }

  // Update plan dimensions (called when model is loaded with new dimensions)
  updatePlanDimensions(x, y) {
    this.planDimensions.x = x;
    this.planDimensions.y = y;
    console.log(
      `Scene graph manager plan dimensions updated to: ${x}m x ${y}m`
    );

    // If layered view is active, update the building root node position
    if (this.layeredViewEnabled && this.buildingRootNode) {
      const centerX = this.planDimensions.x / 2;
      const centerZ = this.planDimensions.y / 2;
      const height = 7; // 7 meters above ground
      this.buildingRootNode.position.set(centerX, height, centerZ);
    }
  }

  // Create the user interface for object identification
  createUI() {
    const controlsDiv = document.getElementById("controls");
    if (!controlsDiv) {
      console.error("Controls container not found");
      return;
    }

    const objectSection = document.createElement("div");
    objectSection.className = "config-section";
    objectSection.innerHTML = `
            <div class="config-header">
                <h4>Object Identification</h4>
                <button class="toggle-config-btn" 
                        onclick="sceneGraphManager.toggleSection()" 
                        id="object-toggle-btn" 
                        title="Toggle object identification section">
                    <span id="object-arrow">▶</span>
                </button>
            </div>
            <div class="config-content collapsed" id="object-content">
                <p style="color: #ffcc00; font-size: 12px; margin: 5px 0">
                    <strong>Tip:</strong> Enable identification mode and click on objects in the 3D model to identify and classify them.
                </p>
                
                <div class="object-controls">
                    <button id="identify-toggle-btn" class="identify-btn" onclick="sceneGraphManager.toggleIdentifyMode()">
                        Enable Identification Mode
                    </button>
                    
                    <div class="object-type-selector">
                        <label for="object-type-select">Object Type:</label>
                        <select id="object-type-select" onchange="sceneGraphManager.setObjectType(this.value)">
                            ${this.objectTypes
                              .map(
                                (type) =>
                                  `<option value="${type}">${
                                    type.charAt(0).toUpperCase() + type.slice(1)
                                  }</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    
                    <div class="identified-objects-count">
                        <span id="object-count">Identified Objects: 0</span>
                    </div>
                      <div class="object-actions">
                        <button class="clear-btn" onclick="sceneGraphManager.clearAllObjects()">
                            Clear All Objects
                        </button>
                        <button class="export-btn" onclick="sceneGraphManager.exportSceneGraph()">
                            Export Scene Graph
                        </button>
                        <button class="layered-view-btn" id="toggle-layered-view" onclick="sceneGraphManager.toggleLayeredView()">
                            Layered View
                        </button>
                    </div>
                </div>
                
                <div id="identified-objects-list" class="identified-objects-list">
                    <div class="empty-list-message">No objects identified yet</div>
                </div>
            </div>
        `;

    controlsDiv.appendChild(objectSection);

    // Session management UI
    const sessionSection = document.createElement("div");
    sessionSection.className = "config-section";
    sessionSection.innerHTML = `
            <div class="config-header">
                <h4>Scene Sessions</h4>
                <button class="toggle-config-btn" 
                        onclick="sceneGraphManager.toggleSessionPanel()" 
                        id="session-toggle-btn" 
                        title="Toggle scene session panel">
                    <span id="session-arrow">▶</span>
                </button>
            </div>
            <div class="config-content collapsed" id="session-content">
                <div class="current-scene">
                    <strong>Current Scene:</strong> 
                    <span id="current-scene-id">None</span>
                </div>
                
                <div class="saved-scenes">
                    <h5>Saved Scenes</h5>
                    <div id="saved-scenes-list" class="saved-scenes-list">
                        <div class="empty-list-message">No saved scenes found</div>
                    </div>
                </div>
                
                <div class="session-actions">
                    <button class="create-scene-btn" onclick="sceneGraphManager.createNewScene()">
                        Create New Scene
                    </button>
                </div>
            </div>
        `;

    controlsDiv.appendChild(sessionSection);
  }

  // Setup event listeners
  setupEventListeners() {
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.addEventListener(
        "click",
        this.onObjectClick.bind(this),
        false
      );
    }
  }

  // Toggle the object identification section
  toggleSection() {
    const objectContent = document.getElementById("object-content");
    const objectArrow = document.getElementById("object-arrow");

    if (objectContent && objectArrow) {
      if (objectContent.classList.contains("collapsed")) {
        objectContent.classList.remove("collapsed");
        objectArrow.textContent = "▼";
      } else {
        objectContent.classList.add("collapsed");
        objectArrow.textContent = "▶";
      }
    }
  }

  // Toggle session management panel
  toggleSessionPanel() {
    const sessionContent = document.getElementById("session-content");
    const sessionArrow = document.getElementById("session-arrow");

    if (sessionContent && sessionArrow) {
      if (sessionContent.classList.contains("collapsed")) {
        sessionContent.classList.remove("collapsed");
        sessionArrow.textContent = "▼";
        this.refreshSessionList();
        this.updateCurrentSceneDisplay();
      } else {
        sessionContent.classList.add("collapsed");
        sessionArrow.textContent = "▶";
      }
    }
  }

  // Update the current scene display
  updateCurrentSceneDisplay() {
    const currentSceneElement = document.getElementById("current-scene-id");
    if (currentSceneElement) {
      currentSceneElement.textContent = this.currentSceneId || "None";
    }
  }

  // Refresh the session list UI
  refreshSessionList() {
    const listElement = document.getElementById("saved-scenes-list");
    if (!listElement) return;

    const savedScenes = this.getSavedScenes();

    if (savedScenes.length === 0) {
      listElement.innerHTML =
        '<div class="empty-list-message">No saved scenes found</div>';
      return;
    }

    let html = '<div class="sessions-container">';

    savedScenes.forEach((scene) => {
      const isCurrentScene = scene.id === this.currentSceneId;
      const date = new Date(scene.timestamp).toLocaleString();

      html += `
        <div class="session-item ${
          isCurrentScene ? "current-session" : ""
        }" data-scene-id="${scene.id}">
          <div class="session-info">
            <div class="session-name">${scene.id}</div>
            <div class="session-stats">
              ${scene.objectCount} objects, ${
        scene.relationshipCount
      } relationships
            </div>
            <div class="session-date">${date}</div>
          </div>
          <div class="session-actions">
            ${
              !isCurrentScene
                ? `
              <button class="switch-btn" onclick="sceneGraphManager.switchToScene('${scene.id}')" title="Switch to this scene">
                Switch
              </button>
              <button class="delete-session-btn" onclick="sceneGraphManager.deleteSavedScene('${scene.id}')" title="Delete this scene">
                ×
              </button>
            `
                : '<span class="current-label">Current</span>'
            }
          </div>
        </div>
      `;
    });

    html += "</div>";
    listElement.innerHTML = html;
  }

  // Toggle object identification mode
  toggleIdentifyMode() {
    this.isIdentifyingObjects = !this.isIdentifyingObjects;
    const identifyBtn = document.getElementById("identify-toggle-btn");
    const viewerContainer = document.getElementById("viewer-container");

    if (this.isIdentifyingObjects) {
      if (identifyBtn) {
        identifyBtn.textContent = "Disable Identification Mode";
        identifyBtn.classList.add("active");
      }
      if (viewerContainer) {
        viewerContainer.style.cursor = "crosshair";
      }
      if (this.updateStatus) {
        this.updateStatus(
          "Object identification mode enabled. Click on objects in the 3D model."
        );
      }
    } else {
      if (identifyBtn) {
        identifyBtn.textContent = "Enable Identification Mode";
        identifyBtn.classList.remove("active");
      }
      if (viewerContainer) {
        viewerContainer.style.cursor = "default";
      }
      if (this.updateStatus) {
        this.updateStatus("Object identification mode disabled.");
      }
    }
  }

  // Set the current object type
  setObjectType(type) {
    this.currentObjectType = type;
    if (this.updateStatus) {
      this.updateStatus(`Current object type set to: ${type}`);
    }
  }

  // Test intersection with the 3D model
  testModelIntersection() {
    if (!this.loadedModel) {
      console.log("No loaded model available to test");
      return;
    }

    const objectsToIntersect = [];
    this.loadedModel.traverse((child) => {
      if (child.isMesh) {
        objectsToIntersect.push(child);
        console.log(`Found mesh in model: ${child.name || "unnamed"}`);
      }
    });

    console.log(
      `Found ${objectsToIntersect.length} meshes in the loaded model`
    );
  }

  // Handle object click for identification
  onObjectClick(event) {
    if (!this.isIdentifyingObjects) return;

    // Prevent other click handlers from firing
    event.preventDefault();
    event.stopPropagation();

    // Calculate mouse position
    const mouse = new THREE.Vector2();
    const rect = this.renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Define what objects to check for intersection
    const objectsToIntersect = [];

    // Include the loaded model in the raycaster check
    if (this.loadedModel) {
      console.log("Checking loaded model for intersections");
      this.loadedModel.traverse((child) => {
        if (child.isMesh) {
          objectsToIntersect.push(child);
        }
      });
    } else {
      console.log("No loaded model available for intersection test");
      if (this.updateStatus) {
        this.updateStatus("Object identification requires a loaded 3D model.");
      }
      return;
    }

    // Get intersections
    const intersects = raycaster.intersectObjects(objectsToIntersect, true);
    console.log(`Found ${intersects.length} intersections`);

    if (intersects.length > 0) {
      // Get the first intersection
      const intersection = intersects[0]; // Create a unique ID for this object
      const objectId = `object_${Date.now()}`; // Create object data
      const objectData = {
        id: objectId,
        type: this.currentObjectType,
        name: `${this.currentObjectType}_${this.getNextObjectNumber(
          this.currentObjectType
        )}`, // Auto-generate name with type-specific numbering
        position: intersection.point.clone(),
        normal: intersection.face
          ? intersection.face.normal.clone()
          : new THREE.Vector3(0, 1, 0),
        meshName: intersection.object.name || "unnamed",
        timestamp: new Date().toISOString(),
        metadata: {},
      };

      console.log("Creating marker for object:", objectData);

      // Create a marker to visualize the identification
      this.createObjectMarker(objectData); // Add to the list of identified objects
      this.identifiedObjects.push(objectData);

      // Auto-save to storage
      this.saveToStorage();

      // Update UI
      this.updateIdentifiedObjectsList();
      this.updateObjectCount();

      // Update layered view if active
      this.updateLayeredView();

      if (this.updateStatus) {
        this.updateStatus(
          `Identified a ${
            this.currentObjectType
          } at position (${intersection.point.x.toFixed(
            2
          )}, ${intersection.point.y.toFixed(
            2
          )}, ${intersection.point.z.toFixed(2)})`
        );
      }
    } else {
      if (this.updateStatus) {
        this.updateStatus("No object detected at the clicked position.");
      }
    }
  }

  // Create a visual marker for an identified object
  createObjectMarker(objectData) {
    // Create a small sphere to mark the identified object
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: this.typeColors[objectData.type] || 0xffffff,
      opacity: 0.8,
      transparent: true,
    });

    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(objectData.position);
    marker.userData.objectId = objectData.id;

    // Set static scale - no animation
    marker.scale.set(1.0, 1.0, 1.0);

    // Add to scene
    this.scene.add(marker);

    // Add to markers array for tracking
    this.objectMarkers.push({
      id: objectData.id,
      marker: marker,
    });

    return marker;
  }

  // Remove a marker by object ID
  removeObjectMarker(objectId) {
    const markerIndex = this.objectMarkers.findIndex((m) => m.id === objectId);

    if (markerIndex !== -1) {
      const markerData = this.objectMarkers[markerIndex];
      const marker = markerData.marker;

      this.scene.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();

      this.objectMarkers.splice(markerIndex, 1);
    }
  }
  // Delete an identified object
  deleteObject(objectId) {
    // Remove from identified objects array
    const objectIndex = this.identifiedObjects.findIndex(
      (obj) => obj.id === objectId
    );

    if (objectIndex !== -1) {
      this.identifiedObjects.splice(objectIndex, 1);

      // Remove marker
      this.removeObjectMarker(objectId);

      // Remove all relationships involving this object
      this.objectRelationships = this.objectRelationships.filter(
        (rel) =>
          rel.sourceObjectId !== objectId && rel.targetObjectId !== objectId
      );

      // Auto-save to storage
      this.saveToStorage();

      // Update UI
      this.updateIdentifiedObjectsList();
      this.updateObjectCount();

      if (this.updateStatus) {
        this.updateStatus("Object and its relationships removed.");
      }
    }
  }

  // Clear all identified objects
  clearAllObjects() {
    // Remove all markers
    this.objectMarkers.forEach((markerData) => {
      const marker = markerData.marker;
      this.scene.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    }); // Clear arrays
    this.objectMarkers = [];
    this.identifiedObjects = [];
    this.objectRelationships = []; // Clear layered view if enabled
    if (this.layeredViewEnabled) {
      this.hideLayeredView();
    }

    // Clear storage
    this.clearStorage();

    // Update UI
    this.updateIdentifiedObjectsList();
    this.updateObjectCount();

    if (this.updateStatus) {
      this.updateStatus("All identified objects and relationships cleared.");
    }
  }
  // Update the identified objects list in the UI
  updateIdentifiedObjectsList() {
    const listElement = document.getElementById("identified-objects-list");
    if (!listElement) return;

    if (this.identifiedObjects.length === 0) {
      listElement.innerHTML =
        '<div class="empty-list-message">No objects identified yet</div>';
      return;
    }

    let html = '<div class="objects-container">';

    this.identifiedObjects.forEach((obj) => {
      const colorHex =
        "#" +
        (this.typeColors[obj.type] || 0xffffff).toString(16).padStart(6, "0");

      // Get relationships for this object
      const relationships = this.getObjectRelationships(obj.id);

      html += `
        <div class="object-item" data-id="${obj.id}">
          <div class="object-header">
            <div class="object-info">
              <span class="object-color" style="background-color: ${colorHex}"></span>
              <div class="object-details">
                <input type="text" class="object-name" value="${
                  obj.name || obj.type
                }" 
                       onchange="sceneGraphManager.updateObjectName('${
                         obj.id
                       }', this.value)"
                       placeholder="Object name">
                <span class="object-type-small">${obj.type}</span>
                <span class="object-position">(${obj.position.x.toFixed(
                  1
                )}, ${obj.position.y.toFixed(1)}, ${obj.position.z.toFixed(
        1
      )})</span>
              </div>
            </div>
            <div class="object-actions">
              <button class="relation-btn" onclick="sceneGraphManager.toggleRelationshipPanel('${
                obj.id
              }')" 
                      title="Manage relationships">⚡</button>
              <button class="delete-btn" onclick="sceneGraphManager.deleteObject('${
                obj.id
              }')" 
                      title="Delete this object">×</button>
            </div>
          </div>
          
          <!-- Relationships Panel -->
          <div class="relationship-panel" id="rel-panel-${
            obj.id
          }" style="display: none;">            <div class="relationship-section">
              <h5>Add Relationship</h5>
              <div class="relationship-controls">
                <select class="relationship-type" id="rel-type-${obj.id}">
                  ${Object.entries(this.relationshipTypes)
                    .map(([key, value]) => {
                      const colorHex =
                        "#" +
                        (this.relationshipColors[key] || 0x2196f3)
                          .toString(16)
                          .padStart(6, "0");
                      return `<option value="${key}" style="color: ${colorHex}; font-weight: bold;">${value.label}</option>`;
                    })
                    .join("")}
                </select>
                <select class="target-object" id="target-obj-${obj.id}">
                  <option value="">Select target object...</option>
                  ${this.identifiedObjects
                    .filter((target) => target.id !== obj.id)
                    .map(
                      (target) =>
                        `<option value="${target.id}">${
                          target.name || target.type
                        }</option>`
                    )
                    .join("")}
                </select>
                <button class="add-rel-btn" onclick="sceneGraphManager.addRelationshipFromUI('${
                  obj.id
                }')">Add</button>
              </div>
            </div>
            
            <!-- Existing Relationships -->
            ${
              relationships.length > 0
                ? `
              <div class="existing-relationships">
                <h5>Relationships (${relationships.length})</h5>
                <div class="relationships-list">
                  ${relationships
                    .map((rel) => {
                      const isSource = rel.sourceObjectId === obj.id;
                      const otherObjectId = isSource
                        ? rel.targetObjectId
                        : rel.sourceObjectId;
                      const otherObject = this.identifiedObjects.find(
                        (o) => o.id === otherObjectId
                      );
                      const relationType =
                        this.relationshipTypes[rel.relationshipType];
                      const displayLabel = isSource
                        ? relationType?.label
                        : relationType?.inverse;
                      return `
                      <div class="relationship-item">
                        <span class="rel-description">
                          <span class="rel-color-indicator" style="background-color: #${(
                            this.relationshipColors[rel.relationshipType] ||
                            0x2196f3
                          )
                            .toString(16)
                            .padStart(
                              6,
                              "0"
                            )}; width: 12px; height: 12px; display: inline-block; border-radius: 50%; margin-right: 5px;"></span>
                          ${displayLabel || rel.relationshipType} 
                          <strong>${
                            otherObject?.name || otherObject?.type || "Unknown"
                          }</strong>
                        </span>
                        <button class="remove-rel-btn" onclick="sceneGraphManager.removeObjectRelationship('${
                          rel.id
                        }')" 
                                title="Remove relationship">×</button>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;
    });

    html += "</div>";
    listElement.innerHTML = html;
  }
  // Update the object count display
  updateObjectCount() {
    const countElement = document.getElementById("object-count");
    if (countElement) {
      countElement.textContent = `Identified Objects: ${this.identifiedObjects.length} | Relationships: ${this.objectRelationships.length}`;
    }
  }

  // Animation function to update markers (currently does nothing as markers are static)
  animate(delta) {
    // Currently no animations for markers as they are static
    // This method is kept for future enhancements
  }

  // ======== LAYERED ARCHITECTURE VIEW METHODS ========
  // Toggle the layered architecture view
  toggleLayeredView() {
    this.layeredViewEnabled = !this.layeredViewEnabled;

    const toggleButton = document.getElementById("toggle-layered-view");
    if (toggleButton) {
      toggleButton.classList.toggle("active", this.layeredViewEnabled);
      toggleButton.textContent = this.layeredViewEnabled
        ? "Exit Layered View"
        : "Layered View";
    }

    if (this.layeredViewEnabled) {
      this.showLayeredView();
    } else {
      this.hideLayeredView();
    }
  }
  showLayeredView() {
    if (!this.scene) return;

    this.createBuildingRootNode();
    // Don't arrange objects in layers - keep them at original positions
    this.drawRelationshipLines();
    this.showRelationshipColorLegend();
  }
  hideLayeredView() {
    if (!this.scene) return;

    // Remove building root node
    if (this.buildingRootNode) {
      this.scene.remove(this.buildingRootNode);
      this.buildingRootNode = null;
    }

    // Remove all relationship lines
    this.relationshipLines.forEach((line) => {
      this.scene.remove(line);
    });
    this.relationshipLines = [];

    // Hide relationship color legend
    this.hideRelationshipColorLegend();

    // No need to reset object positions since we're keeping them at original locations
  }

  // Initialize object relationships system
  initializeRelationships() {
    this.loadRelationships();
    this.setupRelationshipUI();
  }
  createBuildingRootNode() {
    if (!this.scene) return;

    // Remove existing building root node
    if (this.buildingRootNode) {
      this.scene.remove(this.buildingRootNode);
    }

    // Create building root node at center of plan, 7 meters above
    const centerX = this.planDimensions.x / 2;
    const centerZ = this.planDimensions.y / 2;
    const height = 7; // 7 meters above ground
    // Create a distinctive building root node
    const geometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0x4caf50, // Green color for building root
      transparent: true,
      opacity: 0.8,
    });

    this.buildingRootNode = new THREE.Mesh(geometry, material);
    this.buildingRootNode.position.set(centerX, height, centerZ);

    // Add text label for the building root
    if (window.FontLoader && window.TextGeometry) {
      const loader = new window.FontLoader();
      loader.load(
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        (font) => {
          const textGeometry = new window.TextGeometry("BUILDING", {
            font: font,
            size: 0.2,
            height: 0.02,
          });

          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          // Position text above the building root node
          textMesh.position.set(-0.5, 0.6, 0);
          this.buildingRootNode.add(textMesh);
        }
      );
    }

    this.scene.add(this.buildingRootNode);
  }

  arrangeObjectsInLayers() {
    if (!this.identifiedObjects.length) return;

    // Clear existing layer groups
    this.layerGroups.clear();

    // Organize objects into hierarchy layers
    const rootObjects = this.getRootObjects();
    const processedObjects = new Set();

    // Layer 0: Root objects (no parents)
    this.layerGroups.set(0, rootObjects);
    rootObjects.forEach((obj) => processedObjects.add(obj.id));

    // Layer 1+: Objects with parents
    let currentLayer = 1;
    let hasMoreLayers = true;

    while (hasMoreLayers && currentLayer < 5) {
      // Limit to 5 layers to prevent infinite loops
      const layerObjects = [];

      this.identifiedObjects.forEach((obj) => {
        if (processedObjects.has(obj.id)) return;
        // Check if this object has a parent in the previous layer
        const hasParentInPreviousLayer = this.objectRelationships.some(
          (rel) => {
            const parentLayer = currentLayer - 1;
            const parentObjects = this.layerGroups.get(parentLayer) || [];
            return (
              (rel.targetObjectId === obj.id &&
                parentObjects.some(
                  (parent) => parent.id === rel.sourceObjectId
                )) ||
              (rel.sourceObjectId === obj.id &&
                parentObjects.some(
                  (parent) => parent.id === rel.targetObjectId
                ))
            );
          }
        );

        if (hasParentInPreviousLayer) {
          layerObjects.push(obj);
          processedObjects.add(obj.id);
        }
      });

      if (layerObjects.length > 0) {
        this.layerGroups.set(currentLayer, layerObjects);
        currentLayer++;
      } else {
        hasMoreLayers = false;
      }
    }

    // Position objects in their respective layers
    this.layerGroups.forEach((objects, layer) => {
      this.positionObjectsInLayer(objects, layer);
    });
  }
  getRootObjects() {
    // Objects that have no incoming relationships (no parents)
    const childIds = new Set();
    this.objectRelationships.forEach((rel) => {
      childIds.add(rel.targetObjectId);
    });

    return this.identifiedObjects.filter((obj) => !childIds.has(obj.id));
  }

  positionObjectsInLayer(objects, layer) {
    if (!objects.length) return;

    const radius = 2 + layer * 1.5; // Increasing radius for each layer
    const height = 1 + layer * 0.5; // Slightly increasing height
    const angleStep = (2 * Math.PI) / objects.length;

    const centerX = this.planDimensions.x / 2;
    const centerZ = this.planDimensions.y / 2;

    objects.forEach((obj, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const z = centerZ + radius * Math.sin(angle);
      // Find the corresponding marker and update its position
      const markerData = this.objectMarkers.find(
        (marker) => marker.id === obj.id
      );
      if (markerData && markerData.marker) {
        markerData.marker.position.set(x, height, z);
      }
    });
  }
  drawRelationshipLines() {
    if (!this.scene) return;

    // Clear existing lines
    this.relationshipLines.forEach((line) => {
      this.scene.remove(line);
    });
    this.relationshipLines = [];

    // Draw lines from building root to all identified objects (since we're not arranging in layers)
    this.identifiedObjects.forEach((obj) => {
      if (this.buildingRootNode) {
        const objPosition = this.getObjectPosition(obj.id);
        if (objPosition) {
          const line = this.createLineBetweenPoints(
            this.buildingRootNode.position,
            objPosition,
            0x4caf50 // Green for building-to-object connections
          );
          if (line) {
            this.relationshipLines.push(line);
            this.scene.add(line);
          }
        }
      }
    }); // Draw lines between related objects
    this.objectRelationships.forEach((rel) => {
      const fromPos = this.getObjectPosition(rel.sourceObjectId);
      const toPos = this.getObjectPosition(rel.targetObjectId);

      if (fromPos && toPos) {
        // Get color based on relationship type
        const relationshipColor =
          this.relationshipColors[rel.relationshipType] || 0x2196f3; // Default to blue if type not found
        const line = this.createLineBetweenPoints(
          fromPos,
          toPos,
          relationshipColor
        );
        if (line) {
          this.relationshipLines.push(line);
          this.scene.add(line);
        }
      }
    });
  }
  createLineBetweenPoints(point1, point2, color = 0xffffff) {
    if (!point1 || !point2) return null;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(point1.x, point1.y, point1.z),
      new THREE.Vector3(point2.x, point2.y, point2.z),
    ]);

    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });

    return new THREE.Line(geometry, material);
  }
  getObjectPosition(objectId) {
    const markerData = this.objectMarkers.find(
      (marker) => marker.id === objectId
    );
    if (markerData && markerData.marker) {
      return markerData.marker.position.clone();
    }
    return null;
  }

  // Update layered view when objects or relationships change
  updateLayeredView() {
    if (this.layeredViewEnabled) {
      this.showLayeredView();
    }
  }

  // Show relationship color legend
  showRelationshipColorLegend() {
    // Remove existing legend if it exists
    this.hideRelationshipColorLegend();

    // Only show legend if there are relationships
    if (this.objectRelationships.length === 0) return;

    const legendContainer = document.createElement("div");
    legendContainer.id = "relationship-color-legend";
    legendContainer.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 8px; z-index: 1001; max-width: 250px;">
        <h5 style="margin: 0 0 10px 0; color: #4CAF50;">Relationship Colors</h5>
        <div style="display: flex; flex-direction: column; gap: 5px;">
          ${Object.entries(this.relationshipTypes)
            .map(([key, value]) => {
              const colorHex =
                "#" +
                (this.relationshipColors[key] || 0x2196f3)
                  .toString(16)
                  .padStart(6, "0");
              return `
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 20px; height: 3px; background-color: ${colorHex}; border-radius: 2px;"></div>
                <span style="font-size: 12px;">${value.label}</span>
              </div>
            `;
            })
            .join("")}
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; padding-top: 5px; border-top: 1px solid #555;">
            <div style="width: 20px; height: 3px; background-color: #4CAF50; border-radius: 2px;"></div>
            <span style="font-size: 12px;">Building Connection</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(legendContainer);
  }

  // Hide relationship color legend
  hideRelationshipColorLegend() {
    const existingLegend = document.getElementById("relationship-color-legend");
    if (existingLegend) {
      existingLegend.remove();
    }
  }

  // Helper method to update object name
  updateObjectName(objectId, newName) {
    const object = this.identifiedObjects.find((obj) => obj.id === objectId);
    if (object) {
      object.name = newName.trim() || object.type;

      // Auto-save
      this.saveToStorage();

      if (this.updateStatus) {
        this.updateStatus(`Updated object name to: ${object.name}`);
      }
    }
  }
  // Toggle relationship panel for an object
  toggleRelationshipPanel(objectId) {
    console.log("toggleRelationshipPanel called with objectId:", objectId);

    const panel = document.getElementById(`rel-panel-${objectId}`);
    console.log("Found panel:", panel);

    if (panel) {
      const isVisible = panel.style.display !== "none";
      panel.style.display = isVisible ? "none" : "block";

      console.log("Panel visibility changed to:", panel.style.display);

      // Update dropdown options when opening
      if (!isVisible) {
        this.updateRelationshipDropdowns(objectId);
      }

      if (this.updateStatus) {
        this.updateStatus(
          `Relationship panel ${
            isVisible ? "hidden" : "shown"
          } for object ${objectId}`
        );
      }
    } else {
      console.error("Relationship panel not found for objectId:", objectId);
      if (this.updateStatus) {
        this.updateStatus("Error: Relationship panel not found");
      }
    }
  }

  // Update relationship dropdowns for an object
  updateRelationshipDropdowns(objectId) {
    const targetSelect = document.getElementById(`target-obj-${objectId}`);
    if (targetSelect) {
      // Clear and repopulate target objects
      targetSelect.innerHTML =
        '<option value="">Select target object...</option>';

      this.identifiedObjects
        .filter((obj) => obj.id !== objectId)
        .forEach((obj) => {
          const option = document.createElement("option");
          option.value = obj.id;
          option.textContent = obj.name || obj.type;
          targetSelect.appendChild(option);
        });
    }
  }
  // Add relationship from UI
  addRelationshipFromUI(sourceObjectId) {
    console.log(
      "addRelationshipFromUI called with sourceObjectId:",
      sourceObjectId
    );

    const relationTypeSelect = document.getElementById(
      `rel-type-${sourceObjectId}`
    );
    const targetObjectSelect = document.getElementById(
      `target-obj-${sourceObjectId}`
    );

    console.log("Relationship UI elements:", {
      relationTypeSelect,
      targetObjectSelect,
    });

    if (!relationTypeSelect || !targetObjectSelect) {
      console.error("Relationship UI elements not found");
      if (this.updateStatus) {
        this.updateStatus("Error: Relationship UI elements not found");
      }
      return;
    }

    const relationshipType = relationTypeSelect.value;
    const targetObjectId = targetObjectSelect.value;

    console.log("Relationship data:", {
      relationshipType,
      targetObjectId,
      sourceObjectId,
    });

    if (!targetObjectId) {
      if (this.updateStatus) {
        this.updateStatus("Please select a target object for the relationship");
      }
      return;
    }

    // Add the relationship
    const relationship = this.addObjectRelationship(
      sourceObjectId,
      targetObjectId,
      relationshipType
    );

    if (relationship) {
      // Reset the form
      targetObjectSelect.value = "";

      // Refresh the UI
      this.updateIdentifiedObjectsList();

      if (this.updateStatus) {
        this.updateStatus(
          `Successfully added relationship: ${relationship.description}`
        );
      }
    } else {
      if (this.updateStatus) {
        this.updateStatus("Failed to add relationship");
      }
    }
  }

  // Export the scene graph to a file
  exportSceneGraph() {
    const data = {
      objects: this.identifiedObjects,
      relationships: this.objectRelationships,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `scene_graph_${this.currentSceneId}.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Get saved scenes from localStorage
  getSavedScenes() {
    const scenes = [];
    const prefix = "scene_graph_";
    const sceneKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(prefix)
    );

    sceneKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.sceneId) {
          scenes.push({
            id: data.sceneId,
            timestamp: data.timestamp,
            objectCount: data.objects ? data.objects.length : 0,
            relationshipCount: data.relationships
              ? data.relationships.length
              : 0,
          });
        }
      } catch (error) {
        console.error("Error parsing scene data from storage:", error);
      }
    });

    // Sort by timestamp (newest first)
    scenes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return scenes;
  }

  // Create a new scene
  createNewScene() {
    // Prompt for scene name
    const sceneName = prompt("Enter scene name:", "Untitled Scene");
    if (!sceneName) return;

    // Generate a unique ID for the new scene
    const newSceneId = `scene_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create an empty scene data structure
    const newSceneData = {
      id: newSceneId,
      timestamp: new Date().toISOString(),
      objects: [],
      relationships: [],
    };

    // Save to localStorage
    localStorage.setItem(
      `scene_graph_${newSceneId}`,
      JSON.stringify(newSceneData)
    );

    // Update current scene ID
    this.currentSceneId = newSceneId;
    localStorage.setItem("current_scene_id", newSceneId);

    // Refresh session list and UI
    this.refreshSessionList();
    this.updateCurrentSceneDisplay();

    if (this.updateStatus) {
      this.updateStatus(`New scene created: ${sceneName}`);
    }
  }

  // Switch to a saved scene
  switchToScene(sceneId) {
    // Check if the scene exists in storage
    const storageKey = `scene_graph_${sceneId}`;
    if (!localStorage.getItem(storageKey)) {
      console.error("Scene not found in storage:", sceneId);
      return;
    }

    // Save current scene before switching
    this.saveToStorage();

    // Switch to the selected scene
    this.currentSceneId = sceneId;
    localStorage.setItem("current_scene_id", sceneId);

    // Clear current objects and load new scene data
    this.clearAllObjects();
    this.loadFromStorage();

    // Update UI
    this.updateCurrentSceneDisplay();

    if (this.updateStatus) {
      this.updateStatus(`Switched to scene: ${sceneId}`);
    }
  }

  // Delete a saved scene
  deleteSavedScene(sceneId) {
    const storageKey = `scene_graph_${sceneId}`;
    if (localStorage.getItem(storageKey)) {
      localStorage.removeItem(storageKey);
      console.log("Scene deleted:", sceneId);

      // Refresh session list
      this.refreshSessionList();

      // If the deleted scene was the current scene, switch to default
      if (sceneId === this.currentSceneId) {
        this.currentSceneId = null;
        this.clearAllObjects();
        this.updateCurrentSceneDisplay();
      }

      if (this.updateStatus) {
        this.updateStatus(`Scene deleted: ${sceneId}`);
      }
    } else {
      console.error("Scene not found:", sceneId);
    }
  }
  // Import scene graph from a file
  importSceneGraph() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);

            // Validate the data structure
            if (data.objects && Array.isArray(data.objects)) {
              // Clear existing data
              this.clearAllObjects();

              // Import objects with proper data structure conversion
              data.objects.forEach((obj) => {
                const objectData = {
                  id: obj.id,
                  type: obj.type,
                  name: obj.name || obj.type,
                  position: new THREE.Vector3(
                    obj.position.x,
                    obj.position.y,
                    obj.position.z
                  ),
                  normal: obj.normal
                    ? new THREE.Vector3(
                        obj.normal.x,
                        obj.normal.y,
                        obj.normal.z
                      )
                    : new THREE.Vector3(0, 1, 0),
                  meshName: obj.meshName || "imported",
                  timestamp: obj.timestamp || new Date().toISOString(),
                  metadata: obj.metadata || {},
                };

                this.identifiedObjects.push(objectData);
                this.createObjectMarker(objectData);
              });

              // Import relationships if they exist
              if (data.relationships && Array.isArray(data.relationships)) {
                this.objectRelationships = data.relationships.map((rel) => ({
                  id: rel.id,
                  sourceObjectId: rel.sourceObjectId || rel.fromObject,
                  targetObjectId: rel.targetObjectId || rel.toObject,
                  relationshipType: rel.relationshipType || rel.type,
                  description:
                    rel.description ||
                    `${rel.relationshipType || rel.type} relationship`,
                  timestamp: rel.timestamp || new Date().toISOString(),
                  metadata: rel.metadata || {},
                }));
              } else {
                this.objectRelationships = [];
              }

              // Update UI
              this.updateIdentifiedObjectsList();
              this.updateObjectCount();

              // Update layered view if active
              if (this.layeredViewEnabled) {
                this.updateLayeredView();
              }

              // Save to localStorage
              this.saveToStorage();

              if (this.updateStatus) {
                this.updateStatus(
                  `Scene graph imported: ${this.identifiedObjects.length} objects, ${this.objectRelationships.length} relationships`
                );
              }
            } else {
              if (this.updateStatus) {
                this.updateStatus(
                  "Invalid file format. Please select a valid scene graph JSON file."
                );
              }
            }
          } catch (error) {
            console.error("Error importing scene graph:", error);
            if (this.updateStatus) {
              this.updateStatus(
                "Error importing file. Please check the file format."
              );
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// Create a global instance
const sceneGraphManager = new SceneGraphManager();

// Global initialization function for backward compatibility
function initialize() {
  // Try to get global dependencies from the 3D viewer
  const dependencies = {
    scene: window.scene,
    camera: window.camera,
    renderer: window.renderer,
    loadedModel: window.loadedModel,
    updateStatus: window.updateStatus,
  };

  return sceneGraphManager.init(dependencies);
}

// Export for module usage if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = SceneGraphManager;
}
