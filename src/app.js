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

let i=0;
let j=0;
let k=0;
let l=0;
let red_sum = 0; // used in determining average pixel color
let green_sum = 0; // used in determining average pixel color
let blue_sum = 0; // used in determining average pixel color
let newframe_left=0;
let newframe_top=0;


// interactions
window.onload = function() {

    GetNewFrameLocation();

    let schortcut = ""
    if (navigator.appVersion.indexOf('Mac') != -1) {
        schortcut = "(⌘ + V)"
    } else {
        schortcut = "(Ctrl + V)"
    }
    document.getElementById('shortcut').innerHTML=schortcut;
    
};


document.getElementById('resolution').onchange = function(){
    resolution = Number(document.getElementById('resolution').value);
}


document.getElementById('btn_start').onclick = function() {

    CreateNewFrame();

    // scan rows and columns of pasted image at intervals and draw corresponding sticky color
    i=0; // horizontal scan lines
    j=0; // vertical scan lines
    k=0; // scan pixeltile horizontally
    l=0; // scan pixeltile horizontally


    var scangridsize = 200/resolution // for example scan grid is 10px for a 20x20 sticky wall
    console.log("scan grid size:" + scangridsize);

    for (i=0; i<(resolution); i++) {
        for (j=0; j<(resolution); j++) {


            // get the RGB value of the center pixel of scan square
            // var pixelmid = (200/resolution)/2;
            // var pixel = context.getImageData(i*(200/resolution)+pixelmid, j*(200/resolution)+pixelmid, 1, 1).data;
            // var color = GetColorName(pixel[0],pixel[1],pixel[2]); // RGB value of pixel
            // OR

            // get average RGB value of a scan tile
            var scangridsize = 200/resolution // for example scan grid is 10px for a 20x20 sticky wall
            console.log("scan grid size:" + scangridsize);
            red_sum = 0;
            green_sum = 0;
            blue_sum = 0;

            // scan tile at the i,j location
            for (k=0; k<scangridsize; k++) {
                for (l=0; l<scangridsize; l++) {
                    var subpixel = context.getImageData(i*(200/resolution)+k, j*(200/resolution)+l, 1, 1).data;
                    red_sum = red_sum + subpixel[0]; // R value of pixel
                    green_sum = green_sum + subpixel[1]; // G value of pixel
                    blue_sum = blue_sum + subpixel[2]; // B value of pixel
                }
            }

            //determine average (divide by square of scan grid size
            var color = GetColorName((red_sum/Math.pow(scangridsize,2)), (green_sum/Math.pow(scangridsize,2)), (blue_sum/Math.pow(scangridsize,2))); // RGB value of pixel

            AddSticky(i,j,color);
        }
    }

    ClosePanel(); // close app panel
}


document.getElementById('btn_feedback').onclick = function() {
// show form
    document.getElementById('form_feedback').style.display = 'block';
//hide button
    document.getElementById('btn_feedback').style.display = 'none';
}

document.getElementById('btn_sendfeedback').onclick = function() {
// show form
    document.getElementById('form_feedback').style.display = 'none';
//hide button
    document.getElementById('btn_feedback').style.display = 'block';
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
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        LoadImage(src);
        document.getElementById('hint').style.display = 'none'; // hide hint text
    }
});


// functions
function LoadImage(src) {
    var img = new Image();
    var mywidth, myheight, myleft, mytop;
    img.onload = function() {
        if (this.width > this.height) { // landscape ratio
            mywidth = 200;
            myheight = 200*(this.height/this.width);
            myleft = 0;
            mytop = (200-myheight)/2
        } else { // portrait ratio or square
            mywidth = 200*(this.width/this.height);
            myheight = 200;
            myleft = (200-mywidth)/2;
            mytop = 0;
        }
        context.drawImage(img,myleft,mytop,mywidth,myheight);
    };
    img.src = src;
}


async function CreateNewFrame() { // find the most top right frame on the boars and create new one next to it

    GetNewFrameLocation();

    let mywidth =  45 * (2 + resolution);
    let myheight = 45 * (2 + resolution);
    let my_x = newframe_left + mywidth/2 + 100; // margin 100px between frames
    let my_y = newframe_top + myheight/2 + 0
    
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


async function GetNewFrameLocation() {

    const allframes = await miro.board.get({
        type: 'frame'
    });

    allframes.forEach(function(item) { // determing left most and top most free spot on the board
        if ((item.x + item.width/2) > newframe_left) {
            newframe_left = item.x + item.width/2;
        }
        if ((item.y - item.height/2) < newframe_top) {
            newframe_top = item.y - item.height/2
        }
    })
}


function GetColorName(r,g,b) { // find nearest sticky color that best matches the passed RGB value

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
            x: newframe_left + (o+3.5)*45, // Default value: horizontal center of the board
            y: newframe_top + (p+1.5)*45, // Default value: vertical center of the board
            shape: 'square',
            width: 40, // Set either 'width', or 'height'
        });

    }
}


async function ClosePanel() {

    await miro.board.ui.closePanel();
}

