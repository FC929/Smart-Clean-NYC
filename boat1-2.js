const boatRoute2 = [
    [-73.9858, 40.7866], [-73.9870, 40.7867], [-74.0095, 40.7766], [-74.0101, 40.7764],
    [-74.0094, 40.7754], [-74.0095, 40.7722], [-74.0193, 40.7536], [-74.0208, 40.7524],
    [-74.0197, 40.7509], [-74.0240, 40.7356], [-74.0263, 40.7345], [-74.0247, 40.7332],
    [-74.0171, 40.7216], [-74.0160, 40.7214], [-74.0167, 40.7224], [-74.0146, 40.7369],
    [-74.0110, 40.7382], [-74.0143, 40.7395], [-74.0121, 40.7511], [-74.0080, 40.7596],
    [-74.0031, 40.7664], [-74.0014, 40.7671], [-74.0020, 40.7689], [-73.9879, 40.7853],
    [-73.9859, 40.7866]
];

const totalBoats2 = 4;
const speed2 = 0.0025;
const launchInterval2 = 13000;
const boatFleet2 = [];
const routeLine2 = turf.lineString(boatRoute2);
const stopDuration2 = 4000;

// **码头数据**
const updatedPiersGeoJSON2 = {
    type: "FeatureCollection",
    features: [
        { "type": "Feature", "properties": { "name": "Dyckman Marina" }, "geometry": { "type": "Point", "coordinates": [-73.9325, 40.8687] } },
        { "type": "Feature", "properties": { "name": "West Harlem Piers" }, "geometry": { "type": "Point", "coordinates": [-73.9612, 40.8195] } },
        { "type": "Feature", "properties": { "name": "Pier A Walkway" }, "geometry": { "type": "Point", "coordinates": [-73.9858, 40.7866] } },
        { "type": "Feature", "properties": { "name": "Pier 88" }, "geometry": { "type": "Point", "coordinates": [-74.0014, 40.7671] } },
        { "type": "Feature", "properties": { "name": "Pier 51" }, "geometry": { "type": "Point", "coordinates": [-74.0110, 40.7382] } },
        { "type": "Feature", "properties": { "name": "Pier 26" }, "geometry": { "type": "Point", "coordinates": [-74.0156, 40.7214] } },
        { "type": "Feature", "properties": { "name": "Pier 15" }, "geometry": { "type": "Point", "coordinates": [-74.0029, 40.7042] } },
        { "type": "Feature", "properties": { "name": "Pier 35" }, "geometry": { "type": "Point", "coordinates": [-73.9884, 40.7094] } },
        { "type": "Feature", "properties": { "name": "Stuyvesant Cove" }, "geometry": { "type": "Point", "coordinates": [-73.9730, 40.7320] } },
        { "type": "Feature", "properties": { "name": "Seastreak East 35th Street Dock" }, "geometry": { "type": "Point", "coordinates": [-73.9707, 40.7439] } },
        { "type": "Feature", "properties": { "name": "Englewood Marina, LLC" }, "geometry": { "type": "Point", "coordinates": [-73.9459, 40.8789] } },
        { "type": "Feature", "properties": { "name": "Grand Cove Marina" }, "geometry": { "type": "Point", "coordinates": [-73.9697, 40.8279] } },
        { "type": "Feature", "properties": { "name": "Ferry Port" }, "geometry": { "type": "Point", "coordinates": [-74.0101, 40.7764] } },
        { "type": "Feature", "properties": { "name": "Hoboken 14th Street" }, "geometry": { "type": "Point", "coordinates": [-74.0212, 40.7525] } },
        { "type": "Feature", "properties": { "name": "Hoboken / NJ Transit Terminal" }, "geometry": { "type": "Point", "coordinates": [-74.0264, 40.7346] } },
        { "type": "Feature", "properties": { "name": "Hunters Point South" }, "geometry": { "type": "Point", "coordinates": [-73.9613, 40.7418] } },
        { "type": "Feature", "properties": { "name": "Astoria" }, "geometry": { "type": "Point", "coordinates": [-73.9357, 40.7718] } },
        { "type": "Feature", "properties": { "name": "Greenpoint" }, "geometry": { "type": "Point", "coordinates": [-73.9633, 40.7315] } },
        { "type": "Feature", "properties": { "name": "South Williamsburg" }, "geometry": { "type": "Point", "coordinates": [-73.9702, 40.7086] } },
        { "type": "Feature", "properties": { "name": "DUMBO" }, "geometry": { "type": "Point", "coordinates": [-73.9958, 40.7037] } },
        { "type": "Feature", "properties": { "name": "Pier 5" }, "geometry": { "type": "Point", "coordinates": [-73.9324, 40.8240] } },
        { "type": "Feature", "properties": { "name": "Pier 107 CVII" }, "geometry": { "type": "Point", "coordinates": [-73.9363, 40.7889] } }
    ]
};

// **创建船的 Font Awesome 图标**
function createBoatIcon2() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-ship" style="font-size:14px; color:#9677bf;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.textAlign = 'center';
    return el;
}

// **添加船只**
function addBoatsToMap2() {
    boatFleet2.forEach(boat => {
        if (!boat.marker) {
            boat.marker = new mapboxgl.Marker({ element: createBoatIcon2() })
                .setLngLat(boat.position)
                .addTo(map);
        }
    });
}

function animateBoats2() {
    boatFleet2.forEach(boat => {
        if (boat.paused) return;

        let currentIndex = Math.floor(boat.currentDistance);
        let nextIndex = currentIndex + 1;

        if (nextIndex >= boatRoute2.length) {  // ✅ 修正
            boat.currentDistance = 0;
            boat.hasPaused = {};
            return;
        }

        let [lng1, lat1] = boatRoute2[currentIndex];
        let [lng2, lat2] = boatRoute2[nextIndex];

        let t = (boat.currentDistance - currentIndex);
        let interpolatedLng = lng1 + (lng2 - lng1) * t;
        let interpolatedLat = lat1 + (lat2 - lat1) * t;
        boat.position = [interpolatedLng, interpolatedLat];

        // **检查是否到达码头**
        updatedPiersGeoJSON2.features.forEach(pier => { // ✅ 使用正确的变量
            const [pierLng, pierLat] = pier.geometry.coordinates;

            const stopDistance = 0.000007; // 码头停靠范围（调小更精准，调大更宽松）

            if (!boat.hasPaused[pier.properties.name] &&
                Math.abs(interpolatedLng - pierLng) < stopDistance &&
                Math.abs(interpolatedLat - pierLat) < stopDistance) {

                boat.paused = true;
                boat.hasPaused[pier.properties.name] = true; // **标记这个码头已经停靠过**
                
                setTimeout(() => {
                    boat.paused = false;
                }, stopDuration);
            }
        });

        // **更新船的位置**
        if (boat.marker) {
            boat.marker.setLngLat(boat.position);
        }

        boat.currentDistance += speed2;  // ✅ 修正
    });

    requestAnimationFrame(animateBoats2);
}

// **启动动画**
requestAnimationFrame(animateBoats2);

// **定期发射船只**
function launchBoats2() {
    let launched = 0;

    const firstBoat = {
        id: `boat2_${launched + 1}`,
        position: [...boatRoute2[0]],  // ✅ 修正
        currentDistance: 0,
        marker: null,
        hasPaused: {}
    };

    boatFleet2.push(firstBoat);  // ✅ 修正
    addBoatsToMap2();  // ✅ 修正
    launched++;

    const interval = setInterval(() => {
        if (launched >= totalBoats2) {  // ✅ 修正
            clearInterval(interval);
            return;
        }
        const boatId = `boat2_${launched + 1}`;
        const newBoat = {
            id: boatId,
            position: [...boatRoute2[0]],  // ✅ 修正
            currentDistance: 0,
            marker: null,
            hasPaused: {}
        };
        boatFleet2.push(newBoat);  // ✅ 修正
        addBoatsToMap2();
        launched++;
    }, launchInterval2);
}

// 确保 `launchBoats2()` 在地图加载后执行
map.on("load", () => {
    launchBoats2();
});