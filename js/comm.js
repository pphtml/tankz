var comm = function() {
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
            comm.displayError('Error',
                    data.error,
                    function(){
                        $('#dlgError').hide();
                        comm.displayConnectDlg();
            });

//            $("#onError span").text(data.error);
//            $("#onError").show();
        } else {
            //console.info(data);
            if (data.msgType in msgRouting) {
                var route = msgRouting[data.msgType];
                var handlerFc = route.handlerFc;
                handlerFc.call(route.instance, data);
            }
        }
    };
    
    var onClose = function(event) {
        comm.displayError('Connection failed',
                'Connection to server <strong>' + comm.gameServer + '</strong> has failed. Server is not responding.',
                function(){
                    $('#dlgError').hide();
                    comm.displayConnectDlg();
        });

        console.info('onClose ' + event);
    };

    var onOpen = function(event) {
        //console.info('onOpen ' + event);
    };

    var onError = function(event) {
//        comm.displayError('Connection failed',
//                'Connection to server <strong>' + comm.gameServer + '</strong> has failed.');

        console.info('onError ' + event);
    };

    this.connect = function(userId, gameServer) {
        console.info('connecting to server ' + gameServer + ' as user ' + userId);

        gameSocket = new WS('ws://' + gameServer + '/battlefield/comm?userId=' + userId);
        gameSocket.onmessage = receiveEvent;
        
        gameSocket.onopen = onOpen;
        gameSocket.onclose = onClose;
        gameSocket.onerror = onError;
    };
    
//    this.sendMessage = function() {
//        gameSocket.send(JSON.stringify(
//            {text: $("#talk").val()}
//        ));
//        $("#talk").val('');
//    };
    
    this.displayConnectDlg = function() {
        $('#dlgRooms').hide();
        $('#dlgConnect').show();
        $('#userId').focus();

    };
    
    var htmlRoom = function(room) {
        var str = '';
        for (var j = 0, lengthJ = room.users.length; j < lengthJ; j++) {
            var user = room.users[j];
            str += '<li><span class="label team-' + user.teamColor.toLowerCase() + '">' + user.username + '</span>' + '</li>\n';
//            console.info(zzz);
        }
        
        var li = $('<li>' + room.roomName + '<ul>' + str + '</ul></li>');
        return li;
    };
    
    this.displayRoomsDlg = function(data) {
        var rooms = data.rooms;
        $('#dlgRoomsBtnNew').show()[0].teamColors = data.teamColors;
        //console.info(rooms);
        $('#dlgRooms').show();
        
        var ul = $('#dlgRooms .content ul');
        ul.empty();
        
        for (var i = 0, length = rooms.list.length; i < length; i++) {
            var room = rooms.list[i];
            
            //var zzz = $(list, 'li ul');
            ul.append(htmlRoom(room));
        }
        
//        ul.append('<li><ul><li>blabol</li><li>kokoko</li></ul></li>');
        //$('#userId').focus();

    };
    
    this.displayError = function(title, text, okHandler) {
        var visible = $('#dlgError').is(":visible");
        if (!visible) {
            //console.info('visible: ' + visible);
            var z = $('#dlgError .header');
            z.html(title);
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
        }
    };
    
    this.initDialogs = function() {
        var list = ['battlefield.show.cloudbees.net', 'localhost:9000'];
        var options = $('#gameServer');
        $.each(list, function() {
            options.append($('<option/>').val(this).text(this));
        });
        var lastUsedGameServer = localStorage.getItem('gameServer');
        if (lastUsedGameServer) {
            $('#gameServer option[value="' + lastUsedGameServer + '"]').prop('selected', true);
        }
        
        var connectHandler = function() {
            comm.userId = $('#userId').val();
            comm.gameServer = $('#gameServer').val();
            if (comm.userId.length > 0) {
                localStorage.setItem('gameServer', comm.gameServer);
                comm.connect(comm.userId, comm.gameServer);
                $('#dlgConnect').hide();
            }
        };
        
        var newRoomHandler = function() {
            $(this).hide();
            var ul = $('#dlgRooms > .content > ul');
            var list = $('<li id="room_newRoom"><input type="text" name="roomName" id="roomName"></input>' +
                    '<select id="teamColor"></select>' +
                    '<button class="btn btn-inverse" id="dlgRoomsBtnNewOK">OK</button><button class="btn btn-inverse" id="dlgRoomsBtnNewCancel">Cancel</button></li>');
            ul.append(list);
            var options = $('#teamColor');
            //var teamColors = $('#dlgRoomsBtnNew')[0].teamColors;
            var teamColors = this.teamColors;
            $.each(teamColors, function() {
                options.append($('<option/>').val(this).text(this));
            });
            $('#roomName').focus();
            $('#dlgRoomsBtnNewOK').click(function(){
                var roomName = $('#roomName').val();
                var teamColor = $('#teamColor').val();
                var msg = JSON.stringify(
                        {msgType: 'NEW_ROOM',
                            room: {roomName: roomName,
                                   users:[{username: comm.userId, teamColor:teamColor, roomOwner: true}]
                            },
//                            roomName: roomName,
//                            teamColor: teamColor,
                            msgOriginator: comm.userId
                            //userId: $('#userId').val()  // TODO pouzij comm.userId
                            } 
                    );
                //console.info(msg);
                gameSocket.send(msg);
                $('#room_newRoom').remove();
            });
            $('#dlgRoomsBtnNewCancel').click(function(){
                $('#room_newRoom').remove();
                $('#dlgRoomsBtnNew').show();
            });
        };
        
        $('#dlgConnectBtnOK').click(connectHandler);
        $('#dlgRoomsBtnNew').click(newRoomHandler);
        $('#dlgRoomsBtnDisconnect').click(function(){
            var msg = JSON.stringify(
                    {msgType: 'QUIT',
                        msgOriginator: comm.userId}
                );
            //console.info(msg);
            gameSocket.send(msg);
            comm.displayConnectDlg();
        });
        
        $('#dlgConnect').keypress(function(e) {
            if(e.which == 13) {
                connectHandler.call(this, []);
            }
        });
        
        this.msgJoin = function(msg) {
            if (msg.msgOriginator === comm.userId) {
                this.displayRoomsDlg(msg);
            }
        };
        
        this.registerRoute('JOIN', this, this.msgJoin);
        this.registerRoute('NEW_ROOM', this, this.msgNewRoom);
        
        this.displayConnectDlg();
        
        
//        this.displayError('Connection failed',
//                'abc');
    };
    
    this.msgNewRoom = function(msg) {
//        if (msg.msgOriginator === comm.userId) {
//            this.displayRoomsDlg(msg);
//        }
        var ul = $('#dlgRooms > .content > ul');
//        var list = $('<li>blabla bleble</li>');
//        ul.append(list);
        
        ul.append(htmlRoom(msg.room));
    };
};

comm = new comm(); // not inlined because my IDE works better this way :D

//console.info(comm);