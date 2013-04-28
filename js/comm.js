var comm = new (function() {
    var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket;
    var gameSocket = null;
    var msgRouting = {};
    
    this.registerRoute = function(msgType, instance, handlerFc) {
        msgRouting[msgType] = {instance: instance, handlerFc: handlerFc};
    };

    var receiveEvent = function(event) { // TODO dat nakonec tridy
        var data = JSON.parse(event.data);
        
        // Handle errors
        if(data.error) {
            gameSocket.close();
            console.error('gameSocket: ' + data.error);
//            $("#onError span").text(data.error);
//            $("#onError").show();
        } else {
            console.info('msgType: ' + data.msgType);
            if (data.msgType in msgRouting) {
                var route = msgRouting[data.msgType];
                var handlerFc = route.handlerFc;
                handlerFc.call(route.instance, data);
            }
        }
    };

    this.connect = function(id) {
        gameSocket = new WS("ws://battlefield.show.cloudbees.net/battlefield/comm?userId=" + id);
        //gameSocket = new WS("ws://localhost:9000/battlefield/comm?userId=" + id);
        gameSocket.onmessage = receiveEvent;
    };
    
    this.sendMessage = function() {
        gameSocket.send(JSON.stringify(
            {text: $("#talk").val()}
        ));
        $("#talk").val('');
    };
    
})();

//console.info(comm);