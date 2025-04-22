const boatRoute = [
    [-73.9328, 40.8687], [-73.9336, 40.8694], [-73.9449, 40.8786], [-73.9459, 40.8789],
    [-73.9451, 40.8783], [-73.9482, 40.8703], [-73.9576, 40.8529], [-73.9649, 40.8405],
    [-73.9687, 40.8287], [-73.9697, 40.8279], [-73.9694, 40.8267], [-73.9625, 40.8206],
    [-73.9612, 40.8195], [-73.9618, 40.8214], [-73.9536, 40.8334], [-73.9477, 40.8438],
    [-73.9482, 40.8507], [-73.9437, 40.8544], [-73.9343, 40.8683], [-73.9328, 40.8687],
];

const totalBoats = 3;
const speed = 0.0025; // 更小的步长，防止跳跃
const launchInterval = 13000; // 每隔 13 秒发出一艘船
const boatFleet = [];
const routeLine = turf.lineString(boatRoute);
const stopDuration = 4000; // 码头停留时间（毫秒）

// **码头数据**
const updatedPiersGeoJSON = {
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

// **创建 Piers 图标（使用 Font Awesome ⚓）**
function createPiersIcon() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-anchor" style="font-size:16px; color:#3876b0;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.textAlign = 'center';
    return el;
}

// **添加码头**
function addPiersToMap() {
    updatedPiersGeoJSON.features.forEach(feature => { // ✅ 这里改正确
        const el = createPiersIcon();
        new mapboxgl.Marker({ element: el })
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
    });
}

// **创建船的 Font Awesome 图标**
function createBoatIcon() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-ship" style="font-size:14px; color:#9677bf;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.textAlign = 'center';
    return el;
}

// **添加船只**
function addBoatsToMap() {
    boatFleet.forEach(boat => {
        if (!boat.marker) {
            boat.marker = new mapboxgl.Marker({ element: createBoatIcon() })
                .setLngLat(boat.position)
                .addTo(map);
        }
    });
}

function animateBoats() {
    boatFleet.forEach(boat => {
        if (boat.paused) return; // 如果船暂停，就不动

        let currentIndex = Math.floor(boat.currentDistance);
        let nextIndex = currentIndex + 1;

        if (nextIndex >= boatRoute.length) {
            boat.currentDistance = 0; // 重新回到起点
            boat.hasPaused = {}; // **重置停留状态，防止只停留一次**
            return;
        }

        let [lng1, lat1] = boatRoute[currentIndex];
        let [lng2, lat2] = boatRoute[nextIndex];

        // 计算插值点
        let t = (boat.currentDistance - currentIndex);
        let interpolatedLng = lng1 + (lng2 - lng1) * t;
        let interpolatedLat = lat1 + (lat2 - lat1) * t;
        boat.position = [interpolatedLng, interpolatedLat];

        // **检查是否到达码头**
        updatedPiersGeoJSON.features.forEach(pier => { // ✅ 使用正确的变量
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

        boat.currentDistance += speed;
    });

    requestAnimationFrame(animateBoats);
}

// **启动动画**
requestAnimationFrame(animateBoats);

// **定期发射船只**
function launchBoats() {
    let launched = 0;

    // **第一艘船立即启动**
    const firstBoatId = `boat${launched + 1}`;
    const firstBoat = {
        id: firstBoatId,
        position: [...boatRoute[0]],
        currentDistance: 0,
        marker: null,
        hasPaused: {} // **初始化，确保每个码头可以单独停靠**
    };
    boatFleet.push(firstBoat);
    addBoatsToMap();
    launched++;

    // **后续船只按 15 秒间隔发射**
    const interval = setInterval(() => {
        if (launched >= totalBoats) {
            clearInterval(interval);
            return;
        }
        const boatId = `boat${launched + 1}`;
        const newBoat = {
            id: boatId,
            position: [...boatRoute[0]],
            currentDistance: 0,
            marker: null,
            hasPaused: {} // **初始化，确保每个码头可以单独停靠**
        };
        boatFleet.push(newBoat);
        addBoatsToMap();
        launched++;
    }, launchInterval);
}

// **确保 `launchBoats()` 和 `addPiersToMap()` 在地图加载后执行**
map.on("load", () => {
    launchBoats();
    addPiersToMap();
});
