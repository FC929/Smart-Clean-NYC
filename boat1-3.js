const boatRoute3 = [
    [-73.9613, 40.7419], [-73.9623, 40.7421], [-73.9697, 40.7439], [-73.9707, 40.7439],
    [-73.9705, 40.7432], [-73.9713, 40.7329], [-73.9729, 40.7320], [-73.9713, 40.7314],
    [-73.9702, 40.7282], [-73.9725, 40.7191], [-73.9766, 40.7096], [-73.9867, 40.7085],
    [-73.9883, 40.7093], [-73.9896, 40.7083], [-74.0006, 40.7050], [-74.0029, 40.7042],
    [-74.0021, 40.7042], [-73.9964, 40.7038], [-73.9958, 40.7037], [-73.9956, 40.7043],
    [-73.9930, 40.7051], [-73.9863, 40.7058], [-73.9762, 40.7067], [-73.9728, 40.7094],
    [-73.9712, 40.7090], [-73.9702, 40.7087], [-73.9709, 40.7097], [-73.9685, 40.7167],
    [-73.9657, 40.7222], [-73.9633, 40.7246], [-73.9639, 40.7302], [-73.9637, 40.7314],
    [-73.9643, 40.7322], [-73.9629, 40.7407], [-73.9613, 40.7418]
];

const totalBoats3 = 4;
const speed3 = 0.0025;
const launchInterval3 = 13000;
const boatFleet3 = [];
const routeLine3 = turf.lineString(boatRoute3);
const stopDuration3 = 4000;

// **使用 `boat1-1.js` 里的码头数据**
const updatedPiersGeoJSON3 = updatedPiersGeoJSON;

function createBoatIcon3() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-ship" style="font-size:14px; color:#9677bf;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.textAlign = 'center';
    return el;
}

function addBoatsToMap3() {
    boatFleet3.forEach(boat => {
        if (!boat.marker) {
            boat.marker = new mapboxgl.Marker({ element: createBoatIcon3() })
                .setLngLat(boat.position)
                .addTo(map);
        }
    });
}

function animateBoats3() {
    boatFleet3.forEach(boat => {
        if (boat.paused) return;

        let currentIndex = Math.floor(boat.currentDistance);
        let nextIndex = currentIndex + 1;

        if (nextIndex >= boatRoute3.length) {
            boat.currentDistance = 0;
            return;
        }

        let [lng1, lat1] = boatRoute3[currentIndex];
        let [lng2, lat2] = boatRoute3[nextIndex];

        let t = (boat.currentDistance - currentIndex);
        let interpolatedLng = lng1 + (lng2 - lng1) * t;
        let interpolatedLat = lat1 + (lat2 - lat1) * t;
        boat.position = [interpolatedLng, interpolatedLat];

        // **检查是否到达码头**
        updatedPiersGeoJSON3.features.forEach(pier => {
            const [pierLng, pierLat] = pier.geometry.coordinates;

            const stopDistance = 0.000007; // 码头停靠范围

            if (!boat.hasPaused[pier.properties.name] &&
                Math.abs(interpolatedLng - pierLng) < stopDistance &&
                Math.abs(interpolatedLat - pierLat) < stopDistance) {

                boat.paused = true;
                boat.hasPaused[pier.properties.name] = true;

                setTimeout(() => {
                    boat.paused = false;
                }, stopDuration3);
            }
        });

        // **更新船的位置**
        if (boat.marker) {
            boat.marker.setLngLat(boat.position);
        }

        boat.currentDistance += speed3;
    });

    requestAnimationFrame(animateBoats3);
}

// **启动动画**
requestAnimationFrame(animateBoats3);

// **定期发射船只**
function launchBoats3() {
    let launched = 0;

    const firstBoat = {
        id: `boat3_${launched + 1}`,
        position: [...boatRoute3[0]],
        currentDistance: 0,
        marker: null,
        hasPaused: {}
    };

    boatFleet3.push(firstBoat);
    addBoatsToMap3();
    launched++;

    const interval = setInterval(() => {
        if (launched >= totalBoats3) {
            clearInterval(interval);
            return;
        }
        const boatId = `boat3_${launched + 1}`;
        const newBoat = {
            id: boatId,
            position: [...boatRoute3[0]],
            currentDistance: 0,
            marker: null,
            hasPaused: {}
        };
        boatFleet3.push(newBoat);
        addBoatsToMap3();
        launched++;
    }, launchInterval3);
}

// **确保 `launchBoats3()` 在地图加载后执行**
map.on("load", () => {
    launchBoats3();
});
