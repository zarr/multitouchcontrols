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

        $(event.target).data('handler')($(event.target), value);
    });

interact('.toggle')
    .on('tap', function (event) {
        var isSet = ('ON' == event.target.getAttribute('data-value'));
        $(event.target).data('handler')($(event.target), isSet ? 'OFF' : 'ON');
    })
;

interact('.momentary')
    .on('down', function (event) {
        $(event.target).data('handler')($(event.target), 'ON');
    })
    .on('up', function (event) {
        $(event.target).data('handler')($(event.target), 'OFF');
    })
;

function sendMessage(message) {
    $('.log').text(message);
}

function triggerMessage(message) {
    var splitMessage = message.split(' ');
    events.triggerHandler(splitMessage.shift(), splitMessage.join(' '));
}

interact.maxInteractions(Infinity);   // Allow multiple interactions


var events = $({});

var controlWrapperTemplate = '<div class="control-wrapper"><div class="control-name"></div></div>';
var sliderTemplate = '<div class="slider"><div class="slider_content"></div></div>';
var momentaryTemplate = '<div class="momentary button"></div>';
var toggleTemplate = '<div class="toggle button"></div>;'

function addControl(container, elementBuilder, name, parameter) {
    var control = elementBuilder(parameter);
    var wrapped = $(controlWrapperTemplate).prepend(control);
    wrapped.find('.control-name').text(name);
    container.append(wrapped);
}

var momentaryControl = function(parameter) {
    var element = $(momentaryTemplate).data('parameter', parameter);
    var handleValue = function (element, value, skipSend) {
        element.attr('data-value', value);
        if (value === 'ON') {
            element.css('background', 'red');
        } else if (value === 'OFF') {
            element.css('background', '#29e');
        }

        if (!skipSend) sendMessage(element.data('parameter') + ' ' + value);

    };
    events.on(parameter, function (event, value) {
        console.log('received value', value, 'for parameter', parameter);
        handleValue(element, value);
    });
    element.data('handler', handleValue);
    return element;
};

var toggleControl = function(parameter) {
    var element = $(toggleTemplate).data('parameter', parameter);
    var handleValue = function (element, value, skipSend) {
        element.attr('data-value', value);
        if (value === 'ON') {
            element.css('background', 'red');
        } else if (value === 'OFF') {
            element.css('background', '#29e');
        }

        if (!skipSend) sendMessage(element.data('parameter') + ' ' + value);
    };
    events.on(parameter, function (event, value) {
        console.log('received value', value, 'for parameter', parameter);
        handleValue(element, value);
    });
    element.data('handler', handleValue);
    return element;
};

var sliderControl = function(parameter) {
    var element = $(sliderTemplate).data('parameter', parameter);
    var content = element.find('.slider_content');
    var handleValue = function (element, value, skipSend) {
        element.attr('data-value', value);
        content.css('top', (value * 100) + '%');
        element.attr('data-value', (1 - value).toFixed(2));

        if (!skipSend) sendMessage(element.data('parameter') + ' ' + (1 - value).toFixed(2));
    };
    events.on(parameter, function (event, value) {
        console.log('received value', value, 'for parameter', parameter);
        handleValue(element, value, true);
    });
    element.data('handler', handleValue);
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
    triggerMessage('/ch/02/mix/01/level 0.5');
    triggerMessage('/ch/01/mix/on ON');
}, 5000)