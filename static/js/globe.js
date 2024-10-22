Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1N2NjMTAzMS0zM2EwLTRmODMtYTg0ZS0zZGQzNmZiYTVjM2IiLCJpZCI6MjQ5NjUwLCJpYXQiOjE3Mjk1ODMyNTZ9.ne0fS_mWlF_W274p1n7xYKVA3FsFkxQdndf2uNj4hrc';

// Create a Cesium Viewer instance and attach it to the cesiumContainer div
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain({
        requestWaterMask: false,  // Disable water mask to improve performance
        requestVertexNormals: false, // Disable vertex normals for performance unless needed
    }),  // Add realistic terrain
    
    imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),

    // Disable default UI elements
    animation: false,
    timeline: false,
    fullscreenButton: true,
    vrButton: false,
    homeButton: true,
    sceneModePicker: true,
    baseLayerPicker: true,
    geocoder: true,
    navigationHelpButton: true,
    infoBox: true,
    selectionIndicator: true,
    creditsDisplay: false,

    // OPTIMIZATION FOR LOD
    requestRenderMode: true,  // Only render when necessary
    maximumRenderTimeChange: Infinity, // Reduce re-rendering on camera move for better performance
});

// Terrain LOD optimization: Reduce screen space error to control detail levels
viewer.scene.globe.maximumScreenSpaceError = 2;  // Lower values mean higher detail at cost of performance

// Imagery LOD optimization: Control imagery layer tile loading
viewer.scene.globe.imageryLayers.get(0).imageryProvider.maximumLevel = 10; // Limit zoom level to reduce high-res tile loads
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = 1 / 30;
// Optimization for rendering tiles on zoom
viewer.scene.globe.tileCacheSize = 100;  // Limit memory usage by controlling the number of tiles in cache
viewer.scene.globe.preloadSiblings = false;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000; // Limit max zoom out

// Set maximum screen space error for better LOD behavior
viewer.scene.globe.tileLoadProgressEvent.addEventListener(function(queuedTiles) {
    if (queuedTiles === 0) {
        viewer.scene.globe.maximumScreenSpaceError = 1.5; // Increase detail as needed
    } else {
        viewer.scene.globe.maximumScreenSpaceError = 4; // Reduce detail for distant tiles
    }
});

// Optional: Start the globe at a default view
viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 20000000), // Longitude, Latitude, Altitude
});

// ----------------------------------------
// ADD SINGLE MARKER ON CLICK AND GET COORDINATES
// ----------------------------------------

// Function to convert Cartesian3 to Longitude/Latitude
function cartesianToLonLat(cartesian) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;
    return { longitude, latitude, height };
}

// Store reference to the last marker
let lastMarker = null;

// Create a handler for mouse clicks
const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// Add left-click event to capture coordinates and display the info box
clickHandler.setInputAction(function (click) {
    // Get the position in Cartesian3 on the globe
    const pickedPosition = viewer.scene.pickPosition(click.position);

    // Check if the clicked position is valid
    if (Cesium.defined(pickedPosition)) {
        // Convert the Cartesian3 to Longitude/Latitude
        const { longitude, latitude } = cartesianToLonLat(pickedPosition);

        // Log the coordinates
        console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);

        // Remove the previous marker if it exists
        if (lastMarker) {
            viewer.entities.remove(lastMarker);
        }

        // Add a new marker at the clicked location
        lastMarker = viewer.entities.add({
            position: pickedPosition,
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
            },
            description: `Coordinates: [Longitude: ${longitude}, Latitude: ${latitude}]`,
        });

        // Update and display the location info box
        const infoBox = document.getElementById('location-info-box');
        const coordsText = document.getElementById('location-coordinates');
        coordsText.innerHTML = `Longitude: ${longitude.toFixed(6)}<br>Latitude: ${latitude.toFixed(6)}`;
        infoBox.style.display = 'block';

        // Convert the 3D position of the marker to 2D screen coordinates
        const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pickedPosition);

        // Position the info box next to the marker on the screen
        if (screenPosition) {
            infoBox.style.left = `${screenPosition.x + 15}px`; // Offset to the right of the marker
            infoBox.style.top = `${screenPosition.y - 30}px`; // Offset above the marker
        }

        // Add click event listener to the confirm button
        document.getElementById('confirm-location-btn').onclick = function () {
            window.location.href = `region-data?lat=${latitude}&lon=${longitude}`;
        };
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);