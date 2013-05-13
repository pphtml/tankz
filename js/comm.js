var comm = function() {
    var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket;
    this.gameSocket = null;
    this.roomId = null;
    var msgRouting = {};
    
    this.registerRoute = function(msgType, instance, handlerFc) {
        msgRouting[msgType] = {instance: instance, handlerFc: handlerFc};
    };

    var receiveEvent = function(event) { // TODO dat nakonec tridy
        var data = JSON.parse(event.data);
        
        // Handle errors
        if(data.error) {
            comm.gameSocket.close();
            comm.roomId = null;
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
        if (comm.gameSocket) {
            comm.displayError('Connection failed',
                    'Connection to server <strong>' + comm.gameServer + '</strong> has failed. Server is not responding.',
                    function(){
                        $('#dlgError').hide();
                        comm.displayConnectDlg();
            });
            delete comm.gameSocket;
            comm.roomId = null;
        }

        console.info('onClose ' + event + ' ' + comm.gameSocket);
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

        comm.gameSocket = new WS('ws://' + gameServer + '/battlefield/comm?userId=' + userId);
        comm.gameSocket.onmessage = receiveEvent;
        
        comm.gameSocket.onopen = onOpen;
        comm.gameSocket.onclose = onClose;
        comm.gameSocket.onerror = onError;
    };
    
//    this.sendMessage = function() {
//        this.gameSocket.send(JSON.stringify(
//            {text: $("#talk").val()}
//        ));
//        $("#talk").val('');
//    };
    
    this.displayConnectDlg = function() {
        $('#dlgRooms').hide();
        $('#dlgConnect').show();
        $('#userId').focus();

    };
    
    var teamColorToBootstrapBtn = {
        'GREEN': 'btn-success',
        'BLUE': 'btn-primary',
        'RED': 'btn-danger',
        'YELLOW': 'btn-warning'
    };
    
    var htmlRoom = function(room) {
        var str = '<div class="join-existing">';
        for (var i = 0, length = room.users.length; i < length; i++) {
            var user = room.users[i];
//            str += '<li><span class="label team-' + user.teamColor.toLowerCase() + '">' + user.username + '</span>' + '</li>\n';
            str += '<button class="btn inactive ' + teamColorToBootstrapBtn[user.teamColor] + '" id="' + id + '">' + user.username + '</button>';
//            console.info(zzz);
        }
        str += '</div>';
        
        if (!comm.roomId) {
            str += '<div class="join-part">join as';
            
            for (var i = 0, length = room.unusedTeamColors.length; i < length; i++) {
                var unusedColor = room.unusedTeamColors[i];
                var id = 'room_' + room.roomName + '_team_' + unusedColor;
                str += '<button class="btn btn-join ' + teamColorToBootstrapBtn[unusedColor] + '" id="' + id + '">&nbsp;</button>';
                //console.info(unusedColor);
            }
            str += '</div>';
        }
        
        var li = $('<li id="room_' + room.roomId + '">' + room.roomName + '<br/>' + str + '</li>');
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
        
        $('.btn-join').click(function(){
            //console.info(this.id);
            var ids = /room_(.+)_team_(\w+)/.exec(this.id);
            var roomName = ids[1];
            var teamColor = ids[2];
            //console.info('' + roomName + ', ' + teamColor);
            var msg = JSON.stringify(
                    {msgType: 'JOIN_ROOM',
                        roomName: roomName,
                        teamColor: teamColor,
                        msgOriginator: comm.userId
                        } 
                );
            console.info(msg);
            comm.gameSocket.send(msg);
        });
        
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
            var str = '<li id="room_newRoom"><div>session name: <input type="text" name="roomName" id="roomName"></input></div><div class="team-color-selection">team color: ';
            //<button class="btn btn-inverse" id="dlgRoomsBtnNewOK">OK</button>
            //var options = $('#teamColor');
            //var teamColors = $('#dlgRoomsBtnNew')[0].teamColors;

            var teamColors = this.teamColors;
            $.each(teamColors, function() {
                //options.append($('<option/>').val(this).text(this));
                str += '<button class="btn btn-new-room ' + teamColorToBootstrapBtn[this] + '" id="teamColor_' + this + '">&nbsp;</button>';

            });
            str += '</div><div><button class="btn btn-inverse" id="dlgRoomsBtnNewCancel">Cancel</button></div></li>';
            var list = $(str);
            ul.append(list);

            $('#roomName').focus();
            $('.btn-new-room').click(function(){
                var roomName = $('#roomName').val();
                var teamColor = /teamColor_(\w+)/.exec(this.id);
                teamColor = teamColor[1];
                //var teamColor = $('#teamColor').val();
                var msg = JSON.stringify(
                        {msgType: 'NEW_ROOM',
                            room: {roomName: roomName,
                                   users:[{username: comm.userId, teamColor:teamColor}]
                            },
//                            roomName: roomName,
//                            teamColor: teamColor,
                            msgOriginator: comm.userId
                            //userId: $('#userId').val()  // TODO pouzij comm.userId
                            } 
                    );
                //console.info(msg);
                comm.gameSocket.send(msg);
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
            comm.gameSocket.send(msg);
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
        this.registerRoute('QUIT', this, this.msgQuit);
        this.registerRoute('JOIN_ROOM', this, this.msgJoinRoom);
        
        this.displayConnectDlg();
        
        
//        this.displayError('Connection failed',
//                'abc');
    };
    
    this.msgJoinRoom = function(msg) {
        if (msg.msgOriginator === comm.userId) {
            comm.roomId = msg.updatedRoom.roomId;
        }
        var li = $('#room_' + msg.updatedRoom.roomId);
        var html = htmlRoom(msg.updatedRoom);
        console.info(li);
        console.info(msg);
        console.info(html);
        li.replaceWith(html);
        $('.join-part').remove();
        //li.hide();
    };
    
    this.msgQuit = function(msg) {
        if (this.userId === msg.msgOriginator) {
            this.gameSocket.close();
            this.gameSocket = null;
            this.roomId = null;
        }
        console.info("QUIT ");
        console.info(msg);
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