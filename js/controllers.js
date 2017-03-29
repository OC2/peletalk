angular.module('app.controllers', [])

.controller('registerCtrl', function($scope , $state , sharedConn   ) { 
	
	$scope.goToLogin=function(){
		$state.go('login', {}, {location: "replace", reload: true});
	}
	$scope.reg=function(r){
		sharedConn.register(r.jid,r.pass,r.name);
	}
	//Comment
	$scope.insert=function(r){
		$scope.register.jid="T " + $scope.register.jid ;
	}
	
	
})

.controller('settingsCtrl', function($scope,$state,$cordovaSQLite,$ionicPopup,sharedConn,$rootScope) {
	
	
	$scope.userimage ='';

$scope.getimg =  function() {
   
sharedConn.connection.vcard.get(function(stanza) {
            var $vCard = $(stanza).find("vCard");
            var img = $vCard.find('BINVAL').text();
            var type = $vCard.find('TYPE').text();
           $scope.userimage  = img;
	
        },
                         'oren@pelephone.co.il');
						 
						 
						 $rootScope.$apply();
} ;

   
	
	
	$scope.DeleteDB = function()
	{
		
		var confirmPopup = $ionicPopup.confirm({
				 title: 'Warning!',
				 template: ' you are about to delete all you history'
			});
			
		   confirmPopup.then(function(res) {
			 if(res) {
			   	console.log("Delete DataBase");
		$cordovaSQLite.execute($rootScope.db,"DROP TABLE chats");
		$cordovaSQLite.execute($rootScope.db,"DROP TABLE contacts");
		sharedConn.logout();
		$state.go('login', {}, {location: "replace", reload: true});
			 } else {
			 	console.log("Delete DataBase Canceled");
			 }
		   });
		   
		   
	
	}
	
	
	
	$scope.DeleteDBContact = function()
	{
		
		var confirmPopup = $ionicPopup.confirm({
				 title: 'Warning!',
				 template: ' you are about to delete all you contacts'
			});
			
		   confirmPopup.then(function(res) {
			 if(res) {
			   	console.log("Delete DataBase");
		
		$cordovaSQLite.execute($rootScope.db,"DROP TABLE contacts");
		
			 } else {
			 	console.log("Delete DataBase Canceled");
			 }
		   });
		   
		   
	
	}
	
	
	
	$scope.logout=function(){
		console.log("T");
		sharedConn.logout();
		$state.go('login', {}, {location: "replace", reload: true});
	};
})





.controller('UserProfileCtrl', function($scope,$state,$cordovaSQLite,$ionicPopup,sharedConn,$rootScope,UserProfile,sqlContact) {
	var jid = UserProfile.getTo();
	
$scope.contact = sqlContact.loadContacts(jid);
	
	



  $scope.to_id =  UserProfile.getTo();
 $scope.userimage =UserProfile.getimage();


	
	

})


.controller('contactsCtrl', function($scope,Chats,$state,ChatDetails,sqlContact) {
 
	 var contacts   = 	Chats.allRoster();
	 
	 $scope.chats =   sqlContact.loadAllContacts();
	   $scope.showface = function(jid){
		   
		  var face = sqlContact.loadContacts(jid).photo ;
		  return face
	   }
	  $scope.remove = function(chat) {
		Chats.removeRoster(chat);
	  };
	
	  
	  $scope.chatD=function(to_id){ 
		ChatDetails.setTo(to_id);
		$state.go('tabsController.chatDetails', {}, {location: "replace", reload: true});
	  };
	  
	  
	  $scope.add = function(add_jid){
		Chats.addNewRosterContact(add_jid);
	  };
	  
})

.controller('chatlogsCtrl', function($scope,sql,sharedConn, ChatDetails, $state) {
	var myid= sharedConn.getBareJid( sharedConn.getConnectObj().jid );
	$scope.chatlogs = sql.loadChats(myid);
	
	$scope.chatD=function(to_id){ 
		ChatDetails.setTo(to_id);
		$state.go('tabsController.chatDetails', {}, {location: "replace", reload: true});
	};
	

})

.controller('loginCtrl', function($scope , sharedConn,$state) {

	var XMPP_DOMAIN  = 'xvamp'; // Domain we are going to be connected to.
	var xmpp_user    = 'admin';     // xmpp user name
	var xmpp_pass    = 'admin';
	
	$scope.goToRegister=function(){
		$state.go('register', {}, {location: "replace", reload: true});
	}
	
	
	
	$scope.login=function(user){
		
		window.localStorage.setItem("userjid", user.jid);
		window.localStorage.setItem("userpass", user.pass);
		window.localStorage.setItem("XMPP_DOMAIN", XMPP_DOMAIN);
		sharedConn.login(user.jid,XMPP_DOMAIN,user.pass);
	}
	
	var userjid = window.localStorage["userjid"];
	var userpass = window.localStorage["userpass"];
	
	if (userjid)
	{
		sharedConn.login(userjid,XMPP_DOMAIN,userpass);
	}

	//
})


.controller('chatDetailsCtrl', function($scope, $timeout, $ionicScrollDelegate,sharedConn,ChatDetails,UserProfile,sql,$state) {

  $scope.hideTime = true;
  $scope.data = {};
  $scope.myId = sharedConn.getBareJid( sharedConn.getConnectObj().jid );
  $scope.to_id=ChatDetails.getTo();
 
  //Loading Previous Conversation
  $scope.messages = sql.showChats( $scope.myId , $scope.to_id );
   $scope.goprofile=function(to_id){ 
		console.log(to_id);
		UserProfile.setTo(to_id);
		$state.go('tabsController.UserProfile', {}, {location: "replace", reload: true});
	  };
	  
	  
  $ionicScrollDelegate.scrollBottom(true);

 
  
  
  var isIOS = ionic.Platform.isIOS(); 
  
  	$scope.sendMsg=function(to,body){
		var to_jid  = Strophe.getBareJidFromJid(to);
		var timestamp = new Date().getTime();
		var reqChannelsItems = $msg({id:timestamp, to:to_jid , type: 'chat' })
								   .c("body").t(body);
		sharedConn.getConnectObj().send(reqChannelsItems.tree());
	
	};
  
  

  $scope.showSendMessage = function() {
	  
	$scope.sendMsg($scope.to_id,$scope.data.message);  

    var d = new Date();
    d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
	
	//Adding the message to UI
    $scope.messages.push({
      userId: $scope.myId,
      text: $scope.data.message,
      time: d
    });
	
	
	//SQL -- MSG SEND
	sql.insertChat({
		to_id: $scope.to_id,
		from_id:$scope.myId,
		message: $scope.data.message
	});	

    delete $scope.data.message;
    $ionicScrollDelegate.scrollBottom(true);

  };
  
  
  $scope.messageRecieve=function(msg){	
  
	//  var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	from=sharedConn.getBareJid(from);
	
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');
  
	var d = new Date();
    d = d.toLocaleTimeString().replace(/:\d+ /, ' ');

	if (type == "chat" && elems.length > 0 ) {
		  
		var body = elems[0];
		var textMsg = Strophe.getText(body);
		
		
		//SQL -- MSG RECIEVE
		sql.insertChat({
			to_id: $scope.myId,
			from_id: from,
			message: textMsg
		});
		
		
		if( from == $scope.to_id ){
			
			$scope.messages.push({
			  userId: from,
			  text: textMsg,
			  time: d
			});
			
			$ionicScrollDelegate.scrollBottom(true);
			$scope.$apply();
			
			console.log($scope.messages);
			console.log('Message recieved from ' + from + ': ' + textMsg);
		}
		
	}
		
  }
  
  
   $scope.$on('msgRecievedBroadcast', function(event, data) {
		$scope.messageRecieve(data);
    })


  $scope.inputUp = function() {
    if (isIOS) $scope.data.keyboardHeight = 216;
    $timeout(function() {
      $ionicScrollDelegate.scrollBottom(true);
    }, 300);

  };

  $scope.inputDown = function() {
    if (isIOS) $scope.data.keyboardHeight = 0;
    $ionicScrollDelegate.resize();
  };

  $scope.closeKeyboard = function() {
    // cordova.plugins.Keyboard.close();
  };




});


