
let restaurantFeatures = [];

function setupSearchBox(features) {
    const searchInput = document.getElementById('restaurantSearch');
    const suggestionBox = document.getElementById('suggestions');

    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        suggestionBox.innerHTML = '';

        if (!query) {
            suggestionBox.style.display = 'none';
            return;
        }

        const matches = features.filter(f =>
            f.properties.title.toLowerCase().includes(query)
        ).slice(0, 10);

        if (matches.length === 0) {
            suggestionBox.style.display = 'none';
            return;
        }

        matches.forEach(match => {
            const div = document.createElement('div');
            div.textContent = `${match.properties.title} — ${match.properties.street} (${match.properties.zipcode})`;
            div.style.padding = '6px 10px';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #eee';

            div.addEventListener('click', () => {
                const coords = match.geometry.coordinates;
                const title = match.properties.title;
                const street = match.properties.street;
                const zipcode = match.properties.zipcode;
            
                map.flyTo({ center: coords, zoom: 15 });
            
                new mapboxgl.Popup()
                .setLngLat(coords)
                .setHTML(`<strong>${title}</strong><br/>Street: ${street}<br/>Zipcode: ${zipcode}<br/>Cuisine: ${match.properties.cuisine || 'Nah'}`)
                .addTo(map);
                       
            
                suggestionBox.style.display = 'none';
                searchInput.value = title;
            });            

            suggestionBox.appendChild(div);
        });

        suggestionBox.style.display = 'block';
    });
}


async function loadRestaurantsGeoJSON() {
    const response = await fetch('Manhattan_Restaurants.csv');
    const text = await response.text();
    const rows = text.split('\n');

    const geojson = {
        type: 'FeatureCollection',
        features: []
    };

    rows.slice(1).forEach((row) => {
        if (!row.trim()) return;
        const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        if (!cols || cols.length < 6) return;

        const dba = cols[0]?.replace(/"/g, '').trim();  // 店名
        const zipcode = cols[2]?.replace(/"/g, '').trim();  // 邮编
        const lat = parseFloat(cols[3]);  // 纬度
        const lon = parseFloat(cols[4]);  // 经度
        const street = cols[5]?.replace(/"/g, '').trim();  // 街道
        const cuisine = cols[6]?.replace(/"/g, '').trim();  // 🍴 菜系（第7列！！）          

        if (!isNaN(lat) && !isNaN(lon)) {
            geojson.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [lon, lat]
                },
                properties: {
                    title: dba,
                    cuisine: cuisine,   // 🍴 加了这一行
                    zipcode: zipcode,
                    street: street
                }
            });            
        }
    });

    return geojson;
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbmZlbmc5MjkiLCJhIjoiY20yYXBld2FmMGl5ZDJzcHk3ZHF4bjQ2NiJ9.Gr_AF5ANKXy62O-h1iiNjg';

// 初始化地图
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-73.970, 40.7858],
    zoom: 11.3
});

let restaurantLayerVisible = false;
let restaurantSourceLoaded = false;

document.getElementById("toggleRestaurantsBtn").addEventListener("click", () => {
    if (!restaurantSourceLoaded) {
        loadRestaurantsGeoJSON().then(geojson => {
    restaurantFeatures = geojson.features;
    setupSearchBox(restaurantFeatures);
            map.addSource("restaurants", {
                type: "geojson",
                data: geojson
            });

            map.addLayer({
                id: "restaurants-points",
                type: "circle",
                source: "restaurants",
                paint: {
                    "circle-color": "#b4e3c0",
                    "circle-radius": 6,
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#fff"
                }
            });

            restaurantSourceLoaded = true;
            restaurantLayerVisible = true;
            document.getElementById("toggleRestaurantsBtn").innerText = "Hide Restaurants";
        });
    } else {
        restaurantLayerVisible = !restaurantLayerVisible;
        map.setLayoutProperty("restaurants-points", "visibility", restaurantLayerVisible ? "visible" : "none");
        document.getElementById("toggleRestaurantsBtn").innerText = restaurantLayerVisible ? "Hide Restaurants" : "Show Restaurants";
    }
});


// 预定义的起点
const startPoints = [
    [-74.0101, 40.7268],[-73.9935, 40.7701],[-73.9843, 40.7102],[-73.9439, 40.7857],[-73.9132, 40.8693],[-73.9371, 40.8027]
];

// 预定义的终点
const destinations = [
    { name: "Dyckman Marina", coordinates: [-73.9325, 40.8687] },
    { name: "West Harlem Piers", coordinates: [-73.9612, 40.8195] },
    { name: "Pier A Walkway", coordinates: [-73.9858, 40.7866] },
    { name: "Pier 88", coordinates: [-74.0014, 40.7671] },
    { name: "Pier 51", coordinates: [-74.0110, 40.7382] },
    { name: "Pier 26", coordinates: [-74.0156, 40.7214] },
    { name: "Pier 15", coordinates: [-74.0029, 40.7042] },
    { name: "Pier 35", coordinates: [-73.9884, 40.7094] },
    { name: "Stuyvesant Cove", coordinates: [-73.9730, 40.7320] },
    { name: "Seastreak East 35th Street Dock", coordinates: [-73.9707, 40.7439] }
];

// 标记所有起点
startPoints.forEach(coord => {
    new mapboxgl.Marker({
        color: 'gray',
        element: createGarageIcon()
    }).setLngLat(coord).addTo(map);
});

// 创建自定义起点图标（使用 Font Awesome 绿色图标）
function createGarageIcon() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-warehouse" style="font-size:15px; color:#315932;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.textAlign = 'center';
    return el;
}

// 创建 Waste Collection Points 自定义标记
function createWasteCollectionPointMarker() {
    const el = document.createElement('div');
    el.innerHTML = '<i class="fas fa-utensils" style="font-size:16px; color:#f24805;"></i>';
    el.style.display = 'inline-block';
    el.style.width = '20px';  // 适当调整宽度
    el.style.height = '20px'; // 适当调整高度
    return el;
}

// 存储中间点
let midPoints = [];
let midPointMarkers = []; // 存储所有中间点的标记

// 计算最近点
function findNearestPoint(point, pointsArray) {
    return pointsArray.reduce((nearest, coord) => {
        const dist = Math.hypot(point[0] - coord[0], point[1] - coord[1]);
        return dist < nearest.dist ? { dist, coord } : nearest;
    }, { dist: Infinity, coord: null }).coord;
}

// 监听点击事件，添加新的中间点（限制最多 5 个）
map.on('click', (e) => {
    loadRestaurantsGeoJSON().then(geojson => {
    restaurantFeatures = geojson.features;
    setupSearchBox(restaurantFeatures);
        map.addSource('restaurants', {
            type: 'geojson',
            data: geojson,
            cluster: false
        });
    
        map.addLayer({
            id: 'restaurants-points',
            type: 'circle',
            source: 'restaurants',
            paint: {
                'circle-color': '#b4e3c0',
                'circle-radius': 6,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });
    
        let restaurantFeatures = geojson.features;
    
        const searchInput = document.getElementById('restaurantSearch');
        const suggestionBox = document.getElementById('suggestions');
    
        searchInput.addEventListener('input', function (e) {
            const query = e.target.value.toLowerCase();
            suggestionBox.innerHTML = '';
    
            if (!query) {
                suggestionBox.style.display = 'none';
                return;
            }
    
            const matches = restaurantFeatures.filter(f =>
                f.properties.title.toLowerCase().includes(query) ||
                f.properties.zipcode.toLowerCase().includes(query)
            ).slice(0, 10);
    
            if (matches.length === 0) {
                suggestionBox.style.display = 'none';
                return;
            }
    
            matches.forEach(match => {
                const div = document.createElement('div');
                div.textContent = `${match.properties.title} — ${match.properties.street} (${match.properties.zipcode})`;
                div.style.padding = '6px 10px';
                div.style.cursor = 'pointer';
                div.style.borderBottom = '1px solid #eee';
    
                div.addEventListener('click', () => {
                    const coords = match.geometry.coordinates;
                    const title = match.properties.title;
                    const street = match.properties.street;
                    const zipcode = match.properties.zipcode;
    
                    map.flyTo({ center: coords, zoom: 15 });
    
                    new mapboxgl.Popup()
                    .setLngLat(coords)
                    .setHTML(`<strong>${title}</strong><br/>Street: ${street}<br/>Zipcode: ${zipcode}<br/>Cuisine: ${cuisine}`)
                    .addTo(map);                
    
                    suggestionBox.style.display = 'none';
                    searchInput.value = title;
                });
    
                suggestionBox.appendChild(div);
            });
    
            suggestionBox.style.display = 'block';
        });
    });
    
    if (midPoints.length >= 5) {
        alert("Maximum of five restaurant collection points allowed！");
        return; // 直接返回，不添加更多中间点
    }

    const midPoint = [e.lngLat.lng, e.lngLat.lat];
    midPoints.push(midPoint); // 记录中间点

    // 创建中间点标记
    const marker = new mapboxgl.Marker({
        element: createWasteCollectionPointMarker()
    }).setLngLat(midPoint).addTo(map);
    midPointMarkers.push(marker); // 记录中间点标记

    // 只有当 **中间点未超过 5 个** 时，才更新路线
    if (midPoints.length <= 5) {
        const startPoint = findNearestPoint(midPoints[0], startPoints);
        const endPoint = findNearestPoint(midPoints[midPoints.length - 1], destinations.map(d => d.coordinates));
        getRoute(startPoint, midPoints, endPoint);
    }
});

function resetRouteData() {
    if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
    }
}

// **改进 resetRoute()，保证 UI 清理**
function resetRoute() {
    midPoints = [];
    midPointMarkers.forEach(marker => marker.remove());
    midPointMarkers = [];

    resetRouteData(); // **删除旧路线**

    // **取消动画**
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    document.getElementById("distance").textContent = "0";
    document.getElementById("time").textContent = "0";
    document.getElementById("speed").textContent = "0";
}

function optimizeRoute(start, midPoints) {
    let points = [start, ...midPoints];
    let optimized = [start];
    let remaining = [...midPoints];

    while (remaining.length > 0) {
        let lastPoint = optimized[optimized.length - 1];
        let nearest = remaining.reduce((closest, point) => {
            let dist = Math.hypot(lastPoint[0] - point[0], lastPoint[1] - point[1]);
            return dist < closest.dist ? { point, dist } : closest;
        }, { point: null, dist: Infinity }).point;
        
        optimized.push(nearest);
        remaining = remaining.filter(p => p !== nearest);
    }
    
    return optimized.slice(1); // **返回优化后的中间点（不包含起点和终点）**
}

// **获取路线并调用动画**
function getRoute(start, midPoints) {
    resetRouteData();
    
    // **优化中间点顺序**
    const optimizedMidPoints = optimizeRoute(start, midPoints);
    
    // **终点取决于优化后的最后一个中间点**
    const end = findNearestPoint(optimizedMidPoints[optimizedMidPoints.length - 1], destinations.map(d => d.coordinates));

    // 计算优化后的路径
    const coordinates = [start, ...optimizedMidPoints, end].map(coord => coord.join(",")).join(";");
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const route = data.routes[0].geometry.coordinates;
        const distanceMiles = (data.routes[0].distance / 1609.34).toFixed(2); // 里程转换为英里
        const timeMinutes = (data.routes[0].duration / 60).toFixed(2); // 时间转换为分钟

        // **计算平均速度**
        let speedMph = (timeMinutes > 0) ? (distanceMiles / (timeMinutes / 60)).toFixed(2) : "0";

        // **更新 UI**
        document.getElementById("distance").textContent = distanceMiles;
        document.getElementById("time").textContent = timeMinutes;
        document.getElementById("speed").textContent = speedMph; // **新增，更新速度**

        if (map.getSource('route')) {
            map.getSource('route').setData({
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: route }
            });
        } else {
            map.addSource('route', {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: route } }
            });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#a37f92', 'line-width': 3 }
            });
        }

        animateRouteWithPause(route, optimizedMidPoints);
    });
}

// **平滑动画并在所有中间点依次停留**
let animationFrameId = null; // 用于存储动画帧 ID，防止动画重复

function animateRouteWithPause(route, midPoints) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // 取消旧动画
    }

    let index = 0;
    let interpolatedRoute = [];
    let stopIndex = 0;
    let hasPaused = false;

    for (let i = 0; i < route.length - 1; i++) {
        let [lng1, lat1] = route[i];
        let [lng2, lat2] = route[i + 1];

        for (let j = 0; j <= 500; j++) {
            let t = j / 500;
            let interpolatedLng = lng1 + (lng2 - lng1) * t;
            let interpolatedLat = lat1 + (lat2 - lat1) * t;
            interpolatedRoute.push([interpolatedLng, interpolatedLat]);
        }
    }

    function updateRoute() {
        if (index < interpolatedRoute.length) {
            // 确保数据源存在
            if (!map.getSource('route')) {
                console.warn("Route source does not exist.");
                return;
            }
    
            // 更新路线数据
            let currentRoute = interpolatedRoute.slice(0, Math.floor(index));
            map.getSource('route').setData({
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: currentRoute }
            });
    
            let currentPos = interpolatedRoute[Math.floor(index)];
    
            // **检测到中间点时停留**
            if (!hasPaused && stopIndex < midPoints.length) {
                let targetMidPoint = midPoints[stopIndex];
    
                if (Math.hypot(currentPos[0] - targetMidPoint[0], currentPos[1] - targetMidPoint[1]) < 0.0002) {
                    hasPaused = true;
                    setTimeout(() => {
                        stopIndex++;
                        hasPaused = false;
                        requestAnimationFrame(updateRoute); // 继续动画
                    }, 3000); // 在中间点停留 3 秒
                    return;
                }
            }
    
            // **平滑增加 index，避免跳过点**
            index = Math.min(index + 3, interpolatedRoute.length - 1);
    
            // **确保动画不会无限执行**
            if (index < interpolatedRoute.length) {
                animationFrameId = requestAnimationFrame(updateRoute);
            }
        } else {
            console.log("Animation complete");
        }
    }
    
    // 启动动画
    updateRoute();
}

// 添加“Reset”按钮的监听器
document.getElementById('resetBtn').addEventListener('click', () => {
    resetRoute(); // 清除中间点和路线
});

let restaurantData = [];


map.on("load", () => {
    loadRestaurantsGeoJSON().then(geojson => {
        restaurantFeatures = geojson.features;
        setupSearchBox(restaurantFeatures);
    });
});
