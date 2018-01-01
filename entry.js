var gnfModule = require('./genericNetFunctions.js')
var lnfModule = require('./lifeNetFunctions.js')
var http = require('http')
http.post = require('http-post')
var gnf = gnfModule()
var lnf = lnfModule()
var xhr= require('node-xhr')
var cytoscape = require('cytoscape')

//ALL GRAPH SELECTION IS DONE HERE 

// window.onload=function(){
//   lnf.loadNodes
//   lnf.loadEdges
// }

cy.style().selector('node:selected').style('background-color', 'magenta')

//Event Listeners

//at network start listeners



function onIndexLoad () {
  console.log('loaaading!')
  lnf.loadNets()
}

onIndexLoad()

var logout = document.getElementById('logout')
logout.addEventListener('click', lnf.logout)



var savePositions=document.getElementById('savePositions')
savePositions.addEventListener('click', lnf.savePositions)

var postJson1=document.getElementById("postJson1")
postJson1.addEventListener("click", lnf.createNewNode)

var addNet1 = document.getElementById('addNet1')
addNet1.addEventListener('click', lnf.addNet, lnf.loadNets)

// var enterChat = document.getElementById('enterChat')
// enterChat.addEventListener('click', lnf.enterChat)


$('.groups').click(function(){
  console.log('he')
})

// var e = document.getElementById('parent');
// e.onmouseover = function() {
//   document.getElementById('popup').style.display = 'block';
// }
// e.onmouseout = function() {
//   document.getElementById('popup').style.display = 'none';
// }


// var description1 = document.getElementById('createCommunityDescription')
// description1.onmouseover=function() {
//   document.getElementById('commPopup').style.display='block'
// }
// description1.onmouseout=function(){
//   document.getElementById('commPopup').style.display='none'
// }
/*window.onload=function(){*/
//nClicked=false, first click, true,second click
var nClicked = false;
var firstNode = {}
var secondNode = {}
var edgeClicked=false;

// var firstNodeId = firstNode.id()
// var secondNodeId = secondNode.id()
function tapOnEdges(){
  cy.on('tap','edge', function(evt){
    if (edgeClicked) {
      edgeClicked=false
      window.open('http://www.ourlifenet.com/edgeInfo/'+evt.cyTarget.id(), 'Edge Info', 'height= 470, width=470, return false') 

    }
    else {
      edgeClicked=true
            window.open('http://www.ourlifenet.com/edgeInfo/'+evt.cyTarget.id(), 'Edge Info', 'height= 470, width=470, return false') 

    }
  })
}

function tapOnNodes () {
  cy.on('tap', 'node', function(evt){
    //second click
    if (nClicked) {
      nClicked = false
  	  // console.log('byee') you know...
      secondNode = evt.cyTarget
      var firstNodeId= firstNode.id()
      var secondNodeId = secondNode.id()
      // console.log('c',firstNodeId, 'd',secondNodeId)
      if (secondNodeId === firstNodeId){
        console.log('clicked myself')
        window.open('http://www.ourlifenet.com/nodeInfo/'+evt.cyTarget.id(), 'Node Info', 'height= 470, width=470, return false') 
      }
      else {
        // console.log('nodes2',firstNodeId, secondNodeId)
  	   lnf.addNewEdge(firstNodeId, secondNodeId)  
      // gnf.addDirectedEdge(firstNodeId, secondNodeId)
      }
    }
    //first click
    else 
    {
      nClicked=true
      firstNode= evt.cyTarget
      // firstNodeId = firstNode.id()
      console.log('hiii')
      console.log('a', firstNode, 'b', firstNodeId)
    }
  })
}
