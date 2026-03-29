function register() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (!user || !pass) {
        document.getElementById("authMsg").innerText = "Fill all fields!";
        return;
    }

    localStorage.setItem(user, pass);
    document.getElementById("authMsg").innerText = "Registered!";
}

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (localStorage.getItem(user) === pass) {
        document.getElementById("authBox").style.display = "none";
        document.getElementById("appBox").style.display = "block";
    } else {
        document.getElementById("authMsg").innerText = "Invalid!";
    }
}

const cityNames = [
"Delhi","Gurgaon","Noida","Agra","Jaipur",
"Lucknow","Kanpur","Varanasi","Prayagraj","Dehradun",
"Chandigarh","Amritsar","Ludhiana","Jalandhar","Shimla",
"Mumbai","Pune","Nagpur","Bhopal","Indore",
"Ahmedabad","Surat","Vadodara","Udaipur","Kota"
];

const graph = [
[[1,3],[2,2],[3,5],[4,6]],
[[0,3],[4,5]],
[[0,2],[3,4]],
[[2,4],[5,6],[18,8]],
[[1,5],[20,8]],
[[3,6],[6,3]],
[[5,3],[8,4]],
[[8,3]],
[[6,4],[7,3]],
[[0,6],[10,4]],
[[9,4],[11,3]],
[[10,3]],
[[10,3],[13,2]],
[[12,2]],
[[10,5]],
[[16,3],[20,6],[19,7]],
[[15,3],[17,5]],
[[16,5],[18,4]],
[[17,4],[19,2],[3,8]],
[[18,2],[22,4],[15,7]],
[[15,6],[21,2],[4,8]],
[[20,2],[22,2]],
[[21,2],[19,4]],
[[4,6],[24,3],[20,7]],
[[23,3],[3,5]]
];

const roadNames = {
"0-3":"NH19","0-4":"NH48","2-3":"Yamuna Expressway",
"3-5":"NH19","4-20":"NH48","15-16":"Mumbai-Pune Exp",
"18-19":"NH52","20-21":"NH48"
};

let traffic = Array(25).fill(1);
let signals = Array(25).fill(10);

function getCityIndex(name) {
    return cityNames.findIndex(c =>
        c.toLowerCase() === name.trim().toLowerCase()
    );
}

function cloneGraph() {
    return JSON.parse(JSON.stringify(graph));
}

function isEdge(path,u,v){
    for(let i=0;i<path.length-1;i++){
        if(path[i]===u && path[i+1]===v) return true;
    }
    return false;
}

function dijkstra(g, src, dest) {
    let dist = Array(g.length).fill(Infinity);
    let parent = Array(g.length).fill(-1);

    dist[src] = 0;
    let pq = [[0, src]];
    let emergency = document.getElementById("emergency").checked;

    while (pq.length) {
        pq.sort((a,b)=>a[0]-b[0]);
        let [d,u] = pq.shift();

        for (let [v,w] of g[u]) {
            let cost;

            if (emergency) {
                cost = d + w * 0.7;
            } else {
                cost = d + w + traffic[v]*10 + signals[v]*2;
            }

            if (cost < dist[v]) {
                dist[v] = cost;
                parent[v] = u;
                pq.push([cost,v]);
            }
        }
    }

    let path = [];
    for (let cur = dest; cur !== -1; cur = parent[cur]) {
        path.push(cur);
    }

    path.reverse();
    return path[0] === src ? path : [];
}

function formatRoute(path) {
    let res = "";
    for (let i = 0; i < path.length; i++) {
        res += cityNames[path[i]];
        if (i < path.length - 1) {
            let r = roadNames[path[i]+"-"+path[i+1]] || roadNames[path[i+1]+"-"+path[i]] || "Road";
            res += " → ("+r+") → ";
        }
    }
    return res;
}

function findRoute() {
    const src = getCityIndex(document.getElementById("src").value);
    const dest = getCityIndex(document.getElementById("dest").value);

    if (src === -1 || dest === -1) {
        alert("Invalid city!");
        return;
    }

    let g1 = cloneGraph();
    let p1 = dijkstra(g1, src, dest);

    if (!p1.length) {
        alert("No route!");
        return;
    }
    let g2 = cloneGraph();
    for (let i = 0; i < p1.length - 1; i++) {
        let u = p1[i];
        let v = p1[i+1];
        for (let e of g2[u]) {
            if (e[0] === v) e[1] += 20;
        }
    }

    let p2 = dijkstra(g2, src, dest);

    document.getElementById("result").innerHTML =
        "<b>Best:</b><br>" + formatRoute(p1) +
        "<br><br><b>Alternate:</b><br>" +
        (p2.length ? formatRoute(p2) : "None");

    drawGraph(p1, p2);
}
let positions = {};
let cols = 5;

for (let i = 0; i < 25; i++) {
    positions[i] = [
        80 + (i % cols) * 140,
        80 + Math.floor(i / cols) * 100
    ];
}

function drawGraph(best=[], alt=[]) {
    const ctx = document.getElementById("graphCanvas").getContext("2d");
    ctx.clearRect(0,0,900,600);

    ctx.font = "10px Arial";
    ctx.textAlign = "center";

    for (let u=0; u<25; u++) {
        for (let [v] of graph[u]) {

            let [x1,y1] = positions[u];
            let [x2,y2] = positions[v];

            ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);

            let isBest = isEdge(best,u,v);
            let isAlt = isEdge(alt,u,v);

            ctx.strokeStyle = isBest ? "green" : isAlt ? "orange" : "gray";
            ctx.stroke();

            let r = roadNames[u+"-"+v] || roadNames[v+"-"+u];
            if (r) {
                ctx.fillStyle = "blue";
                ctx.fillText(r, (x1+x2)/2, (y1+y2)/2 - 5);
            }
        }
    }

    for (let i=0;i<25;i++){
        let [x,y] = positions[i];

        ctx.beginPath();
        ctx.arc(x,y,18,0,2*Math.PI);
        ctx.fillStyle="white";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle="black";
        ctx.fillText(cityNames[i], x, y+25);
    }
}
function simulateTraffic() {
    for (let i=0;i<25;i++){
        traffic[i] = Math.floor(Math.random()*5);
        signals[i] = Math.floor(Math.random()*20);
    }

    alert("Traffic updated!");

    if (document.getElementById("src").value)
        findRoute();
}
drawGraph();