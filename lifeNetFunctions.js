var cytoscape = require('cytoscape')
var hyperquest= require('hyperquest')
var catS = require('concat-stream')
var gnfModule = require('./genericNetFunctions.js')
var gnf = gnfModule()
var postJson = require('post-json')
/*var Sync = require('sync')
*/
//ALL GRAPH MANIPULATION IS DONE HERE....(cy.add())
module.exports =

function initialize(){

/*	var nClicked = false;
	var firstNode = {}
	var secondNode = {}*/

	return {
		addNet: addNet,
		loadNets: loadNets,
		graphAllNodes: graphAllNodes,
		loadEdges: loadEdges,
		createNewNode: createNewNode,
		savePositions:savePositions,
		addNewEdge: addNewEdge,
		test: test,
		clearAllNodes: clearAllNodes,
		loadGroups: loadGroups,
		graphSpecificGroup: graphSpecificGroup,
		enterChat: enterChat,
		checkDb:checkDb,
		tapOnNodes: tapOnNodes,
		tapOnEdges: tapOnEdges,
		logout: logout
  	}

  	function logout(){
  		hyperquest('http://www.ourlifenet.com/logout')
  	}

  	function addNet(){
  		console.log('addNet called in LNF')
  		var netName = document.getElementById('netName').value
  		var netDescription = document.getElementById('netDescription').value
  		var invitePeople = document.getElementById('invitePeople').value
  		var body = {netName: netName, netDescription: netDescription, invitePeople:invitePeople}
  		var url= 'http://www.ourlifenet.com/addNet'
  		postJson(url, body, function (err, result) {
		})
  		// var url = 'http://www.ourlifenet.com/addNet'
  		// var netName=document.getElementById('nodeNetworks').value
  		// postJson(url,netName, loadNets) 
  		loadNets()
  	}
  	
  	function loadNets(){
  		console.log('fuckoff')
  

		console.log('almostfixin')


		var listOfGroupLinks = ""
		var stream3 = hyperquest('http://www.ourlifenet.com/loadNets')
		
		.pipe(
			catS(function(data){
				console.log('fuckkkkkk!', data)
				var x = data.toString()
				var y = JSON.parse(x)
	
				console.log('ponggg', y[0].value)

				var netlist= y[0].value.nets

				console.log('poop!',netlist)
				console.log('hehe')
				for (i = 0; i<netlist.length; i++){
					console.log('yep',netlist[i])
					var groupLink = '<tr><button class = "nets active specialButton" aria-pressed="true" data-toggle="button" id="'+netlist[i]+'">'+netlist[i]+'</button>'
				
					listOfGroupLinks += groupLink
/*					document.getElementById('currentNet').value = netlist[i]
*/
				}
				var parent= document.getElementById('netLinkContent')
				parent.innerHTML=listOfGroupLinks
			})
		)
		stream3.on('finish', function(){
			console.log('its done')
			var nets1 = document.getElementsByClassName('nets')

			for(var i = 0; i < nets1.length; i++)
 			{
   				console.log('loadnetshmmm', nets1.item(i));
   				nets1.item(i).addEventListener('click',graphSpecificNet)
			 }
		})
	}	
  	
  	function checkDb(){
  		var net = document.getElementById('currentNet').value
  		hyperquest('http://www.ourlifenet.com/checkDb/'+net)
  	}


  	function enterChat(){
  		hyperquest('http://www.ourlifenet.com/enterChat')
  	}

	function test () {
		var url = 'http://www.ourlifenet.com/test'
		var body = {firstNode: firstNodeId, secondNode:secondNodeId} 

		postJson(url,body, function(err,result){
		})

	}
	function clearAllNodes(){
		cy.nodes().remove()
	}


	function addNode (name,group) {
		cy.add({
	        group:"nodes",
	        data: {
	          weight:75,
	          id:name,
	        },
	        position: {x: 200, y : 200},
	        classes: group,
    	})
    	console.log('this happens first')
/*    	tapOnNodes()
*/	}

	function addDirectedEdge(source,target) {
	     cy.add({
	      group:"edges",
	      data: {
	        source: source,
	        target: target
	      }
	    })
	}
		

  	function createNewNode(){
  		var name= document.getElementById('nodeName').value
  		var group = document.getElementById('nodeGroup').value
		var note = document.getElementById('note').value
  		var initPosition = {x: 200, y: 200}
  		var network = document.getElementById('currentNet').value
  		console.log('whooop',network)
  		
  		if (!network) {
  			alert('select a network first')
  		}
  		if (network){
  			console.log('doit!')
  			var url = 'http://www.ourlifenet.com/addNode'
			var body = {network: network, nodeName: name, nodeGroup: group, position: initPosition, note:note}
		  	postJson(url, body, function (err, result) {
			})
			addNode(name,group)	
		}
/*			tapOnNodes()
*/	}


	function loadGroups (callback3){

		var listOfGroupLinks = ""
		var stream3 = hyperquest('http://www.ourlifenet.com/loadGroups')
		.pipe(
			catS(function(data){
				var x = data.toString()
				var y = JSON.parse(x)
				console.log('this is y from groups', y)

				for (i = 0; i<y.length; i++){
					console.log('yep',y[i])
					var groupLink = '<tr><button class = "groups" id="'+y[i].key+'">'+y[i].key+'</button><br>'
				
					listOfGroupLinks += groupLink
				}
				var parent= document.getElementById('groupLinkContent')
				parent.innerHTML=listOfGroupLinks
			})
		)
		stream3.on('finish', function(){
			console.log('its done')
			var groups1 = document.getElementsByClassName('groups')

			for(var i = 0; i < groups1.length; i++)
 			{
   				console.log(groups1.item(i));
   				groups1.item(i).addEventListener('click',graphSpecificGroup)
			 }
		})
	}


	

	function addNewEdge(firstNodeId, secondNodeId) {
		var url = 'http://www.ourlifenet.com/addEdge'
		var currentNet = document.getElementById('currentNet').value
		var body = {firstNode: firstNodeId, secondNode:secondNodeId, net: currentNet} 


		console.log('hi1')
		postJson(url,body, function(err,result){
			console.log('hi2')
		})
			addDirectedEdge(firstNodeId, secondNodeId)

	}


	function graphSpecificGroup(){ 
		var group= this.id
		this.style.background= "blue"
		var stream2 = hyperquest('http://www.ourlifenet.com/graphSpecificGroup/'+group)
		console.log('hi', group)
		console.log('jackpot', stream2)
		loadNodes(stream2)
	}


	function graphSpecificNet(){
		clearAllNodes()
		var net= this.id
		document.getElementById('currentNet').value = net
		console.log('tryna graph this', net)
		var stream3 = hyperquest('http://www.ourlifenet.com/graphSpecificNet/'+net)
		console.log('hi77777777777777777777', net)
		console.log('jackpot', stream3)
		loadNodes(stream3)
		tapOnNodes()
		tapOnEdges()
		loadEdges()	
	}

function tapOnNodes () {
  var nClicked = false;
	var firstNode = {}
	var secondNode = {}
	var edgeClicked=false;
  cy.on('tap', 'node', function(evt){
    console.log('tappin!!!', evt.target,'or', evt.cyTarget,'heee', evt.target.id(),'mmmm', evt.target.id)
	//second click
    if (nClicked) {
      nClicked = false
      secondNode = evt.target
      var firstNodeId= firstNode.id()
      var secondNodeId = secondNode.id()
      if (secondNodeId === firstNodeId){
        console.log('clicked myself')
        var currentNet= document.getElementById('currentNet').value
        window.open('http://www.ourlifenet.com/nodeInfo/'+currentNet+'/'+evt.target.id(), 'Node Info', 'height= 470, width=470, return false') 
      }
      else {
        console.log('wwooooo!!!!!!!!!!!!!!!!!!!!')
  	   addNewEdge(firstNodeId, secondNodeId)  
      }
    }
    //first click
    else 
    {
      nClicked=true
      firstNode= evt.target
      // firstNodeId = firstNode.id()
      console.log('hiii')
      console.log('a', firstNode, 'b', firstNodeId)
    }
  })
}

function tapOnEdges () {
  var nClicked = false;
	var firstNode = {}
	var secondNode = {}
	var edgeClicked=false;
  cy.on('tap', 'edge', function(evt){
    console.log('tappin!!!', evt.target,'or', evt.cyTarget,'heee', evt.target.id(),'mmmm', evt.target.id)
	//second click
    if (nClicked) {
      nClicked = false
      
        var currentNet= document.getElementById('currentNet').value
        window.open('http://www.ourlifenet.com/nodeInfo/'+currentNet+'/'+evt.target.id(), 'Node Info', 'height= 470, width=470, return false') 
    
      
    }
    //first click
    else 
    {
      nClicked=true
      // firstNodeId = firstNode.id()
    }
  })
}


	function graphAllNodes(){
	  	console.log('woooo')
	    var stream1 = hyperquest('http://www.ourlifenet.com/graphAllNodes')
	    loadNodes(stream1)
	}

	function loadNodes(stream1){

		stream1.pipe(catS(function(data){
			var arrayOfOs= JSON.parse(data)
			
			console.log('hhhhh!!!!!!!!!', arrayOfOs)
			for (i = 1; i<arrayOfOs.length; i++){
				console.log('fopy1!', arrayOfOs[i].nodeName,'anddd', arrayOfOs[i].position,'or')
				console.log('bammm!', arrayOfOs[i].edges)
				var edges = arrayOfOs[i].edges
				console.log('myEdges', edges, 'orr', edges.out, 'annnd', edges.out)
				edges.out.forEach(function(arrayItem){
					console.log('pss', arrayItem)
				})

				cy.add({
			        group:"nodes",
			        data: {
			          weight:75,
			          id:arrayOfOs[i].nodeName,
			        },
			        position: {x: arrayOfOs[i].position.x, y : arrayOfOs[i].position.y},
			        classes:arrayOfOs[i].group,
			    })

			    if (arrayOfOs[i].edges.out){
			    	
			    	console.log('ahhhpprrr', arrayOfOs[i].nodeName, 'and', arrayOfOs[i].edges.out)
			    	
			    arrayOfOs[i].edges.out.forEach(function(arrayItem){
			    	
			    	console.log('ahhhee!','source', arrayOfOs[i].nodeName,'target', arrayItem)

			    	cy.add({	
			      		data: {
			        		source: arrayOfOs[i].nodeName,
			        		target: arrayItem
			      		}
			    	})
			    })
			    }
				
			}

			/*for (i = 1; i<arrayOfOs.length; i++){
				if (arrayOfOs[i].edges.out) {
					console.log('inn: ',arrayOfOs[i].edges.in, 'out: ',arrayOfOs[i].edges.out)
    				// for (var i = 0; i < arrayOfOs[i].edges.out.length; i++) {
    				// }		
    					cy.add({	
				      		data: {
				        		source: arrayOfOs[i].nodeName,
				        		target: arrayOfOs[i].edges.out[i]
				      		}
				    	})
    				
	    		}
	    	}*/

			
		}))
	}
	    	

	function loadEdges(){
		console.log('Fuuuu')
	    hyperquest('http://www.ourlifenet.com/loadEdges')
	    .pipe(
	    	catS(function(data){
	    		var x = data.toString()
	    		var y = JSON.parse(x)
	    		console.log('thisisy', y)
	    		console.log('type', typeof y)
	    		console.log('length of y', y.length)
		var z = y.value
	    		z.forEach(function(arrayItem){
	    			console.log('here: ', arrayItem)
	    			arrayItem.value.forEach(function(elem){		
	    				if (elem.edges.out) {
	    					console.log('inn: ',elem.edges.in, 'out: ',elem.edges.out)
		    				
		    				for (var i = 0; i < elem.edges.out.length; i++) {
		    					
		    					cy.add({	
						      		data: {
						        		source: elem.nodeName,
						        		target: elem.edges.out[i]
						      		}
						    	})

		    				}

			    				
					
	    				}	
	    			})
	    		
	    		})
	    	})
	    )
	}

	function savePositions(){
		console.log('match thisss!!!!!!!!!', document.getElementById('currentNet'))
		if (document.getElementById('currentNet').value){
			console.log('ooooook')
			cy.nodes().forEach(function(ele){
				console.log( ele.id() )
				console.log('gotacatchem ', ele)
				var id= ele.id()
				var positionObject= ele.renderedPosition()
				var currentNet = document.getElementById('currentNet').value
				console.log('yippppeee', currentNet)

				var url = 'http://www.ourlifenet.com/savePositions'
				var body= {name:id, positionObject, currentNet}

				postJson(url,body,function(err,result){
					console.log('client side positions posted')
				})
			})
		}
		else{console.log('ooopsy lnf.savePositions')}
	}

}




