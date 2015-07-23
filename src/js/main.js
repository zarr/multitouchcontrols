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

        $(event.target).find('.slider_content').css('top', (value * 100) + '%');
        event.target.setAttribute('data-value', (1 - value).toFixed(2));

        sendMessage($(event.target).data('parameter') + ' ' + (1 - value).toFixed(2))
    });

interact('.toggle')
    .on('tap', function (event) {
        var isSet = ('ON' == event.target.getAttribute('data-value'));
        event.target.setAttribute('data-value', isSet ? 'OFF' : 'ON');
        event.target.style.background = isSet ? '#29e' : 'red';

        sendMessage($(event.target).data('parameter') + ' ' + (isSet ? 'OFF' : 'ON'));
    })
;

interact('.momentary')
    .on('down', function (event) {
        event.target.setAttribute('data-value', 'ON');
        event.target.style.background = 'red';
        sendMessage($(event.target).data('parameter') + ' ON');
    })
    .on('up', function (event) {
        event.target.setAttribute('data-value', 'OFF');
        event.target.style.background = '#29e';
        sendMessage($(event.target).data('parameter') + ' OFF');
    })
;

function sendMessage(message) {
    console.log(message);
    $('.log').text(message);
}

interact.maxInteractions(Infinity);   // Allow multiple interactions

var sliderTemplate = '<div class="slider"><div class="slider_content"></div></div>';
var momentaryTemplate = '<div class="momentary button"></div>';
var toggleTemplate = '<div class="toggle button"></div>;'

function addControl(template, parameter) {
    $('.container').append($(template).data('parameter', parameter));
}

addControl(sliderTemplate, '/ch/02/mix/01/level');
addControl(sliderTemplate, '/ch/03/mix/01/level');
addControl(sliderTemplate, '/ch/10/mix/01/level');
addControl(sliderTemplate, '/ch/17/mix/01/level');

addControl(momentaryTemplate, 'ch11 mix');
addControl(toggleTemplate, 'ch1 mix');

addControl(momentaryTemplate, 'ch12 mix');
addControl(toggleTemplate, 'ch2 mix');

addControl(sliderTemplate, '/ch/01/mix/02/level');
addControl(sliderTemplate, '/ch/03/mix/02/level');
addControl(sliderTemplate, '/ch/10/mix/02/level');
addControl(sliderTemplate, '/ch/17/mix/02/level');
