var arDrone = require('ar-drone');
var client = arDrone.createClient();
var stdin = process.stdin;

var io = require('socket.io').listen(3002);
io.set('log level', 1);

var express = require('express'),
    app = express(),
    server = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));


// Take Off
// Take Off
// Take Off
var tookOff = false;
var doTakeOff = function() {
    tookOff = !tookOff;
    if (tookOff) {
        console.log("Take off!");
        client.takeoff();
    } else {
        console.log("Land!");
        client.land();
    }
};

// Climb
// Climb
// Climb
var climb = 0.0;
var climbRate = 0.03;
var applyClimb = function(climb) {
    if (climb > 0.0) {
        console.log("Climb="+climb + " -> up");
        client.up(climb);
    } else {
        console.log("Climb="+climb + " -> down");
        client.down(Math.abs(climb));
    }
};
var doUp = function() {
    if (climb < 1.0) {
        climb += climbRate;
    }
    applyClimb(climb);
};
var doDown = function() {
    if (climb > -1.0) {
        climb -= climbRate;
    }
    applyClimb(climb);
};

// Pitch
// Pitch
// Pitch
var pitch = 0.0;
var pitchRate = 0.03;
var applyPitch = function(pitch) {
    if (pitch > 0.0) {
        console.log("Pitch="+pitch + " -> front");
        client.front(Math.abs(pitch));
    } else {
        console.log("Pitch="+pitch + " -> back");
        client.back(Math.abs(pitch));
    }
};
var pitchUp = function() {
    if (pitch < 1.0) {
        pitch += pitchRate;
    }
    applyPitch(pitch);
};
var pitchDown = function() {
    if (pitch > -1.0) {
        pitch -= pitchRate;
    }
    applyPitch(pitch);
};

// Yaw
// Yaw
// Yaw
var yaw = 0.0;
var yawRate = 0.03;
var applyYaw = function(yaw) {
    if (yaw > 0.0) {
        console.log("Yaw="+yaw + " -> ccw");
        client.counterClockwise(Math.abs(yaw));
    } else {
        console.log("Yaw="+yaw + " -> cw");
        client.clockwise(Math.abs(yaw));
    }
};
var yawLeft = function() {
    if (yaw < 1.0) {
        yaw += yawRate;
    }
    applyYaw(yaw);
};
var yawRight = function() {
    if (yaw > -1.0) {
        yaw -= yawRate;
    }
    applyYaw(yaw);
};

// Roll
// Roll
// Roll
var roll = 0.0;
var rollRate = 0.03;
var applyRoll = function(roll) {
    if (roll > 0.0) {
        console.log("Roll="+roll + " -> right");
        client.right(Math.abs(roll));
    } else {
        console.log("Roll="+roll + " -> left");
        client.left(Math.abs(roll));
    }
};
var rollCounterCW = function() {
    if (roll < 1.0) {
        roll += rollRate;
    }
    applyRoll(roll);
};
var rollCW = function() {
    if (roll > -1.0) {
        roll -= rollRate;
    }
    applyRoll(roll);
};

// Reset
// Reset
// Reset
var stabilize = function() {
    console.log("Stabilize");
    yaw = 0.0;
    pitch = 0.0;
    roll = 0.0;
    climb = 0.0;
    client.stop();
}

// Video
// Video
// Video
var showVideo = function() {
    var tcpVideo = client.getVideoStream()
}

var commandArray = [];
var startTime;
var logger = function(key) {

    if (key == h || key == space) return;

    if (commandArray.length == 0) {
        console.log('Timer started');
        startTime = Date.now();
        time = 0;
    } else {
        time = Date.now() - startTime;
    }

    commandArray.push({
        'key': key,
        'time': time,
        'yaw': yaw,
        'pitch': pitch,
        'roll': roll,
        'climb': climb
    });
}

var applyAll = function(cmd) {
    applyYaw(cmd.yaw * -1.0);
    applyPitch(cmd.pitch * -1.0);
    applyRoll(cmd.roll * -1.0);
    applyClimb(cmd.climb * -1.0);
}

var playReverse = function() {

    console.log('Starting reverse...');

    if ( commandArray.length == 0 ) return;

    var endTime = commandArray[commandArray.length-1].time;
    var tempTime = endTime;

    while (commandArray.length > 0) {
        var cmd = commandArray.pop();
        time = tempTime - cmd.time;
        // tempTime = cmd.time;
        setTimeout(applyAll, time, cmd);
    }

    setTimeout(function() {
        stabilize();
        console.log('End of reverse');
    }, endTime);


}

// Dispatch
// Dispatch
// Dispatch
var dispatchKey = function(key) {
    switch (key) {
    case ' ':
        doTakeOff();
        break;
    case 'p':
        doUp();
        break;
    case 'l':
        doDown();
        break;
    case 'w':
        pitchUp();
        break;
    case 's':
        pitchDown();
        break;
    case 'a':
        yawLeft();
        break;
    case 'd':
        yawRight();
        break;
    case 'q':
        rollCW();
        break;
    case 'e':
        rollCounterCW();
        break;
    case 't':
        stabilize();
        break;
    case 'h':
        playReverse();
        break;
    default:
        process.stdout.write("Not handled: " + key + "\n");
  }
};

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding( 'utf8' );
stdin.on('data', function(key){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  dispatchKey(key);
});

app.listen(3000);

var w = 87,
    s = 83,
    a = 65,
    d = 68,
    q = 81,
    e = 69,
    t = 84,
    h = 72,
    shift = 16,
    command = 91,
    space = 32;

var isKeyDownNow = {};
isKeyDownNow[w] = false,
isKeyDownNow[s] = false,
isKeyDownNow[a] = false,
isKeyDownNow[d] = false,
isKeyDownNow[q] = false,
isKeyDownNow[e] = false,
isKeyDownNow[t] = false,
isKeyDownNow[h] = false,
isKeyDownNow[shift] = false,
isKeyDownNow[command] = false,
isKeyDownNow[space] = false;

var wasKeyConsumedOnce = {};
wasKeyConsumedOnce[w] = true,
wasKeyConsumedOnce[s] = true,
wasKeyConsumedOnce[a] = true,
wasKeyConsumedOnce[d] = true,
wasKeyConsumedOnce[q] = true,
wasKeyConsumedOnce[e] = true,
wasKeyConsumedOnce[t] = true,
wasKeyConsumedOnce[h] = true,
wasKeyConsumedOnce[shift] = true,
wasKeyConsumedOnce[command] = true,
wasKeyConsumedOnce[space] = true;

io.sockets.on('connection', function(socket) {
    setInterval(function(){
        var batteryLevel = client.battery();
        socket.emit('event', { name: 'battery',value: batteryLevel});
    },1000);

    socket.on('key_down', function(key) {
        isKeyDownNow[key] = true;
        wasKeyConsumedOnce[key] = false;
    });

    socket.on('key_up', function(key) {
        isKeyDownNow[key] = false;
    });
});

var consumeKey = function(key) {
    wasKeyConsumedOnce[key] = true;
    logger(key);
}

setInterval(function() {
    if (!wasKeyConsumedOnce[space]) {
        stabilize();
        doTakeOff();
        consumeKey(space);
    }
    if (isKeyDownNow[shift] || !wasKeyConsumedOnce[shift]) {
        wasKeyConsumedOnce[shift] = true;
        doUp();
        consumeKey(shift);
    }
    if (isKeyDownNow[command] || !wasKeyConsumedOnce[command]) {
        doDown();
        consumeKey(command);
    }
    if (isKeyDownNow[w] || !wasKeyConsumedOnce[w]) {
        pitchUp();
        consumeKey(w);
    }
    if (isKeyDownNow[s] || !wasKeyConsumedOnce[s]) {
        pitchDown();
        consumeKey(s);
    }
    if (isKeyDownNow[a] || !wasKeyConsumedOnce[a]) {
        yawLeft();
        consumeKey(a);
    }
    if (isKeyDownNow[d] || !wasKeyConsumedOnce[d]) {
        yawRight();
        consumeKey(d);
    }
    if (isKeyDownNow[q] || !wasKeyConsumedOnce[q]) {
        rollCW();
        consumeKey(q);
    }
    if (isKeyDownNow[e] || !wasKeyConsumedOnce[e]) {
        rollCounterCW();
        consumeKey(e);
    }
    if (isKeyDownNow[h] || !wasKeyConsumedOnce[h]) {
        playReverse();
        consumeKey(h);
    }
    if (isKeyDownNow[t] || !wasKeyConsumedOnce[t]) {
        isKeyDownNow[w] = false;
        isKeyDownNow[s] = false;
        isKeyDownNow[a] = false;
        isKeyDownNow[d] = false;
        isKeyDownNow[q] = false;
        isKeyDownNow[e] = false;
        isKeyDownNow[t] = false;
        isKeyDownNow[shift] = false;
        isKeyDownNow[command] = false;
        isKeyDownNow[space] = false;

        stabilize();

        consumeKey(t);
    }


}, 30);


require("dronestream").listen(3001);

