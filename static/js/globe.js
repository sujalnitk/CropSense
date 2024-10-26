Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1N2NjMTAzMS0zM2EwLTRmODMtYTg0ZS0zZGQzNmZiYTVjM2IiLCJpZCI6MjQ5NjUwLCJpYXQiOjE3Mjk1ODMyNTZ9.ne0fS_mWlF_W274p1n7xYKVA3FsFkxQdndf2uNj4hrc';

//WTF ISS THHIS SHITTT!
//BRUH I DON'T KNOW WHAT IM DOING!!!

const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain({
        requestWaterMask: false,
        requestVertexNormals: false,
    }),
    
    imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),

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
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
});

viewer.scene.globe.maximumScreenSpaceError = 2;
viewer.scene.globe.imageryLayers.get(0).imageryProvider.maximumLevel = 10;
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = 1 / 30;
// Optimization for rendering tiles on zoom
viewer.scene.globe.tileCacheSize = 100;
viewer.scene.globe.preloadSiblings = false;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
viewer.scene.globe.tileLoadProgressEvent.addEventListener(function(queuedTiles) {
    if (queuedTiles === 0) {
        viewer.scene.globe.maximumScreenSpaceError = 1.5;
    } else {
        viewer.scene.globe.maximumScreenSpaceError = 4;
    }
});

viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 20000000),
});

function cartesianToLonLat(cartesian) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;
    return { longitude, latitude, height };
}

let lastMarker = null;

const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

clickHandler.setInputAction(function (click) {
    const pickedPosition = viewer.scene.pickPosition(click.position);

    if (Cesium.defined(pickedPosition)) {
        const { longitude, latitude } = cartesianToLonLat(pickedPosition);

        // console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);

        if (lastMarker) {
            viewer.entities.remove(lastMarker);
        }

        lastMarker = viewer.entities.add({
            position: pickedPosition,
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
            },
            description: `Coordinates: [Longitude: ${longitude}, Latitude: ${latitude}]`,
        });

        const infoBox = document.getElementById('location-info-box');
        const coordsText = document.getElementById('location-coordinates');
        coordsText.innerHTML = `Longitude: ${longitude.toFixed(6)}<br>Latitude: ${latitude.toFixed(6)}`;
        infoBox.style.display = 'block';

        const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pickedPosition);

        if (screenPosition) {
            infoBox.style.left = `${screenPosition.x + 15}px`;
            infoBox.style.top = `${screenPosition.y - 30}px`;
        }
        document.getElementById('confirm-location-btn').onclick = function () {
            window.location.href = `region-data?lat=${latitude}&lon=${longitude}`;
        };
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
