const boatRoute4 = [
    [-73.9324, 40.8240], [-73.9328, 40.8239], [-73.9340, 40.8227], [-73.9337, 40.8186],
    [-73.9337, 40.8147], [-73.9342, 40.8099], [-73.9336, 40.8081], [-73.9300, 40.8036],
    [-73.9285, 40.7997], [-73.9291, 40.7950], [-73.9351, 40.7905], [-73.9362, 40.7889],
    [-73.9371, 40.7878], [-73.9405, 40.7839], [-73.9423, 40.7811], [-73.9390, 40.7716],
    [-73.9358, 40.7718], [-73.9378, 40.7724], [-73.9389, 40.7769], [-73.9363, 40.7821],
    [-73.9362, 40.7859], [-73.9316, 40.7911], [-73.9279, 40.7941], [-73.9273, 40.7956],
    [-73.9279, 40.7976], [-73.9276, 40.7988], [-73.9271, 40.8018], [-73.9292, 40.8042],
    [-73.9318, 40.8075], [-73.9327, 40.8089], [-73.9331, 40.8105], [-73.9327, 40.8147],
    [-73.9326, 40.8180], [-73.9328, 40.8203], [-73.9329, 40.8234], [-73.9324, 40.8240]
];

const totalBoats4 = 3;
const speed4 = 0.0025;
const launchInterval4 = 13000;
const boatFleet4 = [];
const routeLine4 = turf.lineString(boatRoute4);
const stopDuration4 = 4000;

// **使用 `boat1-1.js` 里的码头数据**
const updatedPiersGeoJSON4 = updatedPiersGeoJSON;

function createBoatIcon4() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-ship" style="font-size:14px; color:#9677bf;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.textAlign = 'center';
    return el;
}

function addBoatsToMap4() {
    boatFleet4.forEach(boat => {
        if (!boat.marker) {
            boat.marker = new mapboxgl.Marker({ element: createBoatIcon4() })
                .setLngLat(boat.position)
                .addTo(map);
        }
    });
}

function animateBoats4() {
    boatFleet4.forEach(boat => {
        if (boat.paused) return;

        let currentIndex = Math.floor(boat.currentDistance);
        let nextIndex = currentIndex + 1;

        if (nextIndex >= boatRoute4.length) {
            boat.currentDistance = 0;
            return;
        }

        let [lng1, lat1] = boatRoute4[currentIndex];
        let [lng2, lat2] = boatRoute4[nextIndex];

        let t = (boat.currentDistance - currentIndex);
        let interpolatedLng = lng1 + (lng2 - lng1) * t;
        let interpolatedLat = lat1 + (lat2 - lat1) * t;
        boat.position = [interpolatedLng, interpolatedLat];

        // **检查是否到达码头**
        updatedPiersGeoJSON4.features.forEach(pier => {
            const [pierLng, pierLat] = pier.geometry.coordinates;

            const stopDistance = 0.000007; // 码头停靠范围

            if (!boat.hasPaused[pier.properties.name] &&
                Math.abs(interpolatedLng - pierLng) < stopDistance &&
                Math.abs(interpolatedLat - pierLat) < stopDistance) {

                boat.paused = true;
                boat.hasPaused[pier.properties.name] = true;

                setTimeout(() => {
                    boat.paused = false;
                }, stopDuration4);
            }
        });

        // **更新船的位置**
        if (boat.marker) {
            boat.marker.setLngLat(boat.position);
        }

        boat.currentDistance += speed4;
    });

    requestAnimationFrame(animateBoats4);
}

// **启动动画**
requestAnimationFrame(animateBoats4);

// **定期发射船只**
function launchBoats4() {
    let launched = 0;

    const firstBoat = {
        id: `boat4_${launched + 1}`,
        position: [...boatRoute4[0]],
        currentDistance: 0,
        marker: null,
        hasPaused: {}
    };

    boatFleet4.push(firstBoat);
    addBoatsToMap4();
    launched++;

    const interval = setInterval(() => {
        if (launched >= totalBoats4) {
            clearInterval(interval);
            return;
        }
        const boatId = `boat4_${launched + 1}`;
        const newBoat = {
            id: boatId,
            position: [...boatRoute4[0]],
            currentDistance: 0,
            marker: null,
            hasPaused: {}
        };
        boatFleet4.push(newBoat);
        addBoatsToMap4();
        launched++;
    }, launchInterval4);
}

// **确保 `launchBoats4()` 在地图加载后执行**
map.on("load", () => {
    launchBoats4();
});

