$(function () {
    addLog('loading main.js');
    var socket;
    function initSocket() {
        addLog('initializing connection');
        // connect to local osc bridge
        socket = io.connect('http://127.0.0.1', { port: 8081, rememberTransport: false});
        socket.on('connect', function() {
            addLog('connected!');
            // sends to socket.io server the host/port of oscServer
            // and oscClient
            socket.emit('config',
                {
                    //vastaanotto proxylta
                    server: {
                        port: 3333,
                        host: '127.0.0.1'
                    },
                    //lahetys eli mikserin ip
                    client: {
                        port: 10023,
                        host: '127.0.0.1'
                    }
                }
            );
        });
        socket.on('message', function(obj) {
            console.log('got message', obj);
            triggerMessage(obj[0], obj[1]);
        });
    }
    initSocket();

    interact('.slider')                   // target the matches of that selector
        .origin('self')                     // (0, 0) will be the element's top-left
        .draggable({                        // make the element fire drag events
            max: Infinity,                     // allow drags on multiple elements
            restrict: {
                restriction: 'self'
            }
        })
        .on('dragmove', function (event) {  // call this function on every move
            var sliderHeight = interact.getElementRect(event.target).height;
            var value = event.pageY / sliderHeight;

            $(event.target).data('handler')($(event.target), (1 - value));
        });

    interact('.toggle')
        .on('tap', function (event) {
            var isSet = (1 == event.target.getAttribute('data-value'));
            $(event.target).data('handler')($(event.target), isSet ? 0 : 1);
        })
    ;

    interact('.momentary')
        .on('down', function (event) {
            $(event.target).data('handler')($(event.target), 1);
        })
        .on('up', function (event) {
            $(event.target).data('handler')($(event.target), 0);
        })
    ;

    function addLog(text) {
        $('.log').prepend($('<div>' + text + '</div>'));
    }

    function sendMessage(parameter, value, type) {
        type = type || 'float';
        var message;
        if (value) {
            message = {address: parameter, args: [{type: type, value: value}]};
        } else {
            message = {address: parameter};
        }
        addLog(parameter + ' ' + (value ? value : ''));
        socket.emit('message', message);
    }

    function triggerMessage(parameter, value) {
        console.log('triggering message', parameter, value);
        addLog(parameter + ' ' + value);
        events.triggerHandler(parameter, value);
    }

    interact.maxInteractions(Infinity);   // Allow multiple interactions


    var events = $({});

    var controlWrapperTemplate = '<div class="control-wrapper"><div class="control-name"></div></div>';
    var sliderTemplate = '<div class="slider"><div class="slider_content"></div></div>';
    var momentaryTemplate = '<div class="momentary button button-off"></div>';
    var toggleTemplate = '<div class="toggle button button-off"></div>';

    function addControl(container, elementBuilder, name, parameter) {
        var control = elementBuilder(parameter);
        var wrapped = $(controlWrapperTemplate).prepend(control);
        wrapped.find('.control-name').text(name);
        container.append(wrapped);
    }

    var momentaryControl = function(parameter) {
        return buttonControl(momentaryTemplate, parameter);

    };

    var toggleControl = function(parameter) {
        return buttonControl(toggleTemplate, parameter);
    };

    var buttonControl = function(template, parameter) {
        var element = $(template);
        var handleValue = function (element, value, skipSend) {
            element.attr('data-value', value);
            if (value === 1) {
                element.addClass('button-on');
                element.removeClass('button-off');
            } else if (value === 0) {
                element.addClass('button-off');
                element.removeClass('button-on');
            }

            if (!skipSend) sendMessage(parameter, value, 'integer');

        };
        events.on(parameter, function (event, value) {
            console.log('received value', value, 'for parameter', parameter);
            handleValue(element, value, true);
        });
        element.data('handler', handleValue);
        sendMessage(parameter);
        return element;
    };

    var sliderControl = function(parameter) {
        var element = $(sliderTemplate);
        var content = element.find('.slider_content');
        var handleValue = function (element, value, skipSend) {
            element.attr('data-value', value);
            content.css('top', ((1 - value) * 100) + '%');

            if (!skipSend) sendMessage(parameter, value, 'float');
        };
        events.on(parameter, function (event, value) {
            console.log('received value', value, 'for parameter', parameter);
            handleValue(element, value, true);
        });
        element.data('handler', handleValue);
        sendMessage(parameter);
        return element;
    };

    var mainContainer = $('.container');
    var leftGroup = $('<div class="container group-container justify-left"></div>');
    var rightGroup = $('<div class="container group-container justify-right"></div>');

    var group1 = $('<div class="group justify-left"></div>');
    var group2 = $('<div class="group justify-right"></div>');
    var group3 = $('<div class="group justify-left"></div>');
    var group4 = $('<div class="group justify-right"></div>');

    mainContainer
        .append(leftGroup)
        .append(rightGroup);

    leftGroup
        .append(group1)
        .append(group3);
    rightGroup
        .append(group2)
        .append(group4);


    addControl(group1, momentaryControl, 'intercom', '/ch/11/mix/on');
    addControl(group1, toggleControl, 'on air', '/ch/01/mix/on');

    addControl(group2, momentaryControl, 'intercom', '/ch/12/mix/on');
    addControl(group2, toggleControl, 'on air', '/ch/02/mix/on');

    addControl(group3, sliderControl, 'caster 2', '/ch/02/mix/01/level');
    addControl(group3, sliderControl, 'game', '/ch/03/mix/01/level');
    addControl(group3, sliderControl, 'program', '/ch/10/mix/01/level');
    addControl(group3, sliderControl, 'talkback', '/ch/17/mix/01/level');

    addControl(group4, sliderControl, 'caster 1', '/ch/01/mix/02/level');
    addControl(group4, sliderControl, 'game', '/ch/03/mix/02/level');
    addControl(group4, sliderControl, 'program', '/ch/10/mix/02/level');
    addControl(group4, sliderControl, 'talkback', '/ch/17/mix/02/level');


    window.setTimeout(function () {
        console.log('triggering handlers');
        triggerMessage('/ch/02/mix/01/level', 0.5);
        triggerMessage('/ch/01/mix/on', 1);
    }, 5000);
});
