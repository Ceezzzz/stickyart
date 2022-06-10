// init
let resolution = 20;
let sticky_colors = [
    ["gray",245,246,248],
    ["light_yellow",254,248,185],
    ["yellow",239,209,80],
    ["orange",241,161,89],
    ["light_green",219,244,158],
    ["green",205,221,107],
    ["dark_green",161,207,127],
    ["cyan",126,196,191],
    ["light_pink",247,208,223],
    ["pink",222,152,185],
    ["violet",182,139,195],
    ["red",224,116,129],
    ["light_blue",173,203,241],
    ["blue",135,213,246],
    ["dark_blue",126,147,247],
    ["black",0,0,0]
]
let canvas = document.getElementById('myCanvas');
let context = canvas.getContext('2d');
canvas.width=200;
canvas.height=200;
let imageURL = '';
LoadImage(imageURL);


// interactions
document.getElementById('resolution').onchange = function(){
    resolution = Number(document.getElementById('resolution').value);
}

document.getElementById('btn_start').onclick = function() {

    ClosePanel(); // close app panel

    DrawFrame();

    var i, j; // scan rows and columns of pasted image at intervals and draw corresponding sticky color
    for (i=0; i<(resolution); i++) {
        for (j=0; j<(resolution); j++) {
            var pixelmid = (200/resolution)/2;
            var pixel = context.getImageData(i*(200/resolution)+pixelmid, j*(200/resolution)+pixelmid, 1, 1).data;
            var color = GetColorName(pixel[0],pixel[1],pixel[2]); // RGB value of pixel
            AddSticky(i,j,color);
        }
    }
}


window.addEventListener('paste', function(e){

    if(e.clipboardData == false) return false;
    var imgs = e.clipboardData.items;
    if(imgs == undefined) return false;

    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].type.indexOf("image") == -1) continue;
        var imgObj = imgs[i].getAsFile();
        var url = window.URL || window.webkitURL;
        var src = url.createObjectURL(imgObj);
        // context.clearRect(0,0,canvas.width,canvas.height);
        context.fillStyle = '#ffF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        LoadImage(src);
        document.getElementById('hint').style.display = 'none'; // hide hint text
    }
});


// functions
function LoadImage(src){
    var img = new Image();
    img.onload = function(e) {
        context.drawImage(img,0,0,200,200);
    };
    img.src = src;
}

function GetColorName(r,g,b) { // find nearest sticky color that best matches the pixel RGB value

  var s, dx, dy, dz, distance
  let shortest_distance = 500;
  let nearest_color = 0;

  for (s=0; s<sticky_colors.length; s++) {
    dx = r-sticky_colors[s][1];
    dy = g-sticky_colors[s][2];
    dz = b-sticky_colors[s][3];
    distance = Math.sqrt(dx*dx+dy*dy+dz*dz)
    if (distance < shortest_distance) {
      shortest_distance = distance;
      nearest_color = s;
    }
  }

  return(sticky_colors[nearest_color][0]);
}

async function DrawFrame() {

    let mywidth =  45 * (2 + resolution);
    let myheight = 45 * (2 + resolution);
    let my_x = mywidth/2-(45*1.5);
    let my_y = myheight/2-(45*1.5);

    const myframe = await miro.board.createFrame({
        title: '',
        style: {
            fillColor: '#ffffff',
        },
        x: my_x, // Default value: horizontal center of the board
        y: my_y, // Default value: vertical center of the board
        width: mywidth,
        height: myheight
    });

    await miro.board.viewport.zoomTo(myframe);
}

async function AddSticky(o,p,mycolor) {

    if (mycolor == "gray") {
        // dont draw a sticky when it's white
    } else {
        const sticky = await miro.board.createStickyNote({
            content: '',
            style: {
                fillColor: mycolor, // Default value: light yellow
                textAlign: 'center', // Default alignment: center
                textAlignVertical: 'middle', // Default alignment: middle
            },
            x: o*45, // Default value: horizontal center of the board
            y: p*45, // Default value: vertical center of the board
            shape: 'square',
            width: 40, // Set either 'width', or 'height'
        });
    }
}

async function ClosePanel() {
    await miro.board.ui.closePanel();
}

