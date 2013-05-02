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
    
    var onClose = function(event) {
        comm.displayError('Connection failed',
                'Connection to server <strong>' + comm.gameServer + '</strong> has failed.',
                function(){
                    $('#dlgError').hide();
                    $('#dlgConnect').show();
        });

        console.info('onClose ' + event);
    };

    var onOpen = function(event) {
        console.info('onOpen ' + event);
    };

    var onError = function(event) {
        comm.displayError('Connection failed',
                'Connection to server <strong>' + comm.gameServer + '</strong> has failed.');

        console.info('onError ' + event);
    };

    this.connect = function(userId, gameServer) {
        console.info(userId + '@' + gameServer);

        gameSocket = new WS('ws://' + gameServer + '/battlefield/comm?userId=' + userId);
        //gameSocket = new WS("ws://localhost:9000/battlefield/comm?userId=" + id);
        gameSocket.onmessage = receiveEvent;
        
        gameSocket.onopen = onOpen;
        gameSocket.onclose = onClose;
        gameSocket.onerror = onError;
    };
    
    this.sendMessage = function() {
        gameSocket.send(JSON.stringify(
            {text: $("#talk").val()}
        ));
        $("#talk").val('');
    };
    
    this.displayError = function(title, text, okHandler) {
        $('#dlgError .header').html(title);
        $('#dlgError .text').html(text);
        $('#dlgError').show();
        if (okHandler) {
            $('#dlgErrorBtnOK').focus().click(function(){
                okHandler.call(okHandler);
            });
            
            
            
//            $('document').keypress(function(e) {
//                if(e.which == 13) {
//                    console.info('enter');
//                    okHandler.call(okHandler);
//                }
//            });
        }
    };
    
    this.initDialogs = function() {
        var list = ['battlefield.show.cloudbees.net', 'localhost:9000'];
        var options = $('#gameServer');
        $.each(list, function() {
            options.append($('<option/>').val(this).text(this));
        });
        
        var connectHandler = function() {
            comm.userId = $('#userId').val();
            comm.gameServer = $('#gameServer').val();
            if (comm.userId.length > 0) {
                comm.connect(comm.userId, comm.gameServer);
                $('#dlgConnect').hide();
            }
        };
        
        $('#dlgConnectBtnOK').click(connectHandler);
        
        $('#dlgConnect').keypress(function(e) {
            if(e.which == 13) {
                connectHandler.call(this, []);
            }
        });
        
//        this.displayError('Connection failed',
//                'abc');
    };
})();

//console.info(comm);